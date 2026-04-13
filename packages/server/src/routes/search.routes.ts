import { Router } from "express";
import type { OffsetHeader } from "@openaire-explorer/shared";
import type { PaginatedResponse } from "@openaire-explorer/shared";
import { getOpenAIREClient } from "../lib/openaire-client.js";
import { validate } from "../middleware/validate.js";
import {
  searchResearchProductsSchema,
  searchOrganizationsSchema,
  searchProjectsSchema,
  type SearchResearchProductsQuery,
  type SearchOrganizationsQuery,
  type SearchProjectsQuery,
} from "../schemas/search.schema.js";

export const searchRouter = Router();

// ─── Envelope helpers ─────────────────────────────────────────────────────────

function paginated<T>(
  response: PaginatedResponse<T>,
  page: number,
  pageSize: number
) {
  const header = response.header as OffsetHeader;
  const totalResults = header.numFound ?? 0;
  const effectivePageSize = pageSize || header.pageSize || 20;
  return {
    data: response.results,
    meta: {
      page: page || header.page || 1,
      pageSize: effectivePageSize,
      totalResults,
      totalPages: Math.ceil(totalResults / effectivePageSize) || 0,
    },
  };
}

function single<T>(entity: T) {
  return { data: entity };
}

// ─── Research Products ────────────────────────────────────────────────────────

searchRouter.get(
  "/research-products",
  validate(searchResearchProductsSchema),
  async (req, res, next) => {
    try {
      const q = req.query as unknown as SearchResearchProductsQuery;
      const client = getOpenAIREClient();

      const result = await client.searchResearchProducts({
        search: q.search,
        type: q.type,
        fromPublicationDate: q.fromYear ? `${q.fromYear}-01-01` : undefined,
        toPublicationDate: q.toYear ? `${q.toYear}-12-31` : undefined,
        bestOpenAccessRightLabel: q.oaStatus,
        openAccessColor: q.openAccessColor,
        relOrganizationId: q.organizationId,
        relProjectId: q.projectId,
        funder: q.funderShortName,
        page: q.page,
        pageSize: q.pageSize,
        sortBy: q.sortBy,
      });

      res.json(paginated(result, q.page ?? 1, q.pageSize ?? 10));
    } catch (err) {
      next(err);
    }
  }
);

searchRouter.get("/research-products/:id", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const product = await client.getResearchProduct(req.params["id"]!);
    res.json(single(product));
  } catch (err) {
    next(err);
  }
});

searchRouter.get("/research-products/:id/related", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const id = req.params["id"]!;
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query["pageSize"] ?? "6"), 10) || 6));

    // Fetch the product to discover its related project/org IDs
    const product = await client.getResearchProduct(id);
    const relProjectId = product.projects?.[0]?.id;
    const relOrgId = product.organizations?.[0]?.id;

    if (!relProjectId && !relOrgId) {
      res.json({ data: [], meta: { page: 1, pageSize, totalResults: 0, totalPages: 0 } });
      return;
    }

    const result = await client.searchResearchProducts({
      relProjectId: relProjectId,
      relOrganizationId: relProjectId ? undefined : relOrgId,
      page,
      pageSize: pageSize + 1, // fetch one extra to filter out self
    });

    // Exclude the source product
    const filtered = result.results.filter((p) => p.id !== id).slice(0, pageSize);
    res.json(paginated({ header: result.header, results: filtered }, page, pageSize));
  } catch (err) {
    next(err);
  }
});

// ─── Organizations ────────────────────────────────────────────────────────────

searchRouter.get(
  "/organizations",
  validate(searchOrganizationsSchema),
  async (req, res, next) => {
    try {
      const q = req.query as unknown as SearchOrganizationsQuery;
      const client = getOpenAIREClient();

      const result = await client.searchOrganizations({
        search: q.search,
        countryCode: q.countryCode,
        page: q.page,
        pageSize: q.pageSize,
      });

      res.json(paginated(result, q.page ?? 1, q.pageSize ?? 10));
    } catch (err) {
      next(err);
    }
  }
);

searchRouter.get("/organizations/:id", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const org = await client.getOrganization(req.params["id"]!);
    res.json(single(org));
  } catch (err) {
    next(err);
  }
});

searchRouter.get("/organizations/:id/products", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query["pageSize"] ?? "10"), 10) || 10));

    const result = await client.searchResearchProducts({
      relOrganizationId: req.params["id"]!,
      page,
      pageSize,
    });
    res.json(paginated(result, page, pageSize));
  } catch (err) {
    next(err);
  }
});

// ─── Projects ─────────────────────────────────────────────────────────────────

searchRouter.get(
  "/projects",
  validate(searchProjectsSchema),
  async (req, res, next) => {
    try {
      const q = req.query as unknown as SearchProjectsQuery;
      const client = getOpenAIREClient();

      const result = await client.searchProjects({
        search: q.search,
        funder: q.funderShortName,
        fromStartDate: q.fromStartDate,
        toEndDate: q.toStartDate,
        page: q.page,
        pageSize: q.pageSize,
        sortBy: q.sortBy,
      });

      res.json(paginated(result, q.page ?? 1, q.pageSize ?? 10));
    } catch (err) {
      next(err);
    }
  }
);

searchRouter.get("/projects/:id", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const project = await client.getProject(req.params["id"]!);
    res.json(single(project));
  } catch (err) {
    next(err);
  }
});

searchRouter.get("/projects/:id/products", async (req, res, next) => {
  try {
    const client = getOpenAIREClient();
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query["pageSize"] ?? "10"), 10) || 10));

    const result = await client.searchResearchProducts({
      relProjectId: req.params["id"]!,
      page,
      pageSize,
    });
    res.json(paginated(result, page, pageSize));
  } catch (err) {
    next(err);
  }
});
