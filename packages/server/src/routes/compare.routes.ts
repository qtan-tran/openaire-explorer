import { Router } from "express";
import { z } from "zod";
import { getOpenAIREClient } from "../lib/openaire-client.js";
import { computeEntityMetrics } from "../lib/metrics-computer.js";
import { CacheService } from "../lib/cache.js";
import type {
  ComparisonEntity,
  ComparisonResult,
  ResearchProduct,
  ResearchProductSearchParams,
} from "@openaire-explorer/shared";

export const compareRouter = Router();

// ─── Comparison cache (10-min TTL) ────────────────────────────────────────────
const compareCache = new CacheService(600);

// ─── Request schema ───────────────────────────────────────────────────────────
const compareBodySchema = z.object({
  entities: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["research-product", "organization", "project"]),
      })
    )
    .min(1)
    .max(5),
  filters: z
    .object({
      fromYear: z.number().int().min(1900).max(2100).optional(),
      toYear: z.number().int().min(1900).max(2100).optional(),
    })
    .optional(),
});

// ─── Cursor-paginate up to 500 products ──────────────────────────────────────
async function fetchProducts(
  params: ResearchProductSearchParams,
  maxResults = 500
): Promise<ResearchProduct[]> {
  const client = getOpenAIREClient();
  const all: ResearchProduct[] = [];
  let cursor = "*";
  const pageSize = 100;

  while (all.length < maxResults) {
    const result = await client.searchResearchProducts({
      ...params,
      cursor,
      pageSize,
    });

    all.push(...result.results);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextCursor = (result.header as any).nextCursor as string | undefined;
    if (!nextCursor || result.results.length === 0) break;

    cursor = nextCursor;
  }

  return all.slice(0, maxResults);
}

// ─── POST /api/compare ────────────────────────────────────────────────────────
compareRouter.post("/", async (req, res, next) => {
  const parse = compareBodySchema.safeParse(req.body);
  if (!parse.success) {
    res
      .status(400)
      .json({ error: "Invalid request body", details: parse.error.flatten() });
    return;
  }

  const { entities, filters } = parse.data;

  // Deterministic cache key — sort entity IDs so order doesn't matter
  const sortedIds = [...entities].sort((a, b) => a.id.localeCompare(b.id));
  const cacheKey = `compare:${sortedIds.map((e) => e.id).join(",")}:${JSON.stringify(filters ?? {})}`;

  const cached = compareCache.get<ComparisonResult>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const client = getOpenAIREClient();

    const yearFilter: Partial<ResearchProductSearchParams> = {
      ...(filters?.fromYear
        ? { fromPublicationDate: `${filters.fromYear}-01-01` }
        : {}),
      ...(filters?.toYear
        ? { toPublicationDate: `${filters.toYear}-12-31` }
        : {}),
    };

    // Fetch all entities in parallel; within each org/project, also fetch
    // entity metadata and products concurrently via inner Promise.all.
    const resolved = await Promise.all(
      entities.map(async (entity) => {
        let name: string;
        let products: ResearchProduct[];

        if (entity.type === "organization") {
          const [org, prods] = await Promise.all([
            client.getOrganization(entity.id),
            fetchProducts({ relOrganizationId: entity.id, ...yearFilter }),
          ]);
          name = org.legalName;
          products = prods;
        } else if (entity.type === "project") {
          const [project, prods] = await Promise.all([
            client.getProject(entity.id),
            fetchProducts({ relProjectId: entity.id, ...yearFilter }),
          ]);
          name = project.title;
          products = prods;
        } else {
          const product = await client.getResearchProduct(entity.id);
          name = product.mainTitle;
          products = [product];
        }

        return {
          entity: { id: entity.id, type: entity.type, name } as ComparisonEntity,
          metrics: computeEntityMetrics(entity.id, products),
        };
      })
    );

    const result: ComparisonResult = {
      entities: resolved.map((r) => r.entity),
      metrics:  resolved.map((r) => r.metrics),
      computedAt: new Date().toISOString(),
    };

    compareCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
