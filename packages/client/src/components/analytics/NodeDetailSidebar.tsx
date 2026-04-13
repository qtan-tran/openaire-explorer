import clsx from "clsx";
import type { GraphNode, GraphEdge } from "@openaire-explorer/shared";

const TYPE_COLOR: Record<GraphNode["type"], string> = {
  author:       "text-blue-400",
  organization: "text-green-400",
  project:      "text-amber-500",
};

const EDGE_TYPE_LABEL: Record<GraphEdge["type"], string> = {
  "co-authorship": "Co-authorship",
  "affiliated":    "Affiliation",
  "funded":        "Funding",
};

interface NodeDetailSidebarProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
}

export function NodeDetailSidebar({ node, edges, allNodes, onClose }: NodeDetailSidebarProps) {
  if (!node) return null;

  const nodeById = new Map(allNodes.map((n) => [n.id, n]));

  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );

  const neighbours = connectedEdges.map((e) => {
    const otherId = e.source === node.id ? e.target : e.source;
    return { node: nodeById.get(otherId), edge: e };
  }).filter((c): c is { node: GraphNode; edge: GraphEdge } => c.node !== undefined);

  // Group by edge type
  const byType = new Map<GraphEdge["type"], typeof neighbours>();
  for (const c of neighbours) {
    const bucket = byType.get(c.edge.type) ?? [];
    bucket.push(c);
    byType.set(c.edge.type, bucket);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-secondary/40 p-4 min-w-[240px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", TYPE_COLOR[node.type])}>
            {node.type}
          </p>
          <p className="font-semibold text-foreground mt-0.5 break-words">{node.label}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-text-muted hover:text-foreground transition-colors mt-0.5"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <p className="text-text-muted text-xs">Degree</p>
          <p className="font-semibold text-foreground">{node.degree}</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <p className="text-text-muted text-xs">Connections</p>
          <p className="font-semibold text-foreground">{connectedEdges.length}</p>
        </div>
      </div>

      {/* Neighbours by type */}
      {[...byType.entries()].map(([type, items]) => (
        <div key={type}>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            {EDGE_TYPE_LABEL[type]} ({items.length})
          </p>
          <ul className="flex flex-col gap-1">
            {items.slice(0, 8).map(({ node: nb, edge }) => (
              <li key={nb.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{nb.label}</span>
                {edge.weight > 1 && (
                  <span className="shrink-0 text-xs text-text-muted">×{edge.weight}</span>
                )}
              </li>
            ))}
            {items.length > 8 && (
              <li className="text-xs text-text-muted">+{items.length - 8} more</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
