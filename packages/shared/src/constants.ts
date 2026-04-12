export const OPENAIRE_BASE_URL = "https://api.openaire.eu/graph" as const;

export const API_VERSION = {
  researchProducts: "v2",
  organizations: "v1",
  projects: "v1",
  dataSources: "v1",
  persons: "v1",
} as const;

export const OA_COLOR = {
  GOLD: "gold",
  GREEN: "green",
  BRONZE: "bronze",
  HYBRID: "hybrid",
} as const;

export type OAColor = (typeof OA_COLOR)[keyof typeof OA_COLOR];

export const ENTITY_TYPE = {
  RESEARCH_PRODUCTS: "researchProducts",
  ORGANIZATIONS: "organizations",
  PROJECTS: "projects",
  DATA_SOURCES: "dataSources",
} as const;

export type EntityTypeKey = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

export const PRODUCT_TYPE = {
  PUBLICATION: "publication",
  DATASET: "dataset",
  SOFTWARE: "software",
  OTHER: "other",
} as const;

/** Max records reachable via offset pagination */
export const OFFSET_PAGINATION_LIMIT = 10_000;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 10,
  maxPageSize: 100,
} as const;

/** Citation impact classes, best (C1) to lowest (C5) */
export const CITATION_CLASSES = ["C1", "C2", "C3", "C4", "C5"] as const;
export type CitationClass = (typeof CITATION_CLASSES)[number];

export const COAR_ACCESS_RIGHTS = {
  OPEN: "c_abf2",
  EMBARGOED: "c_f1cf",
  RESTRICTED: "c_16ec",
  CLOSED: "c_14cb",
} as const;
