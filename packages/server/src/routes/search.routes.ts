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
