import { useState } from "react";
import clsx from "clsx";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { StatCard } from "./StatCard";
import { TrendsLineChart } from "./TrendsLineChart";
import { CumulativeAreaChart } from "./CumulativeAreaChart";
import { GrowthRateChart } from "./GrowthRateChart";
import { TrendsSummary } from "./TrendsSummary";
import type { TrendsData } from "../../hooks/useTrendsData";
import type { TrendsMetric } from "./TrendsLineChart";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function TrendsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton variant="rect" height={110} />
        <Skeleton variant="rect" height={110} />
        <Skeleton variant="rect" height={110} />
      </div>
      <Skeleton variant="rect" height={44} />
      <Skeleton variant="rect" height={320} />
      <Skeleton variant="rect" height={200} />
    </div>
  );
}

// ─── Control strip ────────────────────────────────────────────────────────────

type ViewMode = "absolute" | "growth" | "cumulative";

const METRICS: { id: TrendsMetric; label: string }[] = [
  { id: "totalOutputs",  label: "Total" },
  { id: "publications",  label: "Publications" },
  { id: "datasets",      label: "Datasets" },
  { id: "software",      label: "Software" },
];

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "absolute",   label: "Absolute" },
  { id: "growth",     label: "Growth rate" },
  { id: "cumulative", label: "Cumulative" },
];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden shrink-0">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={clsx(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            "border-r border-border last:border-r-0",
            opt.id === value
              ? "bg-accent text-white"
              : "bg-background text-text-secondary hover:text-foreground hover:bg-bg-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface TrendsPanelProps {
  data: TrendsData;
}

export function TrendsPanel({ data }: TrendsPanelProps) {
  const [metric, setMetric] = useState<TrendsMetric>("totalOutputs");
  const [viewMode, setViewMode] = useState<ViewMode>("absolute");
  const [showOARate, setShowOARate] = useState(false);
  const [showMA, setShowMA] = useState(false);

  if (data.timeSeries.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No results"
        description="No research products matched your filters."
      />
    );
  }

  const { summary, timeSeries, cumulativeOutputs, movingAverages } = data;

  const avgGrowthPct =
    summary.avgYearlyGrowth !== null
      ? `${summary.avgYearlyGrowth >= 0 ? "+" : ""}${(summary.avgYearlyGrowth * 100).toFixed(1)}%`
      : "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total outputs"
          value={summary.totalOutputs}
          sub={`across ${timeSeries.length} periods`}
        />
        <StatCard
          label="Avg yearly growth"
          value={avgGrowthPct}
          sub="period-over-period"
          trend={
            summary.avgYearlyGrowth !== null
              ? {
                  direction:
                    summary.avgYearlyGrowth > 0.02
                      ? "up"
                      : summary.avgYearlyGrowth < -0.02
                      ? "down"
                      : "neutral",
                  label: summary.avgYearlyGrowth > 0 ? "growing" : "declining",
                }
              : undefined
          }
        />
        <StatCard
          label="Peak period"
          value={summary.peakYear || "—"}
          sub={summary.peakCount ? `${summary.peakCount.toLocaleString()} outputs` : undefined}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-semibold uppercase tracking-wider shrink-0">
          Metric:
        </div>
        <SegmentedControl options={METRICS} value={metric} onChange={setMetric} />

        <div className="flex items-center gap-2 text-xs text-text-muted font-semibold uppercase tracking-wider shrink-0 ml-2">
          View:
        </div>
        <SegmentedControl options={VIEW_MODES} value={viewMode} onChange={setViewMode} />

        {viewMode === "absolute" && (
          <div className="flex items-center gap-4 ml-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOARate}
                onChange={(e) => setShowOARate(e.target.checked)}
                className="rounded"
              />
              OA rate overlay
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMA}
                onChange={(e) => setShowMA(e.target.checked)}
                className="rounded"
              />
              Moving averages
            </label>
          </div>
        )}
      </div>

      {/* Main chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "absolute" && "Output over time"}
            {viewMode === "growth" && "Year-over-year growth rate"}
            {viewMode === "cumulative" && "Cumulative outputs by type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "absolute" && (
            <TrendsLineChart
              series={timeSeries}
              movingAverages={movingAverages}
              metric={metric}
              showOARate={showOARate}
              showMA={showMA}
            />
          )}
          {viewMode === "growth" && timeSeries.filter((e) => e.growthRate !== null).length >= 2 ? (
            <GrowthRateChart series={timeSeries} />
          ) : viewMode === "growth" ? (
            <EmptyState
              title="Not enough data"
              description="Need at least two periods to compute growth rates."
            />
          ) : null}
          {viewMode === "cumulative" && (
            <CumulativeAreaChart data={cumulativeOutputs} />
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <TrendsSummary data={data} />
    </div>
  );
}
