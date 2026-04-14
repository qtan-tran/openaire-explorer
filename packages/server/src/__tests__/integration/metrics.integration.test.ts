import { describe, test, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../index.js";
import { OpenAIREClient, setOpenAIREClient } from "../../lib/openaire-client.js";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

function makeProduct(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    originalIds: [],
    type: "publication",
    mainTitle: `Product ${id}`,
    subTitle: null,
    descriptions: null,
    authors: [
      { fullName: "Alice Smith", name: "Alice", surname: "Smith", rank: 1, pid: null },
      { fullName: "Bob Jones", name: "Bob", surname: "Jones", rank: 2, pid: null },
    ],
    publicationDate: "2023-06-01",
    publisher: null,
    embargoEndDate: null,
    language: null,
    countries: null,
    subjects: null,
    openAccessColor: "gold",
    publiclyFunded: false,
    isGreen: false,
    isInDiamondJournal: false,
    bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
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
    pids: null,
    dateOfCollection: null,
    lastUpdateTimeStamp: null,
    indicators: null,
    projects: null,
    organizations: [{ id: "openorgs::org1", legalName: "MIT", acronym: "MIT", pids: null }],
    communities: null,
    collectedFrom: [],
    instances: [],
    ...overrides,
  };
}

function cursorResponse(results: unknown[], numFound = 10) {
  return {
    header: { numFound, maxScore: 1.0, queryTime: 50, pageSize: results.length },
    results,
  };
}

function makeMockClient(searchProductsResults: unknown[] = []): OpenAIREClient {
  return {
    searchResearchProducts: vi.fn().mockResolvedValue(cursorResponse(searchProductsResults)),
    getResearchProduct: vi.fn(),
    searchOrganizations: vi.fn(),
    getOrganization: vi.fn(),
    searchProjects: vi.fn(),
    getProject: vi.fn(),
  } as unknown as OpenAIREClient;
}

// ─── GET /api/metrics/oa-distribution ────────────────────────────────────────

describe("GET /api/metrics/oa-distribution", () => {
  test("returns empty distribution when no filters are provided", async () => {
    setOpenAIREClient(makeMockClient());
    const res = await request(app).get("/api/metrics/oa-distribution").expect(200);

    expect(res.body.data).toMatchObject({
      total: 0,
      oaRate: 0,
      byYear: [],
      distribution: {
        gold: { count: 0, percentage: 0 },
        green: { count: 0, percentage: 0 },
        hybrid: { count: 0, percentage: 0 },
        bronze: { count: 0, percentage: 0 },
        closed: { count: 0, percentage: 0 },
        unknown: { count: 0, percentage: 0 },
      },
    });
  });

  test("fetches products and computes distribution when search filter is provided", async () => {
    const products = [
      makeProduct("p1", { openAccessColor: "gold" }),
      makeProduct("p2", { openAccessColor: "gold" }),
      makeProduct("p3", { openAccessColor: null, isGreen: true }),
    ];
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/oa-distribution")
      .query({ search: "climate" })
      .expect(200);

    expect(res.body.data.total).toBe(3);
    expect(res.body.data.distribution.gold.count).toBe(2);
    expect(res.body.data.distribution.green.count).toBe(1);
    expect(res.body.data.oaRate).toBeCloseTo(1.0, 5); // all 3 are open (gold + green)
  });

  test("returns 400 for invalid fromYear", async () => {
    const res = await request(app)
      .get("/api/metrics/oa-distribution")
      .query({ fromYear: "abc" })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 400 for year out of range", async () => {
    const res = await request(app)
      .get("/api/metrics/oa-distribution")
      .query({ fromYear: "1800" })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("passes organizationId as relOrganizationId to client", async () => {
    const mockClient = makeMockClient([makeProduct("p1")]);
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/metrics/oa-distribution")
      .query({ organizationId: "openorgs____::mit001" })
      .expect(200);

    expect(mockClient.searchResearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ relOrganizationId: "openorgs____::mit001" })
    );
  });

  test("passes year filters as date strings to client", async () => {
    const mockClient = makeMockClient([makeProduct("p1")]);
    setOpenAIREClient(mockClient);

    await request(app)
      .get("/api/metrics/oa-distribution")
      .query({ search: "test", fromYear: "2020", toYear: "2023" })
      .expect(200);

    expect(mockClient.searchResearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        fromPublicationDate: "2020-01-01",
        toPublicationDate: "2023-12-31",
      })
    );
  });
});

// ─── GET /api/metrics/trends ──────────────────────────────────────────────────

describe("GET /api/metrics/trends", () => {
  test("returns empty trends when no filters are provided", async () => {
    setOpenAIREClient(makeMockClient());
    const res = await request(app).get("/api/metrics/trends").expect(200);

    expect(res.body.data).toMatchObject({
      timeSeries: [],
      cumulativeOutputs: [],
      movingAverages: [],
      summary: { totalOutputs: 0, avgYearlyGrowth: null, peakYear: "", peakCount: 0 },
    });
  });

  test("returns time series data when search filter is provided", async () => {
    const products = [
      makeProduct("p1", { publicationDate: "2021-06-01" }),
      makeProduct("p2", { publicationDate: "2022-03-15" }),
      makeProduct("p3", { publicationDate: "2022-09-20" }),
    ];
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/trends")
      .query({ search: "ai" })
      .expect(200);

    expect(res.body.data.timeSeries).toHaveLength(2); // 2021 and 2022
    expect(res.body.data.timeSeries[0].period).toBe("2021");
    expect(res.body.data.timeSeries[1].period).toBe("2022");
    expect(res.body.data.timeSeries[1].totalOutputs).toBe(2);
  });

  test("respects granularity=quarter param", async () => {
    const products = [
      makeProduct("p1", { publicationDate: "2023-01-10" }),
      makeProduct("p2", { publicationDate: "2023-04-20" }),
    ];
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/trends")
      .query({ search: "test", granularity: "quarter" })
      .expect(200);

    const periods = res.body.data.timeSeries.map((e: { period: string }) => e.period);
    expect(periods).toContain("2023-Q1");
    expect(periods).toContain("2023-Q2");
  });

  test("returns 400 for invalid granularity", async () => {
    const res = await request(app)
      .get("/api/metrics/trends")
      .query({ search: "test", granularity: "monthly" })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns cumulative outputs with trends data", async () => {
    const products = [makeProduct("p1"), makeProduct("p2")];
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/trends")
      .query({ search: "test" })
      .expect(200);

    expect(res.body.data.cumulativeOutputs).toBeDefined();
    expect(Array.isArray(res.body.data.movingAverages)).toBe(true);
    expect(res.body.data.summary.totalOutputs).toBe(2);
  });
});

// ─── GET /api/metrics/network ─────────────────────────────────────────────────

describe("GET /api/metrics/network", () => {
  test("returns empty network when no filters are provided", async () => {
    setOpenAIREClient(makeMockClient());
    const res = await request(app).get("/api/metrics/network").expect(200);

    expect(res.body.data).toMatchObject({
      nodes: [],
      edges: [],
      metrics: { nodeCount: 0, edgeCount: 0, density: 0, avgDegree: 0, topNodes: [], components: 0 },
    });
  });

  test("builds network from product data when filter is provided", async () => {
    const products = [
      makeProduct("p1"),
      makeProduct("p2", { authors: [{ fullName: "Alice Smith", name: null, surname: null, rank: 1, pid: null }, { fullName: "Bob Jones", name: null, surname: null, rank: 2, pid: null }] }),
    ];
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/network")
      .query({ search: "AI" })
      .expect(200);

    expect(res.body.data.nodes.length).toBeGreaterThan(0);
    expect(res.body.data.metrics.nodeCount).toBeGreaterThan(0);
  });

  test("respects maxNodes parameter", async () => {
    const products = Array.from({ length: 5 }, (_, i) =>
      makeProduct(`p${i}`, {
        authors: [
          { fullName: `Author A${i}`, name: null, surname: null, rank: 1, pid: null },
          { fullName: `Author B${i}`, name: null, surname: null, rank: 2, pid: null },
        ],
      })
    );
    setOpenAIREClient(makeMockClient(products));

    const res = await request(app)
      .get("/api/metrics/network")
      .query({ search: "test", maxNodes: "10" })
      .expect(200);

    expect(res.body.data.nodes.length).toBeLessThanOrEqual(10);
  });

  test("returns 400 for maxNodes below minimum (10)", async () => {
    const res = await request(app)
      .get("/api/metrics/network")
      .query({ search: "test", maxNodes: "5" })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 400 for maxNodes above maximum (300)", async () => {
    const res = await request(app)
      .get("/api/metrics/network")
      .query({ search: "test", maxNodes: "500" })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("network metrics include all expected fields", async () => {
    setOpenAIREClient(makeMockClient([makeProduct("p1"), makeProduct("p2")]));

    const res = await request(app)
      .get("/api/metrics/network")
      .query({ search: "test" })
      .expect(200);

    const { metrics } = res.body.data;
    expect(typeof metrics.nodeCount).toBe("number");
    expect(typeof metrics.edgeCount).toBe("number");
    expect(typeof metrics.density).toBe("number");
    expect(typeof metrics.avgDegree).toBe("number");
    expect(Array.isArray(metrics.topNodes)).toBe(true);
    expect(typeof metrics.components).toBe("number");
  });
});
