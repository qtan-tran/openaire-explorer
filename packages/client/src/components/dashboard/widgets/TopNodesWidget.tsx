import { useState } from "react";
import { Skeleton } from "../../ui/Skeleton";
import { TopNodesTable } from "../../analytics/TopNodesTable";
import { useNetworkData } from "../../../hooks/useNetworkData";
import type { WidgetProps } from "../../../lib/widget-registry";

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function TopNodesWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useNetworkData(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={260} />;
  if (isError || !data) {
    return <p className="text-sm text-error text-center py-8">Failed to load data.</p>;
  }
  if (data.metrics.topNodes.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No network data for these filters.</p>;
  }

  return (
    <TopNodesTable
      topNodes={data.metrics.topNodes}
      selectedId={selectedId}
      onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
    />
  );
}
