import { StatCard } from "../../analytics/StatCard";
import { Skeleton } from "../../ui/Skeleton";
import { useOADistribution } from "../../../hooks/useOADistribution";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function StatCardWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useOADistribution(filters);

  if (!hasFilter) return <NoFilter />;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton variant="rect" height={90} />
        <Skeleton variant="rect" height={90} />
        <Skeleton variant="rect" height={90} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-error text-center py-8">
        Failed to load data.
      </p>
    );
  }

  const oaPercent = `${(data.oaRate * 100).toFixed(1)}%`;
  const closedCount =
    (data.distribution.closed?.count ?? 0) +
    (data.distribution.unknown?.count ?? 0);
  const openCount = data.total - closedCount;
  const ratio = closedCount > 0 ? (openCount / closedCount).toFixed(1) : "∞";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard label="Total outputs" value={data.total} sub="research products" />
      <StatCard label="OA rate" value={oaPercent} sub="gold + green + hybrid" />
      <StatCard
        label="Open / Closed"
        value={`${ratio} : 1`}
        sub={`${openCount.toLocaleString()} open`}
      />
    </div>
  );
}
