import type { ResearchProduct, ComparisonMetrics } from "@openaire-explorer/shared";

// ─── Shared constants ─────────────────────────────────────────────────────────

export const OA_CATEGORIES = [
  "gold",
  "green",
  "hybrid",
  "bronze",
  "closed",
  "unknown",
] as const;

export type OACategory = (typeof OA_CATEGORIES)[number];

/** Categories counted as "open" for rate calculations. */
const OPEN_CATEGORIES = new Set<OACategory>(["gold", "green", "hybrid"]);

export interface OADistributionEntry {
  count: number;
  percentage: number;
}

export interface OAByYearEntry {
  year: number;
  gold: number;
  green: number;
  hybrid: number;
  bronze: number;
  closed: number;
  unknown: number;
}

export interface OADistributionResult {
  total: number;
  distribution: Record<OACategory, OADistributionEntry>;
  byYear: OAByYearEntry[];
  oaRate: number;
  oaRateByYear: Array<{ year: number; rate: number }>;
}

// ─── OA classification ────────────────────────────────────────────────────────

/**
 * Derive a single OA category string from the fields available on a product.
 * Priority:
 *   1. openAccessColor (gold / hybrid / bronze — not green, handled separately)
 *   2. isGreen flag
 *   3. bestAccessRight.label heuristics
 *   4. "unknown"
 */
export function classifyOAStatus(product: ResearchProduct): string {
  if (product.openAccessColor && product.openAccessColor !== "green") {
    return product.openAccessColor; // "gold" | "hybrid" | "bronze"
  }
  if (product.isGreen || product.openAccessColor === "green") return "green";

  const label = (product.bestAccessRight?.label ?? "").toUpperCase();
  if (label === "OPEN" || label === "OPEN SOURCE") return "gold";
  if (label === "CLOSED" || label === "CLOSEDACCESS") return "closed";
  return "unknown";
}

// ─── Yearly grouping ──────────────────────────────────────────────────────────

export function groupByYear(
  products: ResearchProduct[]
): Array<{ year: number; count: number }> {
  const currentYear = new Date().getFullYear();
  const counts: Record<number, number> = {};

  for (const p of products) {
    if (!p.publicationDate) continue;
    const year = parseInt(p.publicationDate.slice(0, 4), 10);
    if (!Number.isFinite(year) || year < 1900 || year > currentYear + 1) continue;
    counts[year] = (counts[year] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([y, count]) => ({ year: parseInt(y, 10), count }))
    .sort((a, b) => a.year - b.year);
}

// ─── Type distribution ────────────────────────────────────────────────────────

export function countByType(products: ResearchProduct[]) {
  const counts = { publications: 0, datasets: 0, software: 0, other: 0 };
  for (const p of products) {
    if (p.type === "publication") counts.publications++;
    else if (p.type === "dataset") counts.datasets++;
    else if (p.type === "software") counts.software++;
    else counts.other++;
  }
  return counts;
}

// ─── Citation profile ─────────────────────────────────────────────────────────

export function buildCitationProfile(products: ResearchProduct[]) {
  const profile = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 };
  for (const p of products) {
    const cls = p.indicators?.citationImpact?.citationClass?.toUpperCase();
    if (cls === "C1") profile.c1++;
    else if (cls === "C2") profile.c2++;
    else if (cls === "C3") profile.c3++;
    else if (cls === "C4") profile.c4++;
    else if (cls === "C5") profile.c5++;
  }
  return profile;
}

// ─── OA distribution aggregations ────────────────────────────────────────────

/** Count products per OA category, grouped by publication year. */
export function groupOAByYear(products: ResearchProduct[]): OAByYearEntry[] {
  const currentYear = new Date().getFullYear();
  const map = new Map<number, OAByYearEntry>();

  for (const p of products) {
    if (!p.publicationDate) continue;
    const year = parseInt(p.publicationDate.slice(0, 4), 10);
    if (!Number.isFinite(year) || year < 1900 || year > currentYear + 1) continue;

    if (!map.has(year)) {
      map.set(year, {
        year,
        gold: 0,
        green: 0,
        hybrid: 0,
        bronze: 0,
        closed: 0,
        unknown: 0,
      });
    }

    const entry = map.get(year)!;
    const cat = classifyOAStatus(p) as OACategory;
    entry[cat] = (entry[cat] ?? 0) + 1;
  }

  return Array.from(map.values()).sort((a, b) => a.year - b.year);
}

/** OA rate (open / total) per year. */
export function computeOARateByYear(
  products: ResearchProduct[]
): Array<{ year: number; rate: number }> {
  const byYear = groupOAByYear(products);
  return byYear.map((row) => {
    const openCount = row.gold + row.green + row.hybrid;
    const total =
      row.gold + row.green + row.hybrid + row.bronze + row.closed + row.unknown;
    return { year: row.year, rate: total > 0 ? openCount / total : 0 };
  });
}

/** Full OA distribution object ready for the API response. */
export function computeOADistribution(
  products: ResearchProduct[]
): OADistributionResult {
  const total = products.length;

  // Per-category counts
  const counts: Record<OACategory, number> = {
    gold: 0,
    green: 0,
    hybrid: 0,
    bronze: 0,
    closed: 0,
    unknown: 0,
  };
  for (const p of products) {
    const cat = classifyOAStatus(p) as OACategory;
    counts[cat]++;
  }

  // Convert to distribution entries with percentages
  const distribution = {} as Record<OACategory, OADistributionEntry>;
  for (const cat of OA_CATEGORIES) {
    distribution[cat] = {
      count: counts[cat],
      percentage: total > 0 ? Math.round((counts[cat] / total) * 1000) / 10 : 0,
    };
  }

  const openCount = OA_CATEGORIES.filter((c) => OPEN_CATEGORIES.has(c)).reduce(
    (s, c) => s + counts[c],
    0
  );

  return {
    total,
    distribution,
    byYear: groupOAByYear(products),
    oaRate: total > 0 ? openCount / total : 0,
    oaRateByYear: computeOARateByYear(products),
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function computeEntityMetrics(
  entityId: string,
  products: ResearchProduct[]
): ComparisonMetrics {
  const total = products.length;

  // OA rate: fraction with OPEN or OPEN SOURCE access right label
  const openLabels = new Set(["OPEN", "OPEN SOURCE"]);
  const openCount = products.filter((p) => {
    const lbl = (p.bestAccessRight?.label ?? "").toUpperCase();
    return openLabels.has(lbl);
  }).length;

  // OA distribution using unified classifier
  const oaDistribution = {
    gold: 0,
    green: 0,
    hybrid: 0,
    bronze: 0,
    closed: 0,
    unknown: 0,
  };
  for (const p of products) {
    const status = classifyOAStatus(p) as keyof typeof oaDistribution;
    oaDistribution[status] = (oaDistribution[status] ?? 0) + 1;
  }

  return {
    entityId,
    totalOutputs: total,
    oaRate: total > 0 ? openCount / total : 0,
    outputsByType: countByType(products),
    oaDistribution,
    yearlyOutputs: groupByYear(products),
    citationProfile: buildCitationProfile(products),
  };
}
