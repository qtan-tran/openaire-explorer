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

/**
 * OpenAIRE currently rejects EMBARGOEDACCESS as a value for
 * `bestOpenAccessRightLabel` with HTTP 400.
 * We map it to RESTRICTED to keep the filter usable.
 */
function normalizeOaStatusForUpstream(
  status: SearchResearchProductsQuery["oaStatus"] | undefined
) {
  if (status === "EMBARGOEDACCESS") return "RESTRICTED";
  return status;
}

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
      const normalizedOaStatus = normalizeOaStatusForUpstream(q.oaStatus);

      const result = await client.searchResearchProducts({
        ...(q.search !== undefined && { search: q.search }),
        ...(q.type !== undefined && { type: q.type }),
        ...(q.fromYear && { fromPublicationDate: `${q.fromYear}-01-01` }),
        ...(q.toYear && { toPublicationDate: `${q.toYear}-12-31` }),
        ...(normalizedOaStatus !== undefined && {
          bestOpenAccessRightLabel: normalizedOaStatus,
        }),
        ...(q.openAccessColor !== undefined && { openAccessColor: q.openAccessColor }),
        ...(q.organizationId !== undefined && { relOrganizationId: q.organizationId }),
        ...(q.projectId !== undefined && { relProjectId: q.projectId }),
        ...(q.funderShortName !== undefined && { funder: q.funderShortName }),
        ...(q.page !== undefined && { page: q.page }),
        ...(q.pageSize !== undefined && { pageSize: q.pageSize }),
        ...(q.sortBy !== undefined && { sortBy: q.sortBy }),
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
      ...(relProjectId && { relProjectId }),
      ...(!relProjectId && relOrgId && { relOrganizationId: relOrgId }),
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
        ...(q.search !== undefined && { search: q.search }),
        ...(q.countryCode !== undefined && { countryCode: q.countryCode }),
        ...(q.page !== undefined && { page: q.page }),
        ...(q.pageSize !== undefined && { pageSize: q.pageSize }),
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
        ...(q.search !== undefined && { search: q.search }),
        ...(q.funderShortName !== undefined && { funder: q.funderShortName }),
        ...(q.fromStartDate !== undefined && { fromStartDate: q.fromStartDate }),
        ...(q.toStartDate !== undefined && { toEndDate: q.toStartDate }),
        ...(q.page !== undefined && { page: q.page }),
        ...(q.pageSize !== undefined && { pageSize: q.pageSize }),
        ...(q.sortBy !== undefined && { sortBy: q.sortBy }),
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
