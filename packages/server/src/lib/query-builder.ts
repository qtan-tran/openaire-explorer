import type {
  ResearchProductSearchParams,
  OrganizationSearchParams,
  ProjectSearchParams,
} from "@openaire-explorer/shared";

/** Raw query params sent to the OpenAIRE API (all values are strings). */
export type RawParams = Record<string, string>;

/** Remove undefined / null / empty-string values and stringify the rest. */
function clean(
  obj: Record<string, string | number | boolean | null | undefined>
): RawParams {
  const result: RawParams = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    result[key] = String(value);
  }
  return result;
}

// ─── Research Products (v2) ───────────────────────────────────────────────────

export function buildResearchProductQuery(
  params: ResearchProductSearchParams
): RawParams {
  return clean({
    // Full-text search
    search: params.search,

    // Filters
    type: params.type,
    openAccessColor: params.openAccessColor,
    bestOpenAccessRightLabel: params.bestOpenAccessRightLabel,
    isGreen: params.isGreen,

    // Date range
    fromPublicationDate: params.fromPublicationDate,
    toPublicationDate: params.toPublicationDate,

    // Identifiers
    doi: params.doi,
    orcid: params.orcid,

    // Funding
    funder: params.funder,
    fundingStream: params.fundingStream,

    // Relations
    communityList: params.communityList,
    countryCode: params.countryCode,
    relOrganizationId: params.relOrganizationId,
    relProjectId: params.relProjectId,

    // Pagination / sorting
    sortBy: params.sortBy,
    page: params.page,
    pageSize: params.pageSize,
    cursor: params.cursor,
  });
}

// ─── Organizations (v1) ───────────────────────────────────────────────────────

export function buildOrganizationQuery(
  params: OrganizationSearchParams
): RawParams {
  return clean({
    search: params.search,
    countryCode: params.countryCode,
    pid: params.pid,
    sortBy: params.sortBy,
    page: params.page,
    pageSize: params.pageSize,
    cursor: params.cursor,
  });
}

// ─── Projects (v1) ────────────────────────────────────────────────────────────

export function buildProjectQuery(params: ProjectSearchParams): RawParams {
  return clean({
    search: params.search,
    fundingStream: params.fundingStream,
    callIdentifier: params.callIdentifier,
    funder: params.funder,
    fromStartDate: params.fromStartDate,
    toEndDate: params.toEndDate,
    openAccessMandateForPublications: params.openAccessMandateForPublications,
    sortBy: params.sortBy,
    page: params.page,
    pageSize: params.pageSize,
    cursor: params.cursor,
  });
}

/** Append raw params to a URL instance. */
export function applyParams(url: URL, params: RawParams): void {
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
}
