import { Skeleton } from "../../ui/Skeleton";
import { CumulativeAreaChart } from "../../analytics/CumulativeAreaChart";
import { useTrendsData } from "../../../hooks/useTrendsData";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function TrendsCumulativeWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useTrendsData(filters);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={260} />;
  if (isError || !data) {
    return <p className="text-sm text-error text-center py-8">Failed to load data.</p>;
  }
  if (data.cumulativeOutputs.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No data for these filters.</p>;
  }

  return <CumulativeAreaChart data={data.cumulativeOutputs} />;
}
