import { StatCard } from "./StatCard";
import type { NetworkMetrics } from "@openaire-explorer/shared";

interface NetworkMetricCardsProps {
  metrics: NetworkMetrics;
}

export function NetworkMetricCards({ metrics }: NetworkMetricCardsProps) {
  const densityPct = `${(metrics.density * 100).toFixed(2)}%`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard label="Nodes" value={metrics.nodeCount.toLocaleString()} sub="authors, orgs & projects" />
      <StatCard label="Edges" value={metrics.edgeCount.toLocaleString()} sub="connections" />
      <StatCard label="Density" value={densityPct} sub="edge density" />
      <StatCard label="Avg degree" value={metrics.avgDegree.toFixed(1)} sub="connections per node" />
      <StatCard label="Components" value={metrics.components} sub="sub-graphs" />
    </div>
  );
}
