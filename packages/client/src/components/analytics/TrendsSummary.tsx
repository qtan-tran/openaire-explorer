import type { TrendsData } from "../../hooks/useTrendsData";

interface TrendsSummaryProps {
  data: TrendsData;
}

function fmt(n: number) {
  return n.toLocaleString();
}

function pct(rate: number) {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${(rate * 100).toFixed(1)}%`;
}

export function TrendsSummary({ data }: TrendsSummaryProps) {
  const { summary, timeSeries } = data;

  if (timeSeries.length === 0) return null;

  const insights: string[] = [];

  // Total span
  const first = timeSeries[0];
  const last = timeSeries[timeSeries.length - 1];
  insights.push(
    `${fmt(summary.totalOutputs)} research products found across ${timeSeries.length} period${timeSeries.length !== 1 ? "s" : ""} (${first.period} – ${last.period}).`
  );

  // Peak
  if (summary.peakYear) {
    insights.push(
      `Output peaked in ${summary.peakYear} with ${fmt(summary.peakCount)} publications.`
    );
  }

  // Average growth
  if (summary.avgYearlyGrowth !== null) {
    const direction =
      summary.avgYearlyGrowth > 0.02
        ? "growing"
        : summary.avgYearlyGrowth < -0.02
        ? "declining"
        : "stable";
    insights.push(
      `Average period-over-period growth: ${pct(summary.avgYearlyGrowth)} — output is ${direction}.`
    );
  }

  // Best growth period
  const bestGrowth = timeSeries
    .filter((e) => e.growthRate !== null)
    .reduce<(typeof timeSeries)[number] | null>(
      (best, e) => (!best || (e.growthRate ?? -Infinity) > (best.growthRate ?? -Infinity) ? e : best),
      null
    );
  if (bestGrowth && bestGrowth.growthRate !== null && bestGrowth.growthRate > 0.05) {
    insights.push(
      `Strongest growth: ${pct(bestGrowth.growthRate)} in ${bestGrowth.period} (${fmt(bestGrowth.totalOutputs)} outputs).`
    );
  }

  // OA trend
  const recentOA = timeSeries.slice(-3).map((e) => e.oaRate);
  const avgRecentOA = recentOA.reduce((s, r) => s + r, 0) / recentOA.length;
  if (avgRecentOA > 0) {
    insights.push(
      `Recent OA rate (last ${recentOA.length} period${recentOA.length !== 1 ? "s" : ""}): ${(avgRecentOA * 100).toFixed(0)}% open access.`
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        Auto-generated insights
      </p>
      <ul className="flex flex-col gap-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-accent mt-0.5 shrink-0">•</span>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
