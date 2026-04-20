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

// ─── Trends / time-series types ──────────────────────────────────────────────

export type TrendsGranularity = "year" | "quarter";

export interface TimeSeriesEntry {
  period: string;
  totalOutputs: number;
  publications: number;
  datasets: number;
  software: number;
  other: number;
  oaRate: number;
  /** Fraction relative to previous period, null for first period. */
  growthRate: number | null;
}

export interface CumulativeEntry {
  period: string;
  cumulative: number;
  publications: number;
  datasets: number;
  software: number;
  other: number;
}

export interface MovingAverageEntry {
  period: string;
  ma3: number | null;
  ma5: number | null;
}

export interface TrendsSummaryData {
  totalOutputs: number;
  avgYearlyGrowth: number | null;
  peakYear: string;
  peakCount: number;
}

export interface TrendsResult {
  timeSeries: TimeSeriesEntry[];
  cumulativeOutputs: CumulativeEntry[];
  movingAverages: MovingAverageEntry[];
  summary: TrendsSummaryData;
}

// ─── Trends computation helpers ───────────────────────────────────────────────

function getPeriod(publicationDate: string, granularity: TrendsGranularity): string | null {
  const currentYear = new Date().getFullYear();
  const year = parseInt(publicationDate.slice(0, 4), 10);
  if (!Number.isFinite(year) || year < 1900 || year > currentYear + 1) return null;

  if (granularity === "year") return String(year);

  // quarter
  const month = parseInt(publicationDate.slice(5, 7), 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) return String(year); // fallback to year
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

/** Build time-series entries grouped by period (year or quarter). */
export function computeTimeSeries(
  products: ResearchProduct[],
  granularity: TrendsGranularity = "year"
): TimeSeriesEntry[] {
  type Accumulator = {
    totalOutputs: number;
    publications: number;
    datasets: number;
    software: number;
    other: number;
    openCount: number;
  };

  const map = new Map<string, Accumulator>();

  for (const p of products) {
    if (!p.publicationDate) continue;
    const period = getPeriod(p.publicationDate, granularity);
    if (!period) continue;

    if (!map.has(period)) {
      map.set(period, {
        totalOutputs: 0,
        publications: 0,
        datasets: 0,
        software: 0,
        other: 0,
        openCount: 0,
      });
    }

    const acc = map.get(period)!;
    acc.totalOutputs++;

    if (p.type === "publication") acc.publications++;
    else if (p.type === "dataset") acc.datasets++;
    else if (p.type === "software") acc.software++;
    else acc.other++;

    const cat = classifyOAStatus(p) as OACategory;
    if (cat === "gold" || cat === "green" || cat === "hybrid") acc.openCount++;
  }

  // Sort periods chronologically
  const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));

  return sorted.map(([period, acc], i) => ({
    period,
    totalOutputs: acc.totalOutputs,
    publications: acc.publications,
    datasets: acc.datasets,
    software: acc.software,
    other: acc.other,
    oaRate: acc.totalOutputs > 0 ? acc.openCount / acc.totalOutputs : 0,
    growthRate:
      i === 0
        ? null
        : (() => {
            const prev = sorted[i - 1]![1].totalOutputs;
            return prev > 0 ? (acc.totalOutputs - prev) / prev : null;
          })(),
  }));
}

/** Compute growth rates for an already-sorted time series (in-place replacement). */
export function computeGrowthRates(series: TimeSeriesEntry[]): TimeSeriesEntry[] {
  return series.map((entry, i) => {
    if (i === 0) return { ...entry, growthRate: null };
    const prev = series[i - 1]!.totalOutputs;
    return {
      ...entry,
      growthRate: prev > 0 ? (entry.totalOutputs - prev) / prev : null,
    };
  });
}

/** Compute moving averages for windows of 3 and 5 periods. */
export function computeMovingAverages(series: TimeSeriesEntry[]): MovingAverageEntry[] {
  return series.map((entry, i) => {
    const window3 = series.slice(Math.max(0, i - 2), i + 1);
    const window5 = series.slice(Math.max(0, i - 4), i + 1);

    const avg = (w: TimeSeriesEntry[]) =>
      Math.round(w.reduce((s, e) => s + e.totalOutputs, 0) / w.length);

    return {
      period: entry.period,
      ma3: window3.length === 3 ? avg(window3) : null,
      ma5: window5.length === 5 ? avg(window5) : null,
    };
  });
}

/** Compute running cumulative sums per type. */
export function computeCumulative(series: TimeSeriesEntry[]): CumulativeEntry[] {
  let cumulative = 0;
  let publications = 0;
  let datasets = 0;
  let software = 0;
  let other = 0;

  return series.map((entry) => {
    cumulative += entry.totalOutputs;
    publications += entry.publications;
    datasets += entry.datasets;
    software += entry.software;
    other += entry.other;
    return {
      period: entry.period,
      cumulative,
      publications,
      datasets,
      software,
      other,
    };
  });
}

/** Full trends computation — single entry point. */
export function computeTrendsData(
  products: ResearchProduct[],
  granularity: TrendsGranularity = "year"
): TrendsResult {
  const timeSeries = computeTimeSeries(products, granularity);
  const movingAverages = computeMovingAverages(timeSeries);
  const cumulativeOutputs = computeCumulative(timeSeries);

  // Summary
  const totalOutputs = products.length;
  const peak = timeSeries.reduce<TimeSeriesEntry | null>(
    (best, e) => (!best || e.totalOutputs > best.totalOutputs ? e : best),
    null
  );

  const growthRates = timeSeries
    .map((e) => e.growthRate)
    .filter((r): r is number => r !== null);
  const avgYearlyGrowth =
    growthRates.length > 0
      ? growthRates.reduce((s, r) => s + r, 0) / growthRates.length
      : null;

  return {
    timeSeries,
    cumulativeOutputs,
    movingAverages,
    summary: {
      totalOutputs,
      avgYearlyGrowth,
      peakYear: peak?.period ?? "",
      peakCount: peak?.totalOutputs ?? 0,
    },
  };
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
