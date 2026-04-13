import { Skeleton } from "../../ui/Skeleton";
import { GrowthRateChart } from "../../analytics/GrowthRateChart";
import { EmptyState } from "../../ui/EmptyState";
import { useTrendsData } from "../../../hooks/useTrendsData";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function GrowthRateWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useTrendsData(filters);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={260} />;
  if (isError || !data) {
    return <p className="text-sm text-error text-center py-8">Failed to load data.</p>;
  }

  const withRates = data.timeSeries.filter((e) => e.growthRate !== null);
  if (withRates.length < 2) {
    return (
      <EmptyState
        title="Not enough data"
        description="Need at least two periods to compute growth rates."
      />
    );
  }

  return <GrowthRateChart series={data.timeSeries} />;
}
