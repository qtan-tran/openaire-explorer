import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { OpenAIREClient, OpenAIREError, NetworkError } from "../lib/openaire-client.js";
import { TokenBucketRateLimiter } from "../lib/rate-limiter.js";
import { CacheService } from "../lib/cache.js";
import {
  buildResearchProductQuery,
  buildOrganizationQuery,
  buildProjectQuery,
} from "../lib/query-builder.js";
import {
  normalizeResearchProduct,
  normalizeOrganization,
  normalizeProject,
} from "../lib/normalizer.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeHeaders(extra: Record<string, string> = {}): Headers {
  return new Headers({
    "content-type": "application/json",
    "x-ratelimit-limit": "7199",
    "x-ratelimit-used": "1",
    ...extra,
  });
}

function mockResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: makeHeaders(extraHeaders),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

const SAMPLE_PRODUCT = {
  id: "doi_________::abc123",
  originalIds: ["10.1234/test"],
  type: "publication",
  mainTitle: "Climate Change Study",
  subTitle: null,
  descriptions: ["An important study."],
  authors: [
    { fullName: "Jane Doe", name: "Jane", surname: "Doe", rank: 1, pid: null },
  ],
  publicationDate: "2024-01-15",
  publisher: "Nature",
  embargoEndDate: null,
  language: { code: "eng", label: "English" },
  countries: null,
  subjects: [{ subject: { scheme: "FOS", value: "01 natural sciences" }, provenance: null }],
  openAccessColor: "gold",
  publiclyFunded: false,
  isGreen: false,
  isInDiamondJournal: false,
  bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "http://coar.org" },
  container: { name: "Nature", issnPrinted: null, issnOnline: "1234-5678", issnLinking: null, ep: null, sp: null, iss: null, vol: "10", edition: null, conferencePlace: null, conferenceDate: null },
  sources: ["Crossref"],
  formats: null,
  contributors: null,
  coverages: null,
  documentationUrls: null,
  codeRepositoryUrl: null,
  programmingLanguage: null,
  contactPeople: null,
  contactGroups: null,
  tools: null,
  size: null,
  version: null,
  geoLocations: null,
  pids: [{ scheme: "doi", value: "10.1234/test" }],
  dateOfCollection: null,
  lastUpdateTimeStamp: null,
  indicators: { citationImpact: { citationCount: 5, influence: 1e-9, popularity: 1e-9, impulse: 5, citationClass: "C4", influenceClass: "C5", impulseClass: "C4", popularityClass: "C4" } },
  projects: null,
  organizations: [{ id: "openorgs____::abc", legalName: "MIT", acronym: "MIT", pids: null }],
  communities: null,
  collectedFrom: [{ key: "crossref", value: "Crossref" }],
  instances: [
    {
      pids: [{ scheme: "doi", value: "10.1234/test" }],
      license: "CC BY",
      accessRight: { code: "c_abf2", label: "OPEN", scheme: "http://coar.org", openAccessRoute: "gold" },
      type: "Article",
      urls: ["https://doi.org/10.1234/test"],
      publicationDate: "2024-01-15",
      refereed: "peerReviewed",
      hostedBy: { key: "nature", value: "Nature" },
    },
  ],
};

const SAMPLE_ORG = {
  id: "openorgs____::abc",
  originalIds: ["ror::123"],
  legalName: "Massachusetts Institute of Technology",
  legalShortName: "MIT",
  alternativeNames: ["MIT"],
  websiteUrl: "https://mit.edu",
  country: { code: "US", label: "United States" },
  pids: [{ scheme: "ROR", value: "https://ror.org/042nb2s44" }],
};

const SAMPLE_PROJECT = {
  id: "corda_____he::abc",
  originalIds: ["corda::abc"],
  code: "101056649",
  acronym: "TESTPROJ",
  title: "Test Horizon Project",
  websiteUrl: null,
  startDate: "2022-01-01",
  endDate: "2024-12-31",
  callIdentifier: "HORIZON-2021",
  keywords: null,
  openAccessMandateForPublications: true,
  openAccessMandateForDataset: false,
  subjects: ["AI"],
  summary: "A test project summary.",
  fundings: [
    {
      shortName: "EC",
      name: "European Commission",
      jurisdiction: "EU",
      fundingStream: { id: "EC::HE::HORIZON-AG", description: "Horizon Europe" },
    },
  ],
  granted: { currency: "EUR", totalCost: 500000, fundedAmount: 400000 },
  h2020Programmes: null,
};

function paginatedResponse<T>(results: T[], numFound = results.length) {
  return {
    header: { numFound, maxScore: 1.0, queryTime: 50, page: 1, pageSize: results.length },
    results,
  };
}

function cursorResponse<T>(results: T[], nextCursor: string | null, numFound = 100) {
  return {
    header: { numFound, maxScore: 1.0, queryTime: 50, pageSize: results.length, ...(nextCursor ? { nextCursor } : {}) },
    results,
  };
}

// ─── Query builder tests ──────────────────────────────────────────────────────

describe("buildResearchProductQuery", () => {
  test("maps all search params correctly", () => {
    const result = buildResearchProductQuery({
      search: "climate",
      type: "publication",
      openAccessColor: "gold",
      isGreen: true,
      fromPublicationDate: "2020-01-01",
      toPublicationDate: "2024-12-31",
      funder: "EC",
      page: 2,
      pageSize: 20,
    });

    expect(result).toMatchObject({
      search: "climate",
      type: "publication",
      openAccessColor: "gold",
      isGreen: "true",
      fromPublicationDate: "2020-01-01",
      toPublicationDate: "2024-12-31",
      funder: "EC",
      page: "2",
      pageSize: "20",
    });
  });

  test("omits undefined and empty values", () => {
    const result = buildResearchProductQuery({ search: "test", type: undefined });
    expect(result).not.toHaveProperty("type");
    expect(result).toHaveProperty("search", "test");
  });

  test("includes cursor param when provided", () => {
    const result = buildResearchProductQuery({ cursor: "AoM/abc==" });
    expect(result).toHaveProperty("cursor", "AoM/abc==");
  });

  test("includes relOrganizationId and relProjectId", () => {
    const result = buildResearchProductQuery({
      relOrganizationId: "openorgs____::abc",
      relProjectId: "corda_____he::xyz",
    });
    expect(result).toMatchObject({
      relOrganizationId: "openorgs____::abc",
      relProjectId: "corda_____he::xyz",
    });
  });
});

describe("buildOrganizationQuery", () => {
  test("maps countryCode and pid", () => {
    const result = buildOrganizationQuery({ search: "CERN", countryCode: "CH", pid: "ror:123" });
    expect(result).toMatchObject({ search: "CERN", countryCode: "CH", pid: "ror:123" });
  });
});

describe("buildProjectQuery", () => {
  test("maps funding and date params", () => {
    const result = buildProjectQuery({
      search: "horizon",
      funder: "EC",
      fundingStream: "HE",
      fromStartDate: "2021-01-01",
      openAccessMandateForPublications: true,
    });
    expect(result).toMatchObject({
      search: "horizon",
      funder: "EC",
      fundingStream: "HE",
      fromStartDate: "2021-01-01",
      openAccessMandateForPublications: "true",
    });
  });
});

// ─── Cache tests ──────────────────────────────────────────────────────────────

describe("CacheService", () => {
  test("stores and retrieves values", () => {
    const cache = new CacheService(60);
    cache.set("key1", { foo: "bar" });
    expect(cache.get("key1")).toEqual({ foo: "bar" });
  });

  test("returns undefined for missing keys", () => {
    const cache = new CacheService(60);
    expect(cache.get("missing")).toBeUndefined();
  });

  test("del removes a key", () => {
    const cache = new CacheService(60);
    cache.set("k", 42);
    cache.del("k");
    expect(cache.get("k")).toBeUndefined();
  });

  test("flush clears all keys", () => {
    const cache = new CacheService(60);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.flush();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });

  test("buildKey sorts params deterministically", () => {
    const k1 = CacheService.buildKey("/v2/researchProducts", { pageSize: "10", search: "covid" });
    const k2 = CacheService.buildKey("/v2/researchProducts", { search: "covid", pageSize: "10" });
    expect(k1).toBe(k2);
  });

  test("buildKey omits null/undefined/empty params", () => {
    const k = CacheService.buildKey("/v1/orgs", { search: "CERN", page: undefined, foo: "" });
    expect(k).not.toContain("page");
    expect(k).not.toContain("foo");
    expect(k).toContain("search=CERN");
  });
});

// ─── Normalizer tests ─────────────────────────────────────────────────────────

describe("normalizeResearchProduct", () => {
  test("normalizes a complete product", () => {
    const result = normalizeResearchProduct(SAMPLE_PRODUCT);
    expect(result.id).toBe("doi_________::abc123");
    expect(result.mainTitle).toBe("Climate Change Study");
    expect(result.openAccessColor).toBe("gold");
    expect(result.authors).toHaveLength(1);
    expect(result.authors[0]?.fullName).toBe("Jane Doe");
    expect(result.instances).toHaveLength(1);
    expect(result.indicators?.citationImpact.citationCount).toBe(5);
  });

  test("handles missing optional fields gracefully", () => {
    const minimal = { id: "test::1", type: "publication", mainTitle: "Minimal" };
    const result = normalizeResearchProduct(minimal);
    expect(result.id).toBe("test::1");
    expect(result.descriptions).toBeNull();
    expect(result.authors).toEqual([]);
    expect(result.instances).toEqual([]);
    expect(result.isGreen).toBe(false);
    expect(result.publiclyFunded).toBe(false);
  });

  test("throws on non-object input", () => {
    expect(() => normalizeResearchProduct(null)).toThrow(TypeError);
    expect(() => normalizeResearchProduct("string")).toThrow(TypeError);
  });

  test("normalizes subject entries", () => {
    const result = normalizeResearchProduct(SAMPLE_PRODUCT);
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects?.[0]?.subject.scheme).toBe("FOS");
  });
});

describe("normalizeOrganization", () => {
  test("normalizes a complete org", () => {
    const result = normalizeOrganization(SAMPLE_ORG);
    expect(result.legalName).toBe("Massachusetts Institute of Technology");
    expect(result.legalShortName).toBe("MIT");
    expect(result.country?.code).toBe("US");
    expect(result.pids).toHaveLength(1);
  });

  test("handles null country and pids", () => {
    const result = normalizeOrganization({
      id: "pending::1",
      legalName: "Unknown Org",
      originalIds: [],
      pids: null,
      country: null,
    });
    expect(result.country).toBeNull();
    expect(result.pids).toBeNull();
  });
});

describe("normalizeProject", () => {
  test("normalizes a complete project", () => {
    const result = normalizeProject(SAMPLE_PROJECT);
    expect(result.code).toBe("101056649");
    expect(result.openAccessMandateForPublications).toBe(true);
    expect(result.fundings).toHaveLength(1);
    expect(result.fundings[0]?.shortName).toBe("EC");
    expect(result.granted?.fundedAmount).toBe(400000);
  });

  test("handles missing granted", () => {
    const result = normalizeProject({ ...SAMPLE_PROJECT, granted: null });
    expect(result.granted).toBeNull();
  });
});

// ─── Rate limiter tests ───────────────────────────────────────────────────────

describe("TokenBucketRateLimiter", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  test("resolves immediately when tokens are available", async () => {
    const limiter = new TokenBucketRateLimiter(5, 5);
    const results: number[] = [];
    // 5 concurrent acquires — all should resolve without waiting
    const promises = Array.from({ length: 5 }, (_, i) =>
      limiter.acquire().then(() => results.push(i))
    );
    await Promise.all(promises);
    expect(results).toHaveLength(5);
  });

  test("queues requests beyond capacity and releases them after refill", async () => {
    const limiter = new TokenBucketRateLimiter(1, 1); // 1 req/s
    let resolved = false;

    const p1 = limiter.acquire(); // consumes the only token
    const p2 = limiter.acquire().then(() => { resolved = true; }); // must wait

    await p1; // resolves immediately

    expect(resolved).toBe(false);

    // Advance time by 1 second to refill 1 token
    vi.advanceTimersByTime(1100);
    await p2;

    expect(resolved).toBe(true);
  });
});

// ─── OpenAIREClient integration tests ────────────────────────────────────────

describe("OpenAIREClient", () => {
  let client: OpenAIREClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    client = new OpenAIREClient({
      baseUrl: "https://api.openaire.eu/graph",
      timeout: 5000,
      maxRetries: 3,
      rateLimit: 100, // high limit so tests don't wait
      cacheTtl: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    client.cache.flush();
  });

  // ── Search methods ──────────────────────────────────────────────────────────

  test("searchResearchProducts builds correct URL and returns typed results", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(paginatedResponse([SAMPLE_PRODUCT]))
    );

    const result = await client.searchResearchProducts({
      search: "climate",
      openAccessColor: "gold",
      pageSize: 10,
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.mainTitle).toBe("Climate Change Study");

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("/v2/researchProducts");
    expect(url).toContain("search=climate");
    expect(url).toContain("openAccessColor=gold");
    expect(url).toContain("pageSize=10");
  });

  test("searchOrganizations returns normalized organizations", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(paginatedResponse([SAMPLE_ORG]))
    );

    const result = await client.searchOrganizations({ search: "CERN" });
    expect(result.results[0]?.legalName).toBe("Massachusetts Institute of Technology");

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("/v1/organizations");
    expect(url).toContain("search=CERN");
  });

  test("searchProjects returns normalized projects", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(paginatedResponse([SAMPLE_PROJECT]))
    );

    const result = await client.searchProjects({ search: "horizon", funder: "EC" });
    expect(result.results[0]?.code).toBe("101056649");
    expect(result.results[0]?.fundings[0]?.shortName).toBe("EC");

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("funder=EC");
  });

  // ── Retry logic ─────────────────────────────────────────────────────────────

  test("retries on 429 and succeeds on subsequent call", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse({}, 429, { "Retry-After": "0" }))
      .mockResolvedValueOnce(mockResponse(paginatedResponse([SAMPLE_PRODUCT])));

    vi.useFakeTimers();
    // Attach assertion BEFORE timers fire to avoid unhandled-rejection warnings
    let result: Awaited<ReturnType<typeof client.searchResearchProducts>> | undefined;
    const p = client.searchResearchProducts({ search: "test" }).then((r) => { result = r; });
    await vi.runAllTimersAsync();
    await p;
    vi.useRealTimers();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result?.results).toHaveLength(1);
  });

  test("throws OpenAIREError after exhausting retries on 5xx", async () => {
    mockFetch.mockResolvedValue(mockResponse("Server Error", 500));

    vi.useFakeTimers();
    // Capture the rejection immediately so it's never "unhandled"
    let capturedError: unknown;
    const p = client
      .searchResearchProducts({ search: "test" })
      .catch((e) => { capturedError = e; });
    await vi.runAllTimersAsync();
    await p;
    vi.useRealTimers();

    expect(capturedError).toBeInstanceOf(OpenAIREError);
    // 1 initial attempt + 3 retries
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  test("throws immediately on 4xx (not 429)", async () => {
    mockFetch.mockResolvedValueOnce(mockResponse("Not Found", 404));

    await expect(
      client.searchResearchProducts({ search: "test" })
    ).rejects.toBeInstanceOf(OpenAIREError);

    // No retries for 404
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("retries on network error and eventually throws NetworkError", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));

    vi.useFakeTimers();
    let capturedError: unknown;
    const p = client
      .searchResearchProducts({ search: "test" })
      .catch((e) => { capturedError = e; });
    await vi.runAllTimersAsync();
    await p;
    vi.useRealTimers();

    expect(capturedError).toBeInstanceOf(NetworkError);
    expect(mockFetch).toHaveBeenCalledTimes(4); // 1 + 3 retries
  });

  // ── Cache ────────────────────────────────────────────────────────────────────

  test("returns cached response on second call without fetching again", async () => {
    mockFetch.mockResolvedValue(
      mockResponse(paginatedResponse([SAMPLE_PRODUCT]))
    );

    await client.searchResearchProducts({ search: "cache-test" });
    await client.searchResearchProducts({ search: "cache-test" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // ── fetchAllPages ────────────────────────────────────────────────────────────

  test("fetchAllPages iterates cursor pages until exhausted", async () => {
    // Page 1 → nextCursor present
    mockFetch.mockResolvedValueOnce(
      mockResponse(cursorResponse([SAMPLE_PRODUCT], "cursor_page2", 2))
    );
    // Page 2 → no nextCursor
    mockFetch.mockResolvedValueOnce(
      mockResponse(cursorResponse([SAMPLE_PRODUCT], null, 2))
    );

    const results = await client.fetchAllPages<unknown>(
      "/v2/researchProducts",
      { search: "test" }
    );

    expect(results).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Second call should include nextCursor from first response
    const [secondUrl] = mockFetch.mock.calls[1] as [string];
    expect(secondUrl).toContain("cursor=cursor_page2");
  });

  test("fetchAllPages respects maxPages limit", async () => {
    // Use distinct cursors per page so each request has a unique cache key
    mockFetch
      .mockResolvedValueOnce(mockResponse(cursorResponse([SAMPLE_PRODUCT], "cursor_p2", 999)))
      .mockResolvedValueOnce(mockResponse(cursorResponse([SAMPLE_PRODUCT], "cursor_p3", 999)))
      .mockResolvedValueOnce(mockResponse(cursorResponse([SAMPLE_PRODUCT], "cursor_p4", 999)));

    const results = await client.fetchAllPages<unknown>(
      "/v2/researchProducts",
      {},
      3 // maxPages = 3
    );

    expect(results).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test("fetchAllPages stops when results is empty", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(cursorResponse([], "cursor2", 0))
    );

    const results = await client.fetchAllPages<unknown>("/v2/researchProducts", {});
    expect(results).toHaveLength(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("fetchAllPages calls onProgress callback", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(cursorResponse([SAMPLE_PRODUCT], "c2", 2)))
      .mockResolvedValueOnce(mockResponse(cursorResponse([SAMPLE_PRODUCT], null, 2)));

    const progress: [number, number][] = [];
    await client.fetchAllPages<unknown>(
      "/v2/researchProducts",
      {},
      10,
      (fetched, total) => progress.push([fetched, total])
    );

    expect(progress).toEqual([[1, 2], [2, 2]]);
  });
});
