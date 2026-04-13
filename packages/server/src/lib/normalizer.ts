/**
 * Normalizers coerce raw API responses into clean, typed objects.
 * All field accesses are defensive — missing / null fields produce
 * the typed-null / empty-array / default value defined in our shared types.
 */
import type {
  ResearchProduct,
  Organization,
  Project,
  Author,
  Instance,
  Funding,
  Pid,
  SubjectEntry,
  CountryEntry,
  EmbeddedOrganization,
  CommunityRef,
  CollectedFromRef,
  AccessRight,
  Indicators,
  Container,
  Language,
  ProjectRef,
} from "@openaire-explorer/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function arr<T>(v: unknown, mapper: (x: unknown) => T): T[] {
  return Array.isArray(v) ? v.map(mapper) : [];
}

function arrOrNull<T>(v: unknown, mapper: (x: unknown) => T): T[] | null {
  return Array.isArray(v) ? v.map(mapper) : null;
}

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

// ─── Sub-entity normalizers ───────────────────────────────────────────────────

function normalizePid(raw: unknown): Pid {
  const r = obj(raw);
  return { scheme: str(r["scheme"]), value: str(r["value"]) };
}

function normalizeLanguage(raw: unknown): Language | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return { code: str(r["code"]), label: str(r["label"]) };
}

function normalizeAccessRight(raw: unknown): AccessRight | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return {
    code: str(r["code"]),
    label: str(r["label"]),
    scheme: str(r["scheme"]),
    openAccessRoute: strOrNull(r["openAccessRoute"]) as AccessRight["openAccessRoute"],
  };
}

function normalizeAuthor(raw: unknown): Author {
  const r = obj(raw);
  const pidRaw = r["pid"];
  return {
    fullName: str(r["fullName"]),
    name: strOrNull(r["name"]),
    surname: strOrNull(r["surname"]),
    rank: num(r["rank"], 1),
    pid:
      typeof pidRaw === "object" && pidRaw !== null
        ? {
            id: normalizePid((pidRaw as Record<string, unknown>)["id"]),
            provenance: null,
          }
        : null,
  };
}

function normalizeContainer(raw: unknown): Container | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return {
    name: str(r["name"]),
    issnPrinted: strOrNull(r["issnPrinted"]),
    issnOnline: strOrNull(r["issnOnline"]),
    issnLinking: strOrNull(r["issnLinking"]),
    ep: strOrNull(r["ep"]),
    sp: strOrNull(r["sp"]),
    iss: strOrNull(r["iss"]),
    vol: strOrNull(r["vol"]),
    edition: strOrNull(r["edition"]),
    conferencePlace: strOrNull(r["conferencePlace"]),
    conferenceDate: strOrNull(r["conferenceDate"]),
  };
}

function normalizeIndicators(raw: unknown): Indicators | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const ci = obj(r["citationImpact"]);
  return {
    citationImpact: {
      citationCount: num(ci["citationCount"]),
      influence: num(ci["influence"]),
      popularity: num(ci["popularity"]),
      impulse: num(ci["impulse"]),
      citationClass: str(ci["citationClass"], "C5"),
      influenceClass: str(ci["influenceClass"], "C5"),
      impulseClass: str(ci["impulseClass"], "C5"),
      popularityClass: str(ci["popularityClass"], "C5"),
    },
  };
}

function normalizeInstance(raw: unknown): Instance {
  const r = obj(raw);
  const ar = normalizeAccessRight(r["accessRight"]);
  return {
    pids: Array.isArray(r["pids"]) ? r["pids"].map(normalizePid) : undefined,
    alternateIdentifiers: Array.isArray(r["alternateIdentifiers"])
      ? r["alternateIdentifiers"].map(normalizePid)
      : undefined,
    license: strOrNull(r["license"]) ?? undefined,
    accessRight: ar ?? undefined,
    type: str(r["type"], "unknown"),
    urls: arr(r["urls"], (u) => str(u)),
    publicationDate: strOrNull(r["publicationDate"]),
    refereed: strOrNull(r["refereed"]) as Instance["refereed"],
    hostedBy: {
      key: str(obj(r["hostedBy"])["key"]),
      value: str(obj(r["hostedBy"])["value"]),
    },
    collectedFrom: r["collectedFrom"]
      ? {
          key: str(obj(r["collectedFrom"])["key"]),
          value: str(obj(r["collectedFrom"])["value"]),
        }
      : undefined,
  };
}

function normalizeSubject(raw: unknown): SubjectEntry {
  const r = obj(raw);
  const s = obj(r["subject"]);
  return {
    subject: { scheme: str(s["scheme"]), value: str(s["value"]) },
    provenance: null,
  };
}

function normalizeCountry(raw: unknown): CountryEntry {
  const r = obj(raw);
  return {
    code: str(r["code"]),
    label: str(r["label"]),
    provenance: null,
  };
}

function normalizeEmbeddedOrg(raw: unknown): EmbeddedOrganization {
  const r = obj(raw);
  return {
    id: str(r["id"]),
    legalName: str(r["legalName"]),
    acronym: strOrNull(r["acronym"]),
    pids: arrOrNull(r["pids"], normalizePid),
  };
}

function normalizeProjectRef(raw: unknown): ProjectRef {
  const r = obj(raw);
  return {
    id: str(r["id"]),
    code: str(r["code"]),
    acronym: strOrNull(r["acronym"]),
    title: str(r["title"]),
  };
}

function normalizeCommunity(raw: unknown): CommunityRef {
  const r = obj(raw);
  return { code: str(r["code"]), label: str(r["label"]), provenance: null };
}

function normalizeCollectedFrom(raw: unknown): CollectedFromRef {
  const r = obj(raw);
  return { key: str(r["key"]), value: str(r["value"]) };
}

function normalizeFunding(raw: unknown): Funding {
  const r = obj(raw);
  const fs = r["fundingStream"];
  return {
    shortName: str(r["shortName"]),
    name: str(r["name"]),
    jurisdiction: str(r["jurisdiction"]),
    fundingStream:
      typeof fs === "object" && fs !== null
        ? {
            id: str((fs as Record<string, unknown>)["id"]),
            description: str((fs as Record<string, unknown>)["description"]),
          }
        : null,
  };
}

// ─── Public normalizers ───────────────────────────────────────────────────────

export function normalizeResearchProduct(raw: unknown): ResearchProduct {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError("normalizeResearchProduct: expected object");
  }
  const r = raw as Record<string, unknown>;

  return {
    id: str(r["id"]),
    originalIds: arr(r["originalIds"], (x) => str(x)),
    type: (str(r["type"], "publication") as ResearchProduct["type"]),
    mainTitle: str(r["mainTitle"]),
    subTitle: strOrNull(r["subTitle"]),
    descriptions: arrOrNull(r["descriptions"], (x) => str(x)),
    authors: arr(r["authors"], normalizeAuthor),
    publicationDate: strOrNull(r["publicationDate"]),
    publisher: strOrNull(r["publisher"]),
    embargoEndDate: strOrNull(r["embargoEndDate"]),
    language: normalizeLanguage(r["language"]),
    countries: arrOrNull(r["countries"], normalizeCountry),
    subjects: arrOrNull(r["subjects"], normalizeSubject),
    openAccessColor: strOrNull(r["openAccessColor"]) as ResearchProduct["openAccessColor"],
    publiclyFunded: bool(r["publiclyFunded"]),
    isGreen: bool(r["isGreen"]),
    isInDiamondJournal: bool(r["isInDiamondJournal"]),
    bestAccessRight: normalizeAccessRight(r["bestAccessRight"]),
    container: normalizeContainer(r["container"]),
    sources: arrOrNull(r["sources"], (x) => str(x)),
    formats: arrOrNull(r["formats"], (x) => str(x)),
    contributors: arrOrNull(r["contributors"], (x) => str(x)),
    coverages: arrOrNull(r["coverages"], (x) => str(x)),
    documentationUrls: arrOrNull(r["documentationUrls"], (x) => str(x)),
    codeRepositoryUrl: strOrNull(r["codeRepositoryUrl"]),
    programmingLanguage: strOrNull(r["programmingLanguage"]),
    contactPeople: arrOrNull(r["contactPeople"], (x) => str(x)),
    contactGroups: arrOrNull(r["contactGroups"], (x) => str(x)),
    tools: arrOrNull(r["tools"], (x) => str(x)),
    size: strOrNull(r["size"]),
    version: strOrNull(r["version"]),
    geoLocations: arrOrNull(r["geoLocations"], (x) => str(x)),
    pids: arrOrNull(r["pids"], normalizePid),
    dateOfCollection: strOrNull(r["dateOfCollection"]),
    lastUpdateTimeStamp: numOrNull(r["lastUpdateTimeStamp"]),
    indicators: normalizeIndicators(r["indicators"]),
    projects: arrOrNull(r["projects"], normalizeProjectRef),
    organizations: arrOrNull(r["organizations"], normalizeEmbeddedOrg),
    communities: arrOrNull(r["communities"], normalizeCommunity),
    collectedFrom: arr(r["collectedFrom"], normalizeCollectedFrom),
    instances: arr(r["instances"], normalizeInstance),
  };
}

export function normalizeOrganization(raw: unknown): Organization {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError("normalizeOrganization: expected object");
  }
  const r = raw as Record<string, unknown>;
  const country = r["country"];

  return {
    id: str(r["id"]),
    originalIds: arr(r["originalIds"], (x) => str(x)),
    legalName: str(r["legalName"]),
    legalShortName: strOrNull(r["legalShortName"]),
    alternativeNames: arrOrNull(r["alternativeNames"], (x) => str(x)),
    websiteUrl: strOrNull(r["websiteUrl"]),
    country:
      typeof country === "object" && country !== null
        ? {
            code: str((country as Record<string, unknown>)["code"]),
            label: str((country as Record<string, unknown>)["label"]),
          }
        : null,
    pids: arrOrNull(r["pids"], normalizePid),
  };
}

export function normalizeProject(raw: unknown): Project {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError("normalizeProject: expected object");
  }
  const r = raw as Record<string, unknown>;
  const granted = r["granted"];

  return {
    id: str(r["id"]),
    originalIds: arr(r["originalIds"], (x) => str(x)),
    code: str(r["code"]),
    acronym: strOrNull(r["acronym"]),
    title: str(r["title"]),
    websiteUrl: strOrNull(r["websiteUrl"]),
    startDate: strOrNull(r["startDate"]),
    endDate: strOrNull(r["endDate"]),
    callIdentifier: strOrNull(r["callIdentifier"]),
    keywords: strOrNull(r["keywords"]),
    openAccessMandateForPublications: bool(r["openAccessMandateForPublications"]),
    openAccessMandateForDataset: bool(r["openAccessMandateForDataset"]),
    subjects: arrOrNull(r["subjects"], (x) => str(x)),
    summary: strOrNull(r["summary"]),
    fundings: arr(r["fundings"], normalizeFunding),
    granted:
      typeof granted === "object" && granted !== null
        ? {
            currency: str((granted as Record<string, unknown>)["currency"]),
            totalCost: num((granted as Record<string, unknown>)["totalCost"]),
            fundedAmount: num((granted as Record<string, unknown>)["fundedAmount"]),
          }
        : null,
    h2020Programmes: arrOrNull(r["h2020Programmes"], (x) => str(x)),
  };
}
