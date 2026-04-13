import { OADistributionPanel, OADistributionSkeleton } from "../../analytics/OADistributionPanel";
import { useOADistribution } from "../../../hooks/useOADistribution";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function OADistributionWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError, error } = useOADistribution(filters);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <OADistributionSkeleton />;
  if (isError) {
    return (
      <p className="text-sm text-error text-center py-8">
        {(error as Error)?.message ?? "Failed to load data."}
      </p>
    );
  }
  if (!data) return null;

  return <OADistributionPanel data={data} />;
}
