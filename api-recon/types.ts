/**
 * TypeScript interfaces derived from ACTUAL OpenAIRE Graph API responses.
 * Sources: api-recon/samples/*.json (fetched 2026-04-12)
 *
 * Nullability reflects what was observed in real responses — fields marked
 * `| null` were literally null in at least one sample record.
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface SchemeValue {
  scheme: string;
  value: string;
}

export interface Pid {
  scheme: string;
  value: string;
}

export interface Provenance {
  provenance: string;
  trust: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Offset-mode header (page + pageSize params).
 * `nextCursor` is absent in this mode.
 */
export interface OffsetHeader {
  numFound: number;
  maxScore: number;
  queryTime: number;
  page: number;
  pageSize: number;
  // absent in offset mode
  nextCursor?: never;
}

/**
 * Cursor-mode header (cursor=* param, then nextCursor for subsequent pages).
 * `page` is absent in cursor mode.
 */
export interface CursorHeader {
  numFound: number;
  maxScore: number;
  queryTime: number;
  pageSize: number;
  nextCursor: string; // base64-encoded opaque cursor
  // absent in cursor mode
  page?: never;
}

export type SearchHeader = OffsetHeader | CursorHeader;

export interface PaginatedResponse<T> {
  header: SearchHeader;
  results: T[];
}

// ─── ResearchProduct ──────────────────────────────────────────────────────────

export type OpenAccessColor = "gold" | "green" | "bronze" | "hybrid" | null;
export type ProductType = "publication" | "dataset" | "software" | "other";
export type RefereedStatus =
  | "peerReviewed"
  | "nonPeerReviewed"
  | "UNKNOWN"
  | null;

export interface Language {
  code: string; // ISO 639-1, e.g. "eng", "und"
  label: string;
}

export interface SubjectEntry {
  subject: SchemeValue; // scheme: "SDG" | "FOS" | "keyword" | …
  provenance: Provenance | null;
}

export interface CountryEntry {
  code: string; // ISO 3166-1 alpha-2
  label: string;
  provenance: Provenance | null;
}

export interface Author {
  fullName: string;
  name: string | null;
  surname: string | null;
  rank: number;
  pid: {
    id: Pid;
    provenance: Provenance | null;
  } | null;
}

export interface AccessRight {
  code: string; // COAR code, e.g. "c_abf2"
  label: string; // e.g. "OPEN"
  scheme: string; // COAR vocabulary URL
  openAccessRoute?: OpenAccessColor; // present on Instance.accessRight only
}

/** Bibliographic container (journal / conference) */
export interface Container {
  name: string;
  issnPrinted: string | null;
  issnOnline: string | null;
  issnLinking: string | null;
  ep: string | null; // end page
  sp: string | null; // start page
  iss: string | null;
  vol: string | null;
  edition: string | null;
  conferencePlace: string | null;
  conferenceDate: string | null;
}

export interface CitationImpact {
  citationCount: number;
  influence: number;
  popularity: number;
  impulse: number;
  citationClass: string; // "C1"–"C5"
  influenceClass: string;
  impulseClass: string;
  popularityClass: string;
}

export interface Indicators {
  citationImpact: CitationImpact;
}

/** Lightweight org reference embedded in ResearchProduct */
export interface EmbeddedOrganization {
  legalName: string;
  acronym: string;
  id: string; // e.g. "openorgs____::…"
  pids: Pid[] | null;
}

export interface CommunityRef {
  code: string;
  label: string;
  provenance: Provenance | null;
}

export interface CollectedFromRef {
  key: string;
  value: string;
}

export interface Instance {
  pids?: Pid[];
  alternateIdentifiers?: Pid[];
  license?: string; // e.g. "CC BY"
  accessRight?: AccessRight; // includes openAccessRoute
  type: string; // e.g. "Article", "Dataset", "Other literature type"
  urls: string[];
  publicationDate?: string | null;
  refereed: RefereedStatus;
  hostedBy: CollectedFromRef;
  collectedFrom?: CollectedFromRef;
}

export interface ResearchProduct {
  id: string; // e.g. "doi_________::…"
  originalIds: string[];
  type: ProductType;
  mainTitle: string;
  subTitle: string | null;
  descriptions: string[] | null;
  authors: Author[];
  publicationDate: string | null; // "YYYY-MM-DD"
  publisher: string | null;
  embargoEndDate: string | null;
  language: Language | null;
  countries: CountryEntry[] | null;
  subjects: SubjectEntry[] | null;
  openAccessColor: OpenAccessColor; // null = not assessed
  publiclyFunded: boolean;
  isGreen: boolean;
  isInDiamondJournal: boolean;
  bestAccessRight: AccessRight | null;
  container: Container | null; // null for datasets/software
  sources: string[] | null;
  formats: string[] | null;
  contributors: string[] | null;
  coverages: string[] | null;
  documentationUrls: string[] | null;
  codeRepositoryUrl: string | null;
  programmingLanguage: string | null;
  contactPeople: string[] | null;
  contactGroups: string[] | null;
  tools: string[] | null;
  size: string | null;
  version: string | null;
  geoLocations: string[] | null;
  pids: Pid[] | null;
  dateOfCollection: string | null;
  lastUpdateTimeStamp: number | null;
  indicators: Indicators | null;
  projects: ProjectRef[] | null;
  organizations: EmbeddedOrganization[] | null;
  communities: CommunityRef[] | null;
  collectedFrom: CollectedFromRef[];
  instances: Instance[];
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string; // "openorgs____::…" or "pending_org_::…"
  originalIds: string[];
  legalName: string;
  legalShortName: string | null;
  alternativeNames: string[] | null;
  websiteUrl: string | null;
  country: {
    code: string; // ISO 3166-1 or "EU"
    label: string;
  } | null;
  pids: Pid[] | null; // null for "pending" orgs; includes ROR, GRID, ISNI, etc.
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface FundingStream {
  id: string; // e.g. "EC::HE::HORIZON-AG"
  description: string;
}

export interface Funding {
  shortName: string; // e.g. "EC", "UKRI"
  name: string;
  jurisdiction: string; // ISO 3166-1 alpha-2 or "EU"
  fundingStream: FundingStream | null;
}

export interface Granted {
  currency: string; // ISO 4217
  totalCost: number;
  fundedAmount: number;
}

/** Lightweight project reference embedded in ResearchProduct */
export interface ProjectRef {
  id: string;
  code: string;
  acronym: string | null;
  title: string;
  funder?: string; // when embedded in ResearchProduct
}

export interface Project {
  id: string; // e.g. "corda_____he::…", "ukri________::…"
  originalIds: string[];
  code: string;
  acronym: string | null;
  title: string;
  websiteUrl: string | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null;
  callIdentifier: string | null;
  keywords: string | null;
  openAccessMandateForPublications: boolean;
  openAccessMandateForDataset: boolean;
  subjects: string[] | null;
  summary: string | null;
  fundings: Funding[];
  granted: Granted | null;
  h2020Programmes: string[] | null;
}

// ─── DataSource ───────────────────────────────────────────────────────────────

export interface DataSourceType {
  scheme: string; // e.g. "pubsrepository::unknown", "pubsrepository::thematic"
  value: string; // human label
}

export interface DataSourcePolicy {
  id: string;
  label: string;
}

export interface DataSource {
  id: string; // e.g. "opendoar____::…"
  originalIds: string[];
  pids: Pid[] | null;
  type: DataSourceType;
  openaireCompatibility: string; // e.g. "Not yet registered", "OpenAIRE Data (funded, referenced datasets)"
  officialName: string;
  englishName: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  dateOfValidation: string | null;
  description: string | null;
  subjects: string[] | null;
  languages: string[] | null;
  contentTypes: string[] | null;
  releaseStartDate: string | null;
  releaseEndDate: string | null;
  missionStatementUrl: string | null;
  accessRights: string | null;
  uploadRights: string | null;
  databaseAccessRestriction: string | null;
  dataUploadRestriction: string | null;
  versioning: boolean;
  citationGuidelineUrl: string | null;
  pidSystems: string[] | null;
  certificates: string[] | null;
  policies: DataSourcePolicy[] | null;
  journal: unknown | null; // schema unclear; null in all observed records
}

// ─── Convenience response aliases ─────────────────────────────────────────────

export type ResearchProductsResponse = PaginatedResponse<ResearchProduct>;
export type OrganizationsResponse = PaginatedResponse<Organization>;
export type ProjectsResponse = PaginatedResponse<Project>;
export type DataSourcesResponse = PaginatedResponse<DataSource>;
