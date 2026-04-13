import { describe, test, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../index.js";
import {
  OpenAIREClient,
  OpenAIREError,
  setOpenAIREClient,
} from "../lib/openaire-client.js";

// ─── Sample fixtures ──────────────────────────────────────────────────────────

const PRODUCT = {
  id: "doi_________::abc123",
  originalIds: ["10.1234/test"],
  type: "publication",
  mainTitle: "Climate Change Study",
  subTitle: null,
  descriptions: ["An important study."],
  authors: [{ fullName: "Jane Doe", name: "Jane", surname: "Doe", rank: 1, pid: null }],
  publicationDate: "2024-01-15",
  publisher: "Nature",
  embargoEndDate: null,
  language: { code: "eng", label: "English" },
  countries: null,
  subjects: null,
  openAccessColor: "gold",
  publiclyFunded: false,
  isGreen: false,
  isInDiamondJournal: false,
  bestAccessRight: null,
  container: null,
  sources: null,
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
  indicators: null,
  projects: null,
  organizations: null,
  communities: null,
  collectedFrom: [],
  instances: [],
};

const ORG = {
  id: "openorgs____::abc",
  originalIds: ["ror::123"],
  legalName: "Massachusetts Institute of Technology",
  legalShortName: "MIT",
  alternativeNames: ["MIT"],
  websiteUrl: "https://mit.edu",
  country: { code: "US", label: "United States" },
  pids: [{ scheme: "ROR", value: "https://ror.org/042nb2s44" }],
};

const PROJECT = {
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
      fundingStream: { id: "EC::HE", description: "Horizon Europe" },
    },
  ],
  granted: { currency: "EUR", totalCost: 500000, fundedAmount: 400000 },
  h2020Programmes: null,
};

function paginatedOf<T>(results: T[], numFound = results.length) {
  return {
    header: { numFound, maxScore: 1.0, queryTime: 50, page: 1, pageSize: results.length || 10 },
    results,
  };
}

// ─── Mock client factory ──────────────────────────────────────────────────────

function makeMockClient(overrides: Partial<OpenAIREClient> = {}): OpenAIREClient {
  return {
    searchResearchProducts: vi.fn().mockResolvedValue(paginatedOf([PRODUCT])),
    getResearchProduct: vi.fn().mockResolvedValue(PRODUCT),
    searchOrganizations: vi.fn().mockResolvedValue(paginatedOf([ORG])),
    getOrganization: vi.fn().mockResolvedValue(ORG),
    searchProjects: vi.fn().mockResolvedValue(paginatedOf([PROJECT])),
    getProject: vi.fn().mockResolvedValue(PROJECT),
    ...overrides,
  } as unknown as OpenAIREClient;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/search/research-products", () => {
  beforeEach(() => setOpenAIREClient(makeMockClient()));

  test("returns paginated envelope with results", async () => {
    const res = await request(app).get("/api/search/research-products").expect(200);

    expect(res.body).toMatchObject({
      data: expect.arrayContaining([expect.objectContaining({ id: PRODUCT.id })]),
      meta: expect.objectContaining({
        page: expect.any(Number),
        pageSize: expect.any(Number),
        totalResults: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    });
  });

  test("passes validated query params to client", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/search/research-products")
      .query({ search: "climate", type: "publication", fromYear: "2020", toYear: "2023", page: "1", pageSize: "10" })
      .expect(200);

    expect(mockClient.searchResearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "climate",
        type: "publication",
        fromPublicationDate: "2020-01-01",
        toPublicationDate: "2023-12-31",
        page: 1,
        pageSize: 10,
      })
    );
  });

  test("maps organizationId to relOrganizationId", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/search/research-products")
      .query({ organizationId: "openorgs____::abc", projectId: "corda_____he::xyz" })
      .expect(200);

    expect(mockClient.searchResearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        relOrganizationId: "openorgs____::abc",
        relProjectId: "corda_____he::xyz",
      })
    );
  });

  test("returns 400 for invalid type enum", async () => {
    const res = await request(app)
      .get("/api/search/research-products")
      .query({ type: "invalid" })
      .expect(400);

    expect(res.body).toMatchObject({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: expect.objectContaining({ type: expect.any(Array) }),
    });
  });

  test("returns 400 for invalid year format", async () => {
    const res = await request(app)
      .get("/api/search/research-products")
      .query({ fromYear: "20ab" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.details).toHaveProperty("fromYear");
  });

  test("returns 400 for page out of range", async () => {
    const res = await request(app)
      .get("/api/search/research-products")
      .query({ page: "0" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  test("returns 400 for pageSize exceeding max", async () => {
    const res = await request(app)
      .get("/api/search/research-products")
      .query({ pageSize: "999" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  test("returns 400 for invalid openAccessColor", async () => {
    const res = await request(app)
      .get("/api/search/research-products")
      .query({ openAccessColor: "platinum" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/search/research-products/:id", () => {
  test("returns single product wrapped in data envelope", async () => {
    setOpenAIREClient(makeMockClient());

    const res = await request(app)
      .get("/api/search/research-products/doi_________::abc123")
      .expect(200);

    expect(res.body).toEqual({ data: expect.objectContaining({ id: PRODUCT.id }) });
  });

  test("returns 404 when product is not found", async () => {
    setOpenAIREClient(
      makeMockClient({
        getResearchProduct: vi.fn().mockRejectedValue(new OpenAIREError(404, "Not Found")),
      })
    );

    const res = await request(app)
      .get("/api/search/research-products/unknown::id")
      .expect(404);

    expect(res.body).toMatchObject({ error: expect.any(String), code: "NOT_FOUND" });
  });
});

describe("GET /api/search/organizations", () => {
  beforeEach(() => setOpenAIREClient(makeMockClient()));

  test("returns paginated envelope with organizations", async () => {
    const res = await request(app).get("/api/search/organizations").expect(200);

    expect(res.body.data[0]).toMatchObject({ id: ORG.id });
    expect(res.body.meta).toHaveProperty("totalResults");
  });

  test("passes countryCode to client", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/search/organizations")
      .query({ search: "CERN", countryCode: "CH" })
      .expect(200);

    expect(mockClient.searchOrganizations).toHaveBeenCalledWith(
      expect.objectContaining({ search: "CERN", countryCode: "CH" })
    );
  });

  test("returns 400 for invalid pageSize", async () => {
    const res = await request(app)
      .get("/api/search/organizations")
      .query({ pageSize: "0" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/search/organizations/:id", () => {
  test("returns single org wrapped in data envelope", async () => {
    setOpenAIREClient(makeMockClient());

    const res = await request(app)
      .get("/api/search/organizations/openorgs____::abc")
      .expect(200);

    expect(res.body).toEqual({ data: expect.objectContaining({ id: ORG.id }) });
  });

  test("returns 404 for unknown organization", async () => {
    setOpenAIREClient(
      makeMockClient({
        getOrganization: vi.fn().mockRejectedValue(new OpenAIREError(404, "Not Found")),
      })
    );

    const res = await request(app)
      .get("/api/search/organizations/unknown::id")
      .expect(404);

    expect(res.body.code).toBe("NOT_FOUND");
  });
});

describe("GET /api/search/projects", () => {
  beforeEach(() => setOpenAIREClient(makeMockClient()));

  test("returns paginated envelope with projects", async () => {
    const res = await request(app).get("/api/search/projects").expect(200);

    expect(res.body.data[0]).toMatchObject({ id: PROJECT.id });
    expect(res.body.meta).toHaveProperty("totalResults");
  });

  test("passes funderShortName and date params to client", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/search/projects")
      .query({ funderShortName: "EC", fromStartDate: "2022-01-01", toStartDate: "2024-12-31" })
      .expect(200);

    expect(mockClient.searchProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        funder: "EC",
        fromStartDate: "2022-01-01",
        toEndDate: "2024-12-31",
      })
    );
  });

  test("returns 400 for invalid page param", async () => {
    const res = await request(app)
      .get("/api/search/projects")
      .query({ page: "abc" })
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/search/projects/:id", () => {
  test("returns single project wrapped in data envelope", async () => {
    setOpenAIREClient(makeMockClient());

    const res = await request(app)
      .get("/api/search/projects/corda_____he::abc")
      .expect(200);

    expect(res.body).toEqual({ data: expect.objectContaining({ id: PROJECT.id }) });
  });

  test("returns 404 for unknown project", async () => {
    setOpenAIREClient(
      makeMockClient({
        getProject: vi.fn().mockRejectedValue(new OpenAIREError(404, "Not Found")),
      })
    );

    const res = await request(app)
      .get("/api/search/projects/unknown::id")
      .expect(404);

    expect(res.body.code).toBe("NOT_FOUND");
  });
});

describe("Error handler", () => {
  test("returns 502 for upstream 5xx errors", async () => {
    setOpenAIREClient(
      makeMockClient({
        searchResearchProducts: vi.fn().mockRejectedValue(new OpenAIREError(503, "Service Unavailable")),
      })
    );

    const res = await request(app).get("/api/search/research-products").expect(502);

    expect(res.body).toMatchObject({ code: "UPSTREAM_ERROR" });
  });

  test("returns 429 when upstream rate-limits us", async () => {
    setOpenAIREClient(
      makeMockClient({
        searchResearchProducts: vi.fn().mockRejectedValue(new OpenAIREError(429, "Rate Limited")),
      })
    );

    const res = await request(app).get("/api/search/research-products").expect(429);

    expect(res.body.code).toBe("RATE_LIMITED");
  });
});

describe("Health routes", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  test("GET /api/health/ready returns ready when OpenAIRE responds", async () => {
    setOpenAIREClient(makeMockClient());

    const res = await request(app).get("/api/health/ready").expect(200);
    expect(res.body).toMatchObject({ status: "ready" });
  });

  test("GET /api/health/ready returns 503 when OpenAIRE is unreachable", async () => {
    setOpenAIREClient(
      makeMockClient({
        searchResearchProducts: vi.fn().mockRejectedValue(new Error("Connection refused")),
      })
    );

    const res = await request(app).get("/api/health/ready").expect(503);
    expect(res.body.status).toBe("degraded");
  });
});
