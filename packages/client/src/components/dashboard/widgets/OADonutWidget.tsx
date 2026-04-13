import { Skeleton } from "../../ui/Skeleton";
import { OADonutChart } from "../../analytics/OADonutChart";
import { useOADistribution } from "../../../hooks/useOADistribution";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function OADonutWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useOADistribution(filters);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={260} />;
  if (isError || !data) {
    return (
      <p className="text-sm text-error text-center py-8">Failed to load data.</p>
    );
  }
  if (data.total === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-8">No results for these filters.</p>
    );
  }

  return (
    <div className="max-w-[300px] mx-auto">
      <OADonutChart data={data} />
    </div>
  );
}
