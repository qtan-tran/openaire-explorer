import clsx from "clsx";
import type { NetworkMetrics, GraphNode } from "@openaire-explorer/shared";

const TYPE_BADGE: Record<GraphNode["type"], { label: string; cls: string }> = {
  author:       { label: "Author",       cls: "bg-blue-500/15 text-blue-400" },
  organization: { label: "Organization", cls: "bg-green-500/15 text-green-400" },
  project:      { label: "Project",      cls: "bg-amber-500/15 text-amber-500" },
};

interface TopNodesTableProps {
  topNodes: NetworkMetrics["topNodes"];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export function TopNodesTable({ topNodes, selectedId, onSelect }: TopNodesTableProps) {
  if (topNodes.length === 0) return null;

  const maxDegree = topNodes[0]?.degree ?? 1;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-secondary/60">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">#</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Degree</th>
          </tr>
        </thead>
        <tbody>
          {topNodes.map((node, i) => {
            const badge = TYPE_BADGE[node.type];
            const barWidth = maxDegree > 0 ? `${(node.degree / maxDegree) * 100}%` : "0%";
            const isSelected = node.id === selectedId;

            return (
              <tr
                key={node.id}
                onClick={() => onSelect(node.id)}
                className={clsx(
                  "border-b border-border last:border-b-0 cursor-pointer transition-colors",
                  isSelected
                    ? "bg-accent/10"
                    : "hover:bg-bg-secondary/50"
                )}
              >
                <td className="px-4 py-2.5 text-text-muted">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-foreground max-w-[200px] truncate">
                  {node.label}
                </td>
                <td className="px-4 py-2.5">
                  <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", badge.cls)}>
                    {badge.label}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-accent/20 w-24 overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: barWidth }} />
                    </div>
                    <span className="text-text-secondary tabular-nums">{node.degree}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
