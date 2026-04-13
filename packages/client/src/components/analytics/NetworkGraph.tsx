import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import type { GraphNode, GraphEdge } from "@openaire-explorer/shared";

// ─── Node/edge colours ────────────────────────────────────────────────────────

const NODE_COLORS: Record<GraphNode["type"], { bg: string; border: string }> = {
  author:       { bg: "#3b82f6", border: "#2563eb" },
  organization: { bg: "#10b981", border: "#059669" },
  project:      { bg: "#f59e0b", border: "#d97706" },
};

const EDGE_COLORS: Record<GraphEdge["type"], string> = {
  "co-authorship": "rgba(156,163,175,0.5)",
  "affiliated":    "rgba(16,185,129,0.35)",
  "funded":        "rgba(245,158,11,0.35)",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NetworkGraph({ nodes, edges, selectedId, onSelectNode }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Build/rebuild cytoscape instance when data changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Tear down previous instance
    cyRef.current?.destroy();

    const elements: cytoscape.ElementDefinition[] = [
      ...nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          nodeType: n.type,
          degree: n.degree,
        },
      })),
      ...edges.map((e) => ({
        data: {
          id: `${e.source}--${e.target}--${e.type}`,
          source: e.source,
          target: e.target,
          weight: e.weight,
          edgeType: e.type,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: {
        name: "cose",
        animate: false,
        nodeRepulsion: () => 4000,
        idealEdgeLength: () => 80,
        edgeElasticity: () => 0.3,
        gravity: 0.05,
        numIter: 500,
        fit: true,
        padding: 30,
      } as cytoscape.LayoutOptions,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": 10,
            "text-valign": "bottom",
            "text-margin-y": 4,
            color: "#e5e7eb",
            "text-outline-color": "#111827",
            "text-outline-width": 1,
            width: (ele: cytoscape.NodeSingular) => Math.max(14, Math.min(40, 8 + ele.data("degree") * 2)),
            height: (ele: cytoscape.NodeSingular) => Math.max(14, Math.min(40, 8 + ele.data("degree") * 2)),
            "background-color": (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data("nodeType") as GraphNode["type"]]?.bg ?? "#6b7280",
            "border-color": (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data("nodeType") as GraphNode["type"]]?.border ?? "#4b5563",
            "border-width": 1.5,
          },
        },
        {
          selector: "node:selected, node.highlighted",
          style: {
            "border-width": 3,
            "border-color": "#f9fafb",
            "z-index": 10,
          },
        },
        {
          selector: "edge",
          style: {
            width: (ele: cytoscape.EdgeSingular) => Math.min(4, 0.8 + (ele.data("weight") as number) * 0.4),
            "line-color": (ele: cytoscape.EdgeSingular) =>
              EDGE_COLORS[ele.data("edgeType") as GraphEdge["type"]] ?? "rgba(156,163,175,0.3)",
            "curve-style": "bezier",
            opacity: 0.85,
          },
        },
        {
          selector: "edge:selected, edge.highlighted",
          style: { opacity: 1, "line-color": "#f9fafb" },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    // Click on node → select
    cy.on("tap", "node", (evt) => {
      const id = evt.target.id() as string;
      onSelectNode(id);
    });

    // Click on background → deselect
    cy.on("tap", (evt) => {
      if (evt.target === cy) onSelectNode(null);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Sync external selection → cytoscape highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("highlighted");

    if (selectedId) {
      const node = cy.getElementById(selectedId);
      if (node.length) {
        node.addClass("highlighted");
        node.neighborhood().addClass("highlighted");
        cy.animate({ fit: { eles: node.closedNeighborhood(), padding: 60 } } as Parameters<typeof cy.animate>[0], { duration: 400 });
      }
    }
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[480px] rounded-xl overflow-hidden bg-bg-secondary/30 border border-border"
    />
  );
}
