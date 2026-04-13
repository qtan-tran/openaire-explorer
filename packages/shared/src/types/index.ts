/**
 * OpenAIRE Graph API — TypeScript interfaces
 * Derived from actual API responses (api-recon/samples/, 2026-04-12).
 * Nullability reflects observed real-world data, not docs alone.
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

/** Offset-mode pagination header (default). Max 10,000 records reachable. */
export interface OffsetHeader {
  numFound: number;
  maxScore: number;
  queryTime: number;
  page: number;
  pageSize: number;
}

/** Cursor-mode pagination header (`cursor=*` param). Supports full dataset traversal. */
export interface CursorHeader {
  numFound: number;
  maxScore: number;
  queryTime: number;
  pageSize: number;
  /** Opaque base64 string — pass as `cursor` param to fetch next page. */
  nextCursor: string;
}

export type SearchHeader = OffsetHeader | CursorHeader;

export interface PaginatedResponse<T> {
  header: SearchHeader;
  results: T[];
}

// ─── Search / query parameters ────────────────────────────────────────────────

export type EntityType = "researchProducts" | "organizations" | "projects" | "dataSources";

export interface SearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
}

export interface ResearchProductSearchParams extends SearchParams {
  type?: "publication" | "dataset" | "software" | "other";
  openAccessColor?: OpenAccessColor;
  bestOpenAccessRightLabel?: string;
  isGreen?: boolean;
  fromPublicationDate?: string;
  toPublicationDate?: string;
  doi?: string;
  orcid?: string;
  funder?: string;
  fundingStream?: string;
  communityList?: string;
  countryCode?: string;
  relOrganizationId?: string;
  relProjectId?: string;
}

export interface OrganizationSearchParams extends SearchParams {
  countryCode?: string;
  pid?: string;
}

export interface ProjectSearchParams extends SearchParams {
  fundingStream?: string;
  callIdentifier?: string;
  funder?: string;
  fromStartDate?: string;
  toEndDate?: string;
  openAccessMandateForPublications?: boolean;
}

// ─── Comparison / metrics (application-layer types) ──────────────────────────

export interface ComparisonEntity {
  id: string;
  type: "research-product" | "organization" | "project";
  name: string;
}

export interface ComparisonMetrics {
  entityId: string;
  totalOutputs: number;
  /** 0–1 fraction of products with OPEN / OPEN SOURCE access right */
  oaRate: number;
  outputsByType: {
    publications: number;
    datasets: number;
    software: number;
    other: number;
  };
  oaDistribution: {
    gold: number;
    green: number;
    hybrid: number;
    bronze: number;
    closed: number;
    unknown: number;
  };
  yearlyOutputs: Array<{ year: number; count: number }>;
  /** counts per OpenAIRE citation class (C1 = top, C5 = bottom) */
  citationProfile: { c1: number; c2: number; c3: number; c4: number; c5: number };
}

export interface ComparisonResult {
  entities: ComparisonEntity[];
  metrics: ComparisonMetrics[];
  computedAt: string;
}

// ─── Open Access ──────────────────────────────────────────────────────────────

export type OpenAccessColor = "gold" | "green" | "bronze" | "hybrid";

export type AccessRightCode =
  | "c_abf2" // OPEN
  | "c_f1cf" // EMBARGOEDACCESS
  | "c_16ec" // RESTRICTED
  | "c_14cb" // CLOSEDACCESS
  | (string & Record<never, never>); // allow unknown codes

export interface AccessRight {
  code: AccessRightCode;
  label: string;
  scheme: string;
  openAccessRoute?: OpenAccessColor | null;
}

// ─── ResearchProduct ──────────────────────────────────────────────────────────

export type ProductType = "publication" | "dataset" | "software" | "other";
export type RefereedStatus = "peerReviewed" | "nonPeerReviewed" | "UNKNOWN";

export interface Language {
  code: string;
  label: string;
}

export interface SubjectEntry {
  subject: SchemeValue;
  provenance: Provenance | null;
}

export interface CountryEntry {
  code: string;
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

export interface Container {
  name: string;
  issnPrinted: string | null;
  issnOnline: string | null;
  issnLinking: string | null;
  ep: string | null;
  sp: string | null;
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
  citationClass: string;
  influenceClass: string;
  impulseClass: string;
  popularityClass: string;
}

export interface Indicators {
  citationImpact: CitationImpact;
}

export interface EmbeddedOrganization {
  legalName: string;
  acronym: string | null;
  id: string;
  pids: Pid[] | null;
}

export interface ProjectRef {
  id: string;
  code: string;
  acronym: string | null;
  title: string;
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
  license?: string | null;
  accessRight?: AccessRight;
  type: string;
  urls: string[];
  publicationDate?: string | null;
  refereed?: RefereedStatus | null;
  hostedBy: CollectedFromRef;
  collectedFrom?: CollectedFromRef;
}

export interface ResearchProduct {
  id: string;
  originalIds: string[];
  type: ProductType;
  mainTitle: string;
  subTitle: string | null;
  descriptions: string[] | null;
  authors: Author[];
  publicationDate: string | null;
  publisher: string | null;
  embargoEndDate: string | null;
  language: Language | null;
  countries: CountryEntry[] | null;
  subjects: SubjectEntry[] | null;
  openAccessColor: OpenAccessColor | null;
  publiclyFunded: boolean;
  isGreen: boolean;
  isInDiamondJournal: boolean;
  bestAccessRight: AccessRight | null;
  container: Container | null;
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
  id: string;
  originalIds: string[];
  legalName: string;
  legalShortName: string | null;
  alternativeNames: string[] | null;
  websiteUrl: string | null;
  country: {
    code: string;
    label: string;
  } | null;
  pids: Pid[] | null;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface FundingStream {
  id: string;
  description: string;
}

export interface Funding {
  shortName: string;
  name: string;
  jurisdiction: string;
  fundingStream: FundingStream | null;
}

export interface Granted {
  currency: string;
  totalCost: number;
  fundedAmount: number;
}

export interface Project {
  id: string;
  originalIds: string[];
  code: string;
  acronym: string | null;
  title: string;
  websiteUrl: string | null;
  startDate: string | null;
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
  scheme: string;
  value: string;
}

export interface DataSourcePolicy {
  id: string;
  label: string;
}

export interface DataSource {
  id: string;
  originalIds: string[];
  pids: Pid[] | null;
  type: DataSourceType;
  openaireCompatibility: string;
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
  journal: unknown | null;
}

// ─── Response aliases ─────────────────────────────────────────────────────────

export type ResearchProductsResponse = PaginatedResponse<ResearchProduct>;
export type OrganizationsResponse = PaginatedResponse<Organization>;
export type ProjectsResponse = PaginatedResponse<Project>;
export type DataSourcesResponse = PaginatedResponse<DataSource>;
