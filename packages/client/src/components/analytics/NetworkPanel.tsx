import { useState } from "react";
import { Skeleton } from "../ui/Skeleton";
import { NetworkGraph } from "./NetworkGraph";
import { NetworkMetricCards } from "./NetworkMetricCards";
import { TopNodesTable } from "./TopNodesTable";
import { NodeDetailSidebar } from "./NodeDetailSidebar";
import type { NetworkData, GraphNode } from "@openaire-explorer/shared";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function NetworkSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rect" height={90} />
        ))}
      </div>
      <Skeleton variant="rect" height={480} />
      <Skeleton variant="rect" height={280} />
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { color: "#3b82f6", label: "Author" },
  { color: "#10b981", label: "Organization" },
  { color: "#f59e0b", label: "Project" },
];

const EDGE_LEGEND = [
  { color: "rgba(156,163,175,0.7)", label: "Co-authorship" },
  { color: "rgba(16,185,129,0.6)",  label: "Affiliation" },
  { color: "rgba(245,158,11,0.6)",  label: "Funding" },
];

function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-text-secondary">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
      <span className="mx-1 text-border">|</span>
      {EDGE_LEGEND.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 shrink-0" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface NetworkPanelProps {
  data: NetworkData;
}

export function NetworkPanel({ data }: NetworkPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNode: GraphNode | null =
    selectedId ? (data.nodes.find((n) => n.id === selectedId) ?? null) : null;

  function handleSelectNode(id: string | null) {
    setSelectedId(id === selectedId ? null : id);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Metric cards */}
      <NetworkMetricCards metrics={data.metrics} />

      {/* Graph + sidebar */}
      <div className="flex gap-4 items-start">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <GraphLegend />
          <NetworkGraph
            nodes={data.nodes}
            edges={data.edges}
            selectedId={selectedId}
            onSelectNode={handleSelectNode}
          />
          <p className="text-xs text-text-muted text-center">
            Scroll to zoom · Drag to pan · Click a node to inspect
          </p>
        </div>

        {selectedNode && (
          <div className="w-64 shrink-0">
            <NodeDetailSidebar
              node={selectedNode}
              edges={data.edges}
              allNodes={data.nodes}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {/* Top nodes table */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Top nodes by degree</p>
        <TopNodesTable
          topNodes={data.metrics.topNodes}
          selectedId={selectedId}
          onSelect={handleSelectNode}
        />
      </div>
    </div>
  );
}
