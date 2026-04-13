import { useState } from "react";
import { Skeleton } from "../../ui/Skeleton";
import { NetworkGraph } from "../../analytics/NetworkGraph";
import { useNetworkData } from "../../../hooks/useNetworkData";
import type { WidgetProps } from "../../../lib/widget-registry";

const LEGEND = [
  { color: "#3b82f6", label: "Author" },
  { color: "#10b981", label: "Organization" },
  { color: "#f59e0b", label: "Project" },
];

function NoFilter() {
  return (
    <p className="text-sm text-text-muted text-center py-8">
      Apply a filter above to load data.
    </p>
  );
}

export default function NetworkGraphWidget({ filters }: WidgetProps) {
  const hasFilter = Object.values(filters).some(Boolean);
  const { data, isLoading, isError } = useNetworkData(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!hasFilter) return <NoFilter />;
  if (isLoading) return <Skeleton variant="rect" height={400} />;
  if (isError || !data) {
    return <p className="text-sm text-error text-center py-8">Failed to load network.</p>;
  }
  if (data.nodes.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No connections found.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
        <span className="text-text-muted ml-2">
          {data.metrics.nodeCount} nodes · {data.metrics.edgeCount} edges
        </span>
      </div>
      <NetworkGraph
        nodes={data.nodes}
        edges={data.edges}
        selectedId={selectedId}
        onSelectNode={setSelectedId}
      />
      <p className="text-xs text-text-muted text-center">
        Scroll to zoom · Drag to pan · Click a node to inspect
      </p>
    </div>
  );
}
