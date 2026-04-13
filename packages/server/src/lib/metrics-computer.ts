import type { ResearchProduct, ComparisonMetrics } from "@openaire-explorer/shared";

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
