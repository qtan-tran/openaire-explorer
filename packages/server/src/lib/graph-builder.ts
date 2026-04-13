import type {
  ResearchProduct,
  GraphNode,
  GraphEdge,
  NetworkData,
  NetworkMetrics,
} from "@openaire-explorer/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildParams {
  products: ResearchProduct[];
  maxNodes?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize an author name to a stable key (lower-case, trimmed). */
function normalizeAuthor(fullName: string): string {
  return fullName.trim().toLowerCase();
}

/** Extract a stable author ID: prefer ORCID, fall back to normalized name. */
function authorId(author: { fullName: string; pid?: { id?: { scheme?: string; value?: string } } | null }): string {
  const orcid = author.pid?.id?.scheme === "orcid" ? author.pid.id.value : null;
  return orcid ? `author:${orcid}` : `author:${normalizeAuthor(author.fullName)}`;
}

// ─── BFS – count connected components ────────────────────────────────────────

function countComponents(nodeIds: string[], adjacency: Map<string, Set<string>>): number {
  const visited = new Set<string>();
  let components = 0;

  for (const id of nodeIds) {
    if (visited.has(id)) continue;
    components++;
    const queue = [id];
    while (queue.length) {
      const cur = queue.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const neighbour of adjacency.get(cur) ?? []) {
        if (!visited.has(neighbour)) queue.push(neighbour);
      }
    }
  }

  return components;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildCollaborationGraph({ products, maxNodes = 100 }: BuildParams): NetworkData {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();       // key = `${src}||${tgt}||${type}`
  const adjacency = new Map<string, Set<string>>();

  // ── helper: upsert node ──────────────────────────────────────────────────
  function upsertNode(id: string, label: string, type: GraphNode["type"], meta?: Record<string, unknown>) {
    if (!nodeMap.has(id)) {
      const node: GraphNode = { id, label, type, degree: 0 };
      if (meta !== undefined) node.metadata = meta;
      nodeMap.set(id, node);
      adjacency.set(id, new Set());
    }
  }

  // ── helper: upsert / increment edge ─────────────────────────────────────
  function upsertEdge(source: string, target: string, type: GraphEdge["type"]) {
    const key = source < target
      ? `${source}||${target}||${type}`
      : `${target}||${source}||${type}`;

    const existing = edgeMap.get(key);
    if (existing) {
      existing.weight += 1;
    } else {
      edgeMap.set(key, { source, target, weight: 1, type });
    }

    adjacency.get(source)?.add(target);
    adjacency.get(target)?.add(source);
  }

  // ── Process products ──────────────────────────────────────────────────────
  for (const product of products) {
    const authors = product.authors ?? [];
    const orgs = product.organizations ?? [];
    const projs = (product as unknown as { projects?: Array<{ id: string; acronym?: string; title?: string }> }).projects ?? [];

    // ── Organization nodes ────────────────────────────────────────────────
    for (const org of orgs) {
      if (!org.id) continue;
      const orgNodeId = `org:${org.id}`;
      upsertNode(orgNodeId, org.acronym || org.legalName || org.id, "organization", { orgId: org.id });
    }

    // ── Project nodes ─────────────────────────────────────────────────────
    for (const proj of projs) {
      if (!proj.id) continue;
      const projNodeId = `proj:${proj.id}`;
      upsertNode(projNodeId, proj.acronym || proj.title || proj.id, "project", { projectId: proj.id });
    }

    // ── Author nodes ──────────────────────────────────────────────────────
    const authorIds: string[] = [];
    for (const author of authors) {
      if (!author.fullName?.trim()) continue;
      const aid = authorId(author as { fullName: string; pid?: { id?: { scheme?: string; value?: string } } | null });
      upsertNode(aid, author.fullName.trim(), "author");
      authorIds.push(aid);

      // author ↔ org (affiliated)
      for (const org of orgs) {
        if (!org.id) continue;
        upsertEdge(aid, `org:${org.id}`, "affiliated");
      }

      // author ↔ project (funded)
      for (const proj of projs) {
        if (!proj.id) continue;
        upsertEdge(aid, `proj:${proj.id}`, "funded");
      }
    }

    // ── Co-authorship edges (skip if too many authors — quadratic explosion) ──
    if (authorIds.length >= 2 && authorIds.length <= 15) {
      for (let i = 0; i < authorIds.length; i++) {
        for (let j = i + 1; j < authorIds.length; j++) {
          const a = authorIds[i];
          const b = authorIds[j];
          if (a !== undefined && b !== undefined) {
            upsertEdge(a, b, "co-authorship");
          }
        }
      }
    }
  }

  // ── Compute degrees ───────────────────────────────────────────────────────
  for (const edge of edgeMap.values()) {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src) src.degree += 1;
    if (tgt) tgt.degree += 1;
  }

  // ── Prune: remove isolated nodes ─────────────────────────────────────────
  let nodes = [...nodeMap.values()].filter((n) => n.degree > 0);

  // ── Prune: cap at maxNodes by degree ─────────────────────────────────────
  if (nodes.length > maxNodes) {
    nodes.sort((a, b) => b.degree - a.degree);
    nodes = nodes.slice(0, maxNodes);
  }

  const keepIds = new Set(nodes.map((n) => n.id));

  // ── Prune edges to only kept nodes, cap at 500 ────────────────────────────
  let edges = [...edgeMap.values()].filter(
    (e) => keepIds.has(e.source) && keepIds.has(e.target)
  );
  if (edges.length > 500) {
    edges.sort((a, b) => b.weight - a.weight);
    edges = edges.slice(0, 500);
  }

  // ── Recompute adjacency for component count on pruned graph ───────────────
  const prunedAdj = new Map<string, Set<string>>();
  for (const n of nodes) prunedAdj.set(n.id, new Set());
  for (const e of edges) {
    prunedAdj.get(e.source)?.add(e.target);
    prunedAdj.get(e.target)?.add(e.source);
  }

  const components = countComponents(nodes.map((n) => n.id), prunedAdj);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const n = nodes.length;
  const maxPossibleEdges = n > 1 ? (n * (n - 1)) / 2 : 0;
  const density = maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;
  const avgDegree = n > 0 ? nodes.reduce((s, nd) => s + nd.degree, 0) / n : 0;

  const topNodes = [...nodes]
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10)
    .map(({ id, label, type, degree }) => ({ id, label, type, degree }));

  const metrics: NetworkMetrics = {
    nodeCount: n,
    edgeCount: edges.length,
    density: Math.round(density * 10000) / 10000,
    avgDegree: Math.round(avgDegree * 100) / 100,
    topNodes,
    components,
  };

  return { nodes, edges, metrics };
}
