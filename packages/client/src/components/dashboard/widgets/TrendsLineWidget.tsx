import { useState } from "react";
import { Skeleton } from "../../ui/Skeleton";
import { TrendsLineChart } from "../../analytics/TrendsLineChart";
import { useTrendsData } from "../../../hooks/useTrendsData";
import type { WidgetProps } from "../../../lib/widget-registry";
import type { TrendsMetric } from "../../analytics/TrendsLineChart";

const METRICS: { id: TrendsMetric; label: string }[] = [
  { id: "totalOutputs", label: "Total" },
  { id: "publications", label: "Publications" },
  { id: "datasets",     label: "Datasets" },
  { id: "software",     label: "Software" },
];

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function TrendsLineWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useTrendsData(filters);
  const [metric, setMetric]     = useState<TrendsMetric>("totalOutputs");
  const [showOARate, setShowOARate] = useState(false);
  const [showMA, setShowMA]     = useState(false);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={280} />;
  if (isError || !data) {
    return <p className="text-sm text-error text-center py-8">Failed to load data.</p>;
  }
  if (data.timeSeries.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No time-series data.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              className={`px-2.5 py-1 border-r border-border last:border-r-0 transition-colors ${
                m.id === metric
                  ? "bg-accent text-white"
                  : "bg-background text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input type="checkbox" checked={showOARate} onChange={(e) => setShowOARate(e.target.checked)} className="rounded" />
          OA rate
        </label>
        <label className="inline-flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} className="rounded" />
          Moving avg
        </label>
      </div>
      <TrendsLineChart
        series={data.timeSeries}
        movingAverages={data.movingAverages}
        metric={metric}
        showOARate={showOARate}
        showMA={showMA}
      />
    </div>
  );
}
