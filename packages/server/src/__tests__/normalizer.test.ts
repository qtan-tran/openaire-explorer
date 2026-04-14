import { describe, test, expect } from "vitest";
import {
  normalizeResearchProduct,
  normalizeOrganization,
  normalizeProject,
} from "../lib/normalizer.js";

// ─── normalizeResearchProduct ─────────────────────────────────────────────────

describe("normalizeResearchProduct", () => {
  const complete = {
    id: "doi_________::abc123",
    originalIds: ["10.1234/test"],
    type: "publication",
    mainTitle: "Complete Research Product",
    subTitle: "A Subtitle",
    descriptions: ["First abstract.", "Second abstract."],
    authors: [
      { fullName: "Alice Smith", name: "Alice", surname: "Smith", rank: 1, pid: { id: { scheme: "orcid", value: "0000-0001-2345-6789" }, provenance: null } },
      { fullName: "Bob Jones", name: "Bob", surname: "Jones", rank: 2, pid: null },
    ],
    publicationDate: "2024-03-15",
    publisher: "Nature Publishing",
    embargoEndDate: null,
    language: { code: "eng", label: "English" },
    countries: [{ code: "US", label: "United States", provenance: null }],
    subjects: [{ subject: { scheme: "FOS", value: "01 natural sciences" }, provenance: null }],
    openAccessColor: "gold",
    publiclyFunded: true,
    isGreen: false,
    isInDiamondJournal: false,
    bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
    container: { name: "Nature", issnPrinted: "0028-0836", issnOnline: null, issnLinking: null, ep: "10", sp: "5", iss: "3", vol: "610", edition: null, conferencePlace: null, conferenceDate: null },
    sources: ["Crossref"],
    formats: null,
    contributors: ["Alice Smith"],
    coverages: null,
    documentationUrls: null,
    codeRepositoryUrl: null,
    programmingLanguage: null,
    contactPeople: null,
    contactGroups: null,
    tools: null,
    size: null,
    version: "1.0",
    geoLocations: null,
    pids: [{ scheme: "doi", value: "10.1234/test" }],
    dateOfCollection: "2024-04-01",
    lastUpdateTimeStamp: 1712000000,
    indicators: {
      citationImpact: {
        citationCount: 25,
        influence: 0.005,
        popularity: 0.01,
        impulse: 4,
        citationClass: "C2",
        influenceClass: "C3",
        impulseClass: "C2",
        popularityClass: "C3",
      },
    },
    projects: [{ id: "corda::proj1", code: "101001", acronym: "TEST", title: "Test Project" }],
    organizations: [{ id: "openorgs::org1", legalName: "MIT", acronym: "MIT", pids: null }],
    communities: [{ code: "eu-openscreen", label: "EU-OPENSCREEN", provenance: null }],
    collectedFrom: [{ key: "crossref", value: "Crossref" }],
    instances: [
      {
        pids: [{ scheme: "doi", value: "10.1234/test" }],
        license: "CC BY 4.0",
        accessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
        type: "Article",
        urls: ["https://doi.org/10.1234/test"],
        publicationDate: "2024-03-15",
        refereed: "peerReviewed",
        hostedBy: { key: "nature", value: "Nature" },
        collectedFrom: { key: "crossref", value: "Crossref" },
      },
    ],
  };

  test("normalizes a complete product correctly", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.id).toBe("doi_________::abc123");
    expect(result.mainTitle).toBe("Complete Research Product");
    expect(result.subTitle).toBe("A Subtitle");
    expect(result.openAccessColor).toBe("gold");
    expect(result.publiclyFunded).toBe(true);
    expect(result.isGreen).toBe(false);
  });

  test("normalizes authors array with ORCID pid", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.authors).toHaveLength(2);
    expect(result.authors[0]!.fullName).toBe("Alice Smith");
    expect(result.authors[0]!.pid?.id.scheme).toBe("orcid");
    expect(result.authors[0]!.pid?.id.value).toBe("0000-0001-2345-6789");
    expect(result.authors[1]!.pid).toBeNull();
  });

  test("normalizes bestAccessRight correctly", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.bestAccessRight?.label).toBe("OPEN");
    expect(result.bestAccessRight?.code).toBe("c_abf2");
  });

  test("normalizes indicators with citation impact", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.indicators?.citationImpact.citationCount).toBe(25);
    expect(result.indicators?.citationImpact.citationClass).toBe("C2");
  });

  test("normalizes instances with access rights", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0]!.accessRight?.label).toBe("OPEN");
    expect(result.instances[0]!.type).toBe("Article");
    expect(result.instances[0]!.urls).toContain("https://doi.org/10.1234/test");
  });

  test("normalizes container fields", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.container?.name).toBe("Nature");
    expect(result.container?.issnPrinted).toBe("0028-0836");
    expect(result.container?.issnOnline).toBeNull();
  });

  test("normalizes subjects array", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects![0]!.subject.scheme).toBe("FOS");
  });

  test("normalizes language correctly", () => {
    const result = normalizeResearchProduct(complete);
    expect(result.language?.code).toBe("eng");
    expect(result.language?.label).toBe("English");
  });

  test("handles minimal product (missing optional fields)", () => {
    const minimal = { id: "test::1", type: "publication", mainTitle: "Minimal" };
    const result = normalizeResearchProduct(minimal);
    expect(result.id).toBe("test::1");
    expect(result.type).toBe("publication");
    expect(result.mainTitle).toBe("Minimal");
    expect(result.descriptions).toBeNull();
    expect(result.authors).toEqual([]);
    expect(result.instances).toEqual([]);
    expect(result.collectedFrom).toEqual([]);
    expect(result.publiclyFunded).toBe(false);
    expect(result.isGreen).toBe(false);
    expect(result.isInDiamondJournal).toBe(false);
    expect(result.bestAccessRight).toBeNull();
    expect(result.language).toBeNull();
    expect(result.indicators).toBeNull();
  });

  test("handles null language gracefully", () => {
    const result = normalizeResearchProduct({ ...complete, language: null });
    expect(result.language).toBeNull();
  });

  test("handles malformed indicators (non-object) gracefully", () => {
    const result = normalizeResearchProduct({ ...complete, indicators: "invalid" });
    expect(result.indicators).toBeNull();
  });

  test("handles null container", () => {
    const result = normalizeResearchProduct({ ...complete, container: null });
    expect(result.container).toBeNull();
  });

  test("throws TypeError for non-object input", () => {
    expect(() => normalizeResearchProduct(null)).toThrow(TypeError);
    expect(() => normalizeResearchProduct(42)).toThrow(TypeError);
    expect(() => normalizeResearchProduct("string")).toThrow(TypeError);
  });

  test("defaults type to 'publication' when type field is missing", () => {
    const result = normalizeResearchProduct({ id: "test::1", mainTitle: "No type" });
    expect(result.type).toBe("publication");
  });
});

// ─── normalizeOrganization ────────────────────────────────────────────────────

describe("normalizeOrganization", () => {
  const complete = {
    id: "openorgs____::abc",
    originalIds: ["ror::042nb2s44"],
    legalName: "Massachusetts Institute of Technology",
    legalShortName: "MIT",
    alternativeNames: ["MIT", "Massachusetts Institute of Technology"],
    websiteUrl: "https://mit.edu",
    country: { code: "US", label: "United States" },
    pids: [{ scheme: "ROR", value: "https://ror.org/042nb2s44" }],
  };

  test("normalizes a complete organization", () => {
    const result = normalizeOrganization(complete);
    expect(result.id).toBe("openorgs____::abc");
    expect(result.legalName).toBe("Massachusetts Institute of Technology");
    expect(result.legalShortName).toBe("MIT");
    expect(result.websiteUrl).toBe("https://mit.edu");
    expect(result.country?.code).toBe("US");
    expect(result.country?.label).toBe("United States");
    expect(result.pids).toHaveLength(1);
    expect(result.pids![0]!.scheme).toBe("ROR");
  });

  test("handles null country", () => {
    const result = normalizeOrganization({ ...complete, country: null });
    expect(result.country).toBeNull();
  });

  test("handles null pids", () => {
    const result = normalizeOrganization({ ...complete, pids: null });
    expect(result.pids).toBeNull();
  });

  test("handles missing optional fields", () => {
    const minimal = { id: "pending::1", legalName: "Unknown Org", originalIds: [] };
    const result = normalizeOrganization(minimal);
    expect(result.id).toBe("pending::1");
    expect(result.legalShortName).toBeNull();
    expect(result.websiteUrl).toBeNull();
    expect(result.country).toBeNull();
  });

  test("throws TypeError for non-object input", () => {
    expect(() => normalizeOrganization(null)).toThrow(TypeError);
    expect(() => normalizeOrganization(undefined)).toThrow(TypeError);
  });

  test("normalizes originalIds as string array", () => {
    const result = normalizeOrganization(complete);
    expect(result.originalIds).toEqual(["ror::042nb2s44"]);
  });
});

// ─── normalizeProject ─────────────────────────────────────────────────────────

describe("normalizeProject", () => {
  const complete = {
    id: "corda_____he::abc",
    originalIds: ["corda::abc"],
    code: "101056649",
    acronym: "TESTPROJ",
    title: "Test Horizon Project",
    websiteUrl: "https://testproj.eu",
    startDate: "2022-01-01",
    endDate: "2024-12-31",
    callIdentifier: "HORIZON-2021",
    keywords: "AI, climate",
    openAccessMandateForPublications: true,
    openAccessMandateForDataset: false,
    subjects: ["AI"],
    summary: "A test project.",
    fundings: [
      {
        shortName: "EC",
        name: "European Commission",
        jurisdiction: "EU",
        fundingStream: { id: "EC::HE", description: "Horizon Europe" },
      },
    ],
    granted: { currency: "EUR", totalCost: 500000, fundedAmount: 400000 },
    h2020Programmes: ["H2020-EU.1.1."],
  };

  test("normalizes a complete project", () => {
    const result = normalizeProject(complete);
    expect(result.id).toBe("corda_____he::abc");
    expect(result.code).toBe("101056649");
    expect(result.acronym).toBe("TESTPROJ");
    expect(result.title).toBe("Test Horizon Project");
    expect(result.openAccessMandateForPublications).toBe(true);
    expect(result.openAccessMandateForDataset).toBe(false);
  });

  test("normalizes fundings array with fundingStream", () => {
    const result = normalizeProject(complete);
    expect(result.fundings).toHaveLength(1);
    expect(result.fundings[0]!.shortName).toBe("EC");
    expect(result.fundings[0]!.fundingStream?.id).toBe("EC::HE");
    expect(result.fundings[0]!.fundingStream?.description).toBe("Horizon Europe");
  });

  test("normalizes granted funding amounts", () => {
    const result = normalizeProject(complete);
    expect(result.granted?.currency).toBe("EUR");
    expect(result.granted?.totalCost).toBe(500000);
    expect(result.granted?.fundedAmount).toBe(400000);
  });

  test("handles null granted", () => {
    const result = normalizeProject({ ...complete, granted: null });
    expect(result.granted).toBeNull();
  });

  test("handles null acronym", () => {
    const result = normalizeProject({ ...complete, acronym: null });
    expect(result.acronym).toBeNull();
  });

  test("handles funding with null fundingStream", () => {
    const noStream = { ...complete, fundings: [{ shortName: "NSF", name: "NSF", jurisdiction: "US", fundingStream: null }] };
    const result = normalizeProject(noStream);
    expect(result.fundings[0]!.fundingStream).toBeNull();
  });

  test("throws TypeError for non-object input", () => {
    expect(() => normalizeProject(null)).toThrow(TypeError);
    expect(() => normalizeProject("string")).toThrow(TypeError);
  });

  test("defaults openAccessMandate booleans to false", () => {
    const minimal = { id: "test::1", code: "123", title: "Minimal", originalIds: [] };
    const result = normalizeProject(minimal);
    expect(result.openAccessMandateForPublications).toBe(false);
    expect(result.openAccessMandateForDataset).toBe(false);
  });
});
