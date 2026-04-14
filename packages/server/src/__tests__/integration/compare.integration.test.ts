import { describe, test, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../index.js";
import { OpenAIREClient, setOpenAIREClient } from "../../lib/openaire-client.js";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const ORG = {
  id: "openorgs____::mit001",
  originalIds: ["ror::042nb2s44"],
  legalName: "Massachusetts Institute of Technology",
  legalShortName: "MIT",
  alternativeNames: ["MIT"],
  websiteUrl: "https://mit.edu",
  country: { code: "US", label: "United States" },
  pids: [{ scheme: "ROR", value: "https://ror.org/042nb2s44" }],
};

const PROJECT = {
  id: "corda_____he::proj001",
  originalIds: ["corda::101056649"],
  code: "101056649",
  acronym: "CLIMATEAI",
  title: "AI-Driven Climate Research",
  websiteUrl: null,
  startDate: "2022-01-01",
  endDate: "2024-12-31",
  callIdentifier: "HORIZON-2021",
  keywords: null,
  openAccessMandateForPublications: true,
  openAccessMandateForDataset: false,
  subjects: null,
  summary: "Climate AI project summary.",
  fundings: [{ shortName: "EC", name: "European Commission", jurisdiction: "EU", fundingStream: { id: "EC::HE", description: "Horizon Europe" } }],
  granted: { currency: "EUR", totalCost: 2000000, fundedAmount: 2000000 },
  h2020Programmes: null,
};

const PRODUCT = {
  id: "doi_________::abc123",
  originalIds: [],
  type: "publication",
  mainTitle: "Climate Study",
  subTitle: null,
  descriptions: null,
  authors: [{ fullName: "Jane Doe", name: "Jane", surname: "Doe", rank: 1, pid: null }],
  publicationDate: "2023-01-01",
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
  organizations: null,
  communities: null,
  collectedFrom: [],
  instances: [],
};

function paginatedOf<T>(results: T[], numFound = results.length) {
  return {
    header: { numFound, maxScore: 1.0, queryTime: 50, page: 1, pageSize: results.length || 10 },
    results,
  };
}

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

// ─── POST /api/compare ────────────────────────────────────────────────────────

describe("POST /api/compare", () => {
  beforeEach(() => setOpenAIREClient(makeMockClient()));

  test("returns 400 for missing entities field", async () => {
    const res = await request(app).post("/api/compare").send({}).expect(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });

  test("returns 400 for empty entities array", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [] })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 400 for more than 5 entities", async () => {
    const entities = Array.from({ length: 6 }, (_, i) => ({ id: `org::${i}`, type: "organization" }));
    const res = await request(app)
      .post("/api/compare")
      .send({ entities })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns 400 for invalid entity type", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ id: "org::1", type: "invalid-type" }] })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns comparison result for organization entity", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ id: ORG.id, type: "organization" }] })
      .expect(200);

    expect(res.body).toMatchObject({
      entities: expect.arrayContaining([
        expect.objectContaining({ id: ORG.id, type: "organization", name: ORG.legalName }),
      ]),
      metrics: expect.arrayContaining([
        expect.objectContaining({ entityId: ORG.id, totalOutputs: expect.any(Number) }),
      ]),
      computedAt: expect.any(String),
    });
  });

  test("returns comparison result for project entity", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ id: PROJECT.id, type: "project" }] })
      .expect(200);

    expect(res.body.entities[0]).toMatchObject({ id: PROJECT.id, name: PROJECT.title });
  });

  test("returns comparison result for research-product entity", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ id: PRODUCT.id, type: "research-product" }] })
      .expect(200);

    expect(res.body.entities[0]).toMatchObject({ id: PRODUCT.id, name: PRODUCT.mainTitle });
    expect(res.body.metrics[0]!.totalOutputs).toBe(1); // single product
  });

  test("handles multiple entities in parallel", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    const res = await request(app)
      .post("/api/compare")
      .send({
        entities: [
          { id: ORG.id, type: "organization" },
          { id: PROJECT.id, type: "project" },
        ],
      })
      .expect(200);

    expect(res.body.entities).toHaveLength(2);
    expect(res.body.metrics).toHaveLength(2);
  });

  test("applies year filters to product fetching", async () => {
    const mockClient = makeMockClient();
    setOpenAIREClient(mockClient);

    await request(app)
      .post("/api/compare")
      .send({
        entities: [{ id: ORG.id, type: "organization" }],
        filters: { fromYear: 2020, toYear: 2023 },
      })
      .expect(200);

    expect(mockClient.searchResearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        fromPublicationDate: "2020-01-01",
        toPublicationDate: "2023-12-31",
      })
    );
  });

  test("computes correct metrics end-to-end", async () => {
    // Single gold OA product → oaRate = 0 (computeEntityMetrics uses bestAccessRight.label 'OPEN')
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ id: PRODUCT.id, type: "research-product" }] })
      .expect(200);

    const metrics = res.body.metrics[0];
    expect(metrics.totalOutputs).toBe(1);
    expect(metrics.outputsByType.publications).toBe(1);
    expect(typeof metrics.oaRate).toBe("number");
    expect(metrics.oaDistribution).toMatchObject({
      gold: expect.any(Number),
      green: expect.any(Number),
      hybrid: expect.any(Number),
      bronze: expect.any(Number),
      closed: expect.any(Number),
      unknown: expect.any(Number),
    });
  });

  test("returns 400 for missing entity id", async () => {
    const res = await request(app)
      .post("/api/compare")
      .send({ entities: [{ type: "organization" }] })
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });
});
