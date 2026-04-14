import type { ResearchProduct, Author, EmbeddedOrganization } from "@openaire-explorer/shared";

// ─── Reusable sub-entities ────────────────────────────────────────────────────

export const AUTHORS: Record<string, Author> = {
  alice: { fullName: "Alice Smith", name: "Alice", surname: "Smith", rank: 1, pid: null },
  bob: { fullName: "Bob Jones", name: "Bob", surname: "Jones", rank: 2, pid: null },
  charlie: { fullName: "Charlie Brown", name: "Charlie", surname: "Brown", rank: 3, pid: null },
  diana: { fullName: "Diana Prince", name: "Diana", surname: "Prince", rank: 1, pid: null },
  evan: { fullName: "Evan Chen", name: "Evan", surname: "Chen", rank: 2, pid: null },
};

export const ORGS: Record<string, EmbeddedOrganization> = {
  mit: { id: "openorgs____::mit001", legalName: "Massachusetts Institute of Technology", acronym: "MIT", pids: null },
  cern: { id: "openorgs____::cern001", legalName: "European Organization for Nuclear Research", acronym: "CERN", pids: null },
  oxford: { id: "openorgs____::ox001", legalName: "University of Oxford", acronym: null, pids: null },
};

// ─── Factory helper ───────────────────────────────────────────────────────────

function make(id: string, overrides: Partial<ResearchProduct>): ResearchProduct {
  return {
    id,
    originalIds: [`doi::10.1234/${id}`],
    type: "publication",
    mainTitle: `Research on ${id}`,
    subTitle: null,
    descriptions: [`Abstract for ${id}.`],
    authors: [],
    publicationDate: null,
    publisher: null,
    embargoEndDate: null,
    language: { code: "eng", label: "English" },
    countries: null,
    subjects: null,
    openAccessColor: null,
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
    pids: [{ scheme: "doi", value: `10.1234/${id}` }],
    dateOfCollection: null,
    lastUpdateTimeStamp: null,
    indicators: null,
    projects: null,
    organizations: null,
    communities: null,
    collectedFrom: [{ key: "crossref", value: "Crossref" }],
    instances: [],
    ...overrides,
  };
}

// ─── 20 sample products with varied OA status, years, types ──────────────────

export const sampleProducts: ResearchProduct[] = [
  // ── Gold OA (5) ──────────────────────────────────────────────────────────────
  make("p001", {
    openAccessColor: "gold",
    publicationDate: "2019-03-10",
    type: "publication",
    authors: [AUTHORS.alice, AUTHORS.bob],
    organizations: [ORGS.mit],
    bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
    indicators: { citationImpact: { citationCount: 42, influence: 0.01, popularity: 0.02, impulse: 5, citationClass: "C1", influenceClass: "C2", impulseClass: "C1", popularityClass: "C2" } },
  }),
  make("p002", {
    openAccessColor: "gold",
    publicationDate: "2020-06-15",
    type: "publication",
    authors: [AUTHORS.alice, AUTHORS.charlie],
    organizations: [ORGS.cern],
    bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
    indicators: { citationImpact: { citationCount: 18, influence: 0.005, popularity: 0.01, impulse: 3, citationClass: "C2", influenceClass: "C3", impulseClass: "C2", popularityClass: "C3" } },
  }),
  make("p003", {
    openAccessColor: "gold",
    publicationDate: "2021-01-20",
    type: "publication",
    authors: [AUTHORS.bob, AUTHORS.diana],
    organizations: [ORGS.mit, ORGS.oxford],
    bestAccessRight: { code: "c_abf2", label: "OPEN", scheme: "coar", openAccessRoute: "gold" },
  }),
  make("p004", {
    openAccessColor: "gold",
    publicationDate: "2022-09-05",
    type: "dataset",
    authors: [AUTHORS.evan],
    organizations: [ORGS.oxford],
  }),
  make("p005", {
    openAccessColor: "gold",
    publicationDate: "2023-11-30",
    type: "publication",
    authors: [AUTHORS.alice, AUTHORS.evan],
    organizations: [ORGS.cern],
    indicators: { citationImpact: { citationCount: 5, influence: 0.001, popularity: 0.003, impulse: 1, citationClass: "C4", influenceClass: "C5", impulseClass: "C4", popularityClass: "C4" } },
  }),

  // ── Green OA (4) ─────────────────────────────────────────────────────────────
  make("p006", {
    openAccessColor: null,
    isGreen: true,
    publicationDate: "2019-07-22",
    type: "publication",
    authors: [AUTHORS.charlie, AUTHORS.diana],
    organizations: [ORGS.oxford],
  }),
  make("p007", {
    openAccessColor: "green" as "gold", // typed cast for test fixture — openAccessColor green
    isGreen: false,
    publicationDate: "2020-11-01",
    type: "publication",
    authors: [AUTHORS.alice],
    organizations: [ORGS.mit],
  }),
  make("p008", {
    openAccessColor: null,
    isGreen: true,
    publicationDate: "2021-04-14",
    type: "software",
    authors: [AUTHORS.bob, AUTHORS.charlie],
    organizations: [ORGS.cern],
  }),
  make("p009", {
    openAccessColor: null,
    isGreen: true,
    publicationDate: "2022-08-19",
    type: "publication",
    authors: [AUTHORS.diana, AUTHORS.evan],
    organizations: [ORGS.oxford],
  }),

  // ── Hybrid OA (3) ────────────────────────────────────────────────────────────
  make("p010", {
    openAccessColor: "hybrid",
    publicationDate: "2019-12-01",
    type: "publication",
    authors: [AUTHORS.alice, AUTHORS.bob, AUTHORS.charlie],
    organizations: [ORGS.mit],
  }),
  make("p011", {
    openAccessColor: "hybrid",
    publicationDate: "2021-07-30",
    type: "dataset",
    authors: [AUTHORS.evan],
    organizations: [ORGS.cern],
  }),
  make("p012", {
    openAccessColor: "hybrid",
    publicationDate: "2023-03-22",
    type: "publication",
    authors: [AUTHORS.charlie, AUTHORS.diana],
    organizations: [ORGS.oxford],
  }),

  // ── Bronze OA (2) ────────────────────────────────────────────────────────────
  make("p013", {
    openAccessColor: "bronze",
    publicationDate: "2020-04-09",
    type: "publication",
    authors: [AUTHORS.alice],
    organizations: [ORGS.mit],
    bestAccessRight: { code: "c_f1cf", label: "RESTRICTED", scheme: "coar", openAccessRoute: null },
  }),
  make("p014", {
    openAccessColor: "bronze",
    publicationDate: "2022-05-17",
    type: "dataset",
    authors: [AUTHORS.bob, AUTHORS.evan],
    organizations: [ORGS.cern],
  }),

  // ── Closed (3, via bestAccessRight) ──────────────────────────────────────────
  make("p015", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: "2020-02-28",
    type: "publication",
    authors: [AUTHORS.charlie],
    organizations: [ORGS.oxford],
    bestAccessRight: { code: "c_14cb", label: "CLOSED", scheme: "coar", openAccessRoute: null },
  }),
  make("p016", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: "2021-10-10",
    type: "publication",
    authors: [AUTHORS.diana, AUTHORS.alice],
    organizations: [ORGS.mit],
    bestAccessRight: { code: "c_14cb", label: "CLOSEDACCESS", scheme: "coar", openAccessRoute: null },
  }),
  make("p017", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: "2023-06-04",
    type: "software",
    authors: [AUTHORS.evan],
    organizations: [ORGS.cern],
    bestAccessRight: { code: "c_14cb", label: "CLOSED", scheme: "coar", openAccessRoute: null },
  }),

  // ── Unknown (3, no OA info) ───────────────────────────────────────────────────
  make("p018", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: "2019-09-14",
    type: "publication",
    authors: [AUTHORS.alice, AUTHORS.bob, AUTHORS.charlie, AUTHORS.diana],
    organizations: [ORGS.mit, ORGS.oxford],
  }),
  make("p019", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: "2022-12-01",
    type: "other",
    authors: [AUTHORS.bob],
    organizations: [ORGS.cern],
  }),
  make("p020", {
    openAccessColor: null,
    isGreen: false,
    publicationDate: null, // no date — should be skipped in year grouping
    type: "publication",
    authors: [AUTHORS.charlie, AUTHORS.evan],
    organizations: [ORGS.oxford],
  }),
];
