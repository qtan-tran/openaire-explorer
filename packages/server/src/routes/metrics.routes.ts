import { Router } from "express";
import { z } from "zod";
import { getOpenAIREClient } from "../lib/openaire-client.js";
import {
  computeOADistribution,
  computeTrendsData,
} from "../lib/metrics-computer.js";
import { buildCollaborationGraph } from "../lib/graph-builder.js";
import { streamProducts } from "../lib/stream-fetcher.js";
import { CacheService } from "../lib/cache.js";
import type { ResearchProduct, ResearchProductSearchParams } from "@openaire-explorer/shared";

export const metricsRouter = Router();

// ─── Cache (5-min TTL) ────────────────────────────────────────────────────────
const metricsCache = new CacheService(300);

// ─── Shared schema primitives ─────────────────────────────────────────────────
const year = z.coerce.number().int().min(1900).max(2100).optional();

const baseFiltersSchema = z.object({
  search: z.string().optional(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  funderShortName: z.string().optional(),
  fromYear: year,
  toYear: year,
});

const oaDistributionSchema = baseFiltersSchema;

const trendsSchema = baseFiltersSchema.extend({
  granularity: z.enum(["year", "quarter"]).optional().default("year"),
});

const networkSchema = baseFiltersSchema.extend({
  maxNodes: z.coerce.number().int().min(10).max(300).optional().default(100),
});

// ─── Cursor-paginate up to N products ────────────────────────────────────────
async function fetchProducts(
  params: ResearchProductSearchParams,
  maxResults = 2000
) {
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

// ─── GET /api/metrics/oa-distribution ────────────────────────────────────────
metricsRouter.get("/oa-distribution", async (req, res, next) => {
  const parse = oaDistributionSchema.safeParse(req.query);
  if (!parse.success) {
    res
      .status(400)
      .json({ error: "Invalid query params", details: parse.error.flatten() });
    return;
  }

  const q = parse.data;
  const cacheKey = CacheService.buildKey(
    "metrics/oa-distribution",
    q as Record<string, string | number | undefined>
  );
  const cached = metricsCache.get(cacheKey);
  if (cached) {
    res.json({ data: cached });
    return;
  }

  try {
    const hasFilter =
      q.search ||
      q.organizationId ||
      q.projectId ||
      q.funderShortName ||
      q.fromYear ||
      q.toYear;

    if (!hasFilter) {
      res.json({
        data: {
          total: 0,
          distribution: {
            gold: { count: 0, percentage: 0 },
            green: { count: 0, percentage: 0 },
            hybrid: { count: 0, percentage: 0 },
            bronze: { count: 0, percentage: 0 },
            closed: { count: 0, percentage: 0 },
            unknown: { count: 0, percentage: 0 },
          },
          byYear: [],
          oaRate: 0,
          oaRateByYear: [],
        },
      });
      return;
    }

    const products = await fetchProducts({
      ...(q.search && { search: q.search }),
      ...(q.organizationId && { relOrganizationId: q.organizationId }),
      ...(q.projectId && { relProjectId: q.projectId }),
      ...(q.funderShortName && { funder: q.funderShortName }),
      ...(q.fromYear && { fromPublicationDate: `${q.fromYear}-01-01` }),
      ...(q.toYear && { toPublicationDate: `${q.toYear}-12-31` }),
    });

    const result = computeOADistribution(products);
    metricsCache.set(cacheKey, result);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/metrics/trends ──────────────────────────────────────────────────
metricsRouter.get("/trends", async (req, res, next) => {
  const parse = trendsSchema.safeParse(req.query);
  if (!parse.success) {
    res
      .status(400)
      .json({ error: "Invalid query params", details: parse.error.flatten() });
    return;
  }

  const q = parse.data;
  const cacheKey = CacheService.buildKey(
    "metrics/trends",
    q as Record<string, string | number | undefined>
  );
  const cached = metricsCache.get(cacheKey);
  if (cached) {
    res.json({ data: cached });
    return;
  }

  try {
    const hasFilter =
      q.search ||
      q.organizationId ||
      q.projectId ||
      q.funderShortName ||
      q.fromYear ||
      q.toYear;

    if (!hasFilter) {
      res.json({
        data: {
          timeSeries: [],
          cumulativeOutputs: [],
          movingAverages: [],
          summary: { totalOutputs: 0, avgYearlyGrowth: null, peakYear: "", peakCount: 0 },
        },
      });
      return;
    }

    const products = await fetchProducts({
      ...(q.search && { search: q.search }),
      ...(q.organizationId && { relOrganizationId: q.organizationId }),
      ...(q.projectId && { relProjectId: q.projectId }),
      ...(q.funderShortName && { funder: q.funderShortName }),
      ...(q.fromYear && { fromPublicationDate: `${q.fromYear}-01-01` }),
      ...(q.toYear && { toPublicationDate: `${q.toYear}-12-31` }),
    });

    const result = computeTrendsData(products, q.granularity);
    metricsCache.set(cacheKey, result);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/metrics/network ─────────────────────────────────────────────────
metricsRouter.get("/network", async (req, res, next) => {
  const parse = networkSchema.safeParse(req.query);
  if (!parse.success) {
    res
      .status(400)
      .json({ error: "Invalid query params", details: parse.error.flatten() });
    return;
  }

  const q = parse.data;
  const cacheKey = CacheService.buildKey(
    "metrics/network",
    q as Record<string, string | number | undefined>
  );
  const cached = metricsCache.get(cacheKey);
  if (cached) {
    res.json({ data: cached });
    return;
  }

  try {
    const hasFilter =
      q.search ||
      q.organizationId ||
      q.projectId ||
      q.funderShortName ||
      q.fromYear ||
      q.toYear;

    if (!hasFilter) {
      res.json({
        data: {
          nodes: [],
          edges: [],
          metrics: { nodeCount: 0, edgeCount: 0, density: 0, avgDegree: 0, topNodes: [], components: 0 },
        },
      });
      return;
    }

    const products = await fetchProducts(
      {
        ...(q.search && { search: q.search }),
        ...(q.organizationId && { relOrganizationId: q.organizationId }),
        ...(q.projectId && { relProjectId: q.projectId }),
        ...(q.funderShortName && { funder: q.funderShortName }),
        ...(q.fromYear && { fromPublicationDate: `${q.fromYear}-01-01` }),
        ...(q.toYear && { toPublicationDate: `${q.toYear}-12-31` }),
      },
      500 // cap at 500 products for graph building
    );

    const result = buildCollaborationGraph({ products, maxNodes: q.maxNodes });
    metricsCache.set(cacheKey, result);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/metrics/oa-distribution/stream (SSE) ───────────────────────────
metricsRouter.get("/oa-distribution/stream", async (req, res, next) => {
  const parse = oaDistributionSchema.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query params", details: parse.error.flatten() });
    return;
  }

  const q = parse.data;

  try {
    await streamProducts(res, {
      params: {
        ...(q.search && { search: q.search }),
        ...(q.organizationId && { relOrganizationId: q.organizationId }),
        ...(q.projectId && { relProjectId: q.projectId }),
        ...(q.funderShortName && { funder: q.funderShortName }),
        ...(q.fromYear && { fromPublicationDate: `${q.fromYear}-01-01` }),
        ...(q.toYear && { toPublicationDate: `${q.toYear}-12-31` }),
      },
      maxResults: 2000,
    });
  } catch (err) {
    next(err);
  }
});
