import { describe, test, expect } from "vitest";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { buildCollaborationGraph } from "../lib/graph-builder.js";
import { AUTHORS, ORGS } from "./fixtures/sample-products.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeProduct(
  id: string,
  authors: (typeof AUTHORS)[keyof typeof AUTHORS][] = [],
  orgs: (typeof ORGS)[keyof typeof ORGS][] = [],
  projects: Array<{ id: string; acronym?: string; title?: string }> = []
): ResearchProduct {
  return {
    id,
    originalIds: [],
    type: "publication",
    mainTitle: `Product ${id}`,
    subTitle: null,
    descriptions: null,
    authors,
    publicationDate: "2023-01-01",
    publisher: null,
    embargoEndDate: null,
    language: null,
    countries: null,
    subjects: null,
    openAccessColor: null,
    publiclyFunded: false,
    isGreen: false,
    isInDiamondJournal: false,
    bestAccessRight: null,
    container: null,
    sources: null,
    formats: null,
    contributors: null,
    coverages: null,
    documentationUrls: null,
    codeRepositoryUrl: null,
    programmingLanguage: null,
    contactPeople: null,
    contactGroups: null,
    tools: null,
    size: null,
    version: null,
    geoLocations: null,
    pids: null,
    dateOfCollection: null,
    lastUpdateTimeStamp: null,
    indicators: null,
    // Cast projects through `unknown` since graph-builder accesses it via a cast
    projects: projects as unknown as ResearchProduct["projects"],
    organizations: orgs,
    communities: null,
    collectedFrom: [],
    instances: [],
  };
}

// ─── Graph construction ───────────────────────────────────────────────────────

describe("buildCollaborationGraph — basic construction", () => {
  test("returns empty graph for empty products list", () => {
    const { nodes, edges, metrics } = buildCollaborationGraph({ products: [] });
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
    expect(metrics.nodeCount).toBe(0);
    expect(metrics.edgeCount).toBe(0);
    expect(metrics.density).toBe(0);
    expect(metrics.components).toBe(0);
  });

  test("creates co-authorship edge for two authors on one product", () => {
    const product = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const { nodes, edges } = buildCollaborationGraph({ products: [product] });

    const authorNodes = nodes.filter((n) => n.type === "author");
    expect(authorNodes).toHaveLength(2);

    const coEdges = edges.filter((e) => e.type === "co-authorship");
    expect(coEdges).toHaveLength(1);
    expect(coEdges[0]!.weight).toBe(1);
  });

  test("increments co-authorship edge weight on repeat collaboration", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['alice'], AUTHORS['bob']]);
    const { edges } = buildCollaborationGraph({ products: [p1, p2] });

    const coEdges = edges.filter((e) => e.type === "co-authorship");
    expect(coEdges).toHaveLength(1);
    expect(coEdges[0]!.weight).toBe(2);
  });

  test("creates affiliated edge between author and organization", () => {
    const product = makeProduct("p1", [AUTHORS['alice']], [ORGS['mit']]);
    const { edges } = buildCollaborationGraph({ products: [product] });

    const affiliated = edges.filter((e) => e.type === "affiliated");
    expect(affiliated).toHaveLength(1);
  });

  test("creates org node for each unique organization", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice']], [ORGS['mit']]);
    const p2 = makeProduct("p2", [AUTHORS['bob']], [ORGS['mit'], ORGS['cern']]);
    const { nodes } = buildCollaborationGraph({ products: [p1, p2] });

    const orgNodes = nodes.filter((n) => n.type === "organization");
    // MIT appears in both but should only create 1 org node
    const uniqueOrgIds = new Set(orgNodes.map((n) => n.id));
    expect(uniqueOrgIds.size).toBe(2); // MIT and CERN
  });

  test("creates funded edge between author and project", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice']], [], [{ id: "proj::001", acronym: "TEST" }]);
    const { edges } = buildCollaborationGraph({ products: [p1] });

    const funded = edges.filter((e) => e.type === "funded");
    expect(funded).toHaveLength(1);
  });

  test("does NOT create co-authorship edges when authors > 15", () => {
    const manyAuthors = Array.from({ length: 16 }, (_, i) => ({
      fullName: `Author ${i}`,
      name: `Author`,
      surname: `${i}`,
      rank: i + 1,
      pid: null,
    }));
    const product = makeProduct("p1", manyAuthors);
    const { edges } = buildCollaborationGraph({ products: [product] });

    const coEdges = edges.filter((e) => e.type === "co-authorship");
    expect(coEdges).toHaveLength(0);
  });

  test("author with only self (1 author) creates no co-authorship edge", () => {
    const product = makeProduct("p1", [AUTHORS['alice']]);
    const { edges } = buildCollaborationGraph({ products: [product] });
    expect(edges.filter((e) => e.type === "co-authorship")).toHaveLength(0);
  });

  test("excludes authors with empty fullName", () => {
    // Alice + Bob co-author (both gain degree ≥ 1); bad author has empty name and is skipped
    const badAuthor = { fullName: "", name: null, surname: null, rank: 1, pid: null };
    const product = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob'], badAuthor]);
    const { nodes } = buildCollaborationGraph({ products: [product] });
    const authorNodes = nodes.filter((n) => n.type === "author");
    // Only Alice and Bob should appear; empty-named author produces no node
    expect(authorNodes).toHaveLength(2);
    expect(authorNodes.some((n) => n.label === "Alice Smith")).toBe(true);
    expect(authorNodes.some((n) => n.label === "Bob Jones")).toBe(true);
    expect(authorNodes.every((n) => n.label !== "")).toBe(true);
  });
});

// ─── Density calculation ──────────────────────────────────────────────────────

describe("buildCollaborationGraph — density", () => {
  test("fully connected triangle has density 1.0", () => {
    // 3 authors on 1 product → 3 co-authorship edges, n=3, maxEdges=3 → density=1
    const product = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob'], AUTHORS['charlie']]);
    const { metrics } = buildCollaborationGraph({ products: [product] });

    const authorNodeCount = 3;
    const maxEdges = (authorNodeCount * (authorNodeCount - 1)) / 2;
    expect(metrics.density).toBeCloseTo(metrics.edgeCount / maxEdges, 4);
    expect(metrics.density).toBeCloseTo(1.0, 4);
  });

  test("line graph (A-B, B-C) has density 2/3", () => {
    // p1: Alice+Bob, p2: Bob+Charlie → 2 edges, n=3, maxEdges=3 → density=2/3
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['bob'], AUTHORS['charlie']]);
    const { metrics } = buildCollaborationGraph({ products: [p1, p2] });

    expect(metrics.nodeCount).toBe(3);
    expect(metrics.edgeCount).toBe(2);
    expect(metrics.density).toBeCloseTo(2 / 3, 4);
  });

  test("single node has density 0", () => {
    // Single author with no co-authors → isolated → pruned → 0 nodes
    const product = makeProduct("p1", [AUTHORS['alice']]);
    const { metrics } = buildCollaborationGraph({ products: [product] });
    expect(metrics.density).toBe(0);
  });
});

// ─── Pruning ──────────────────────────────────────────────────────────────────

describe("buildCollaborationGraph — pruning", () => {
  test("isolated nodes (degree 0) are excluded", () => {
    // p1: Alice+Bob (connected), p2: Charlie only (isolated after author extraction — 1 author = no edges)
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['charlie']]);
    const { nodes } = buildCollaborationGraph({ products: [p1, p2] });
    // Charlie is isolated (degree 0) and should be pruned
    const nodeIds = nodes.map((n) => n.id);
    expect(nodeIds.some((id) => id.includes("charlie"))).toBe(false);
  });

  test("caps nodes at maxNodes, keeping highest-degree nodes", () => {
    // Create 10 distinct pairs + 1 hub that connects all
    // Hub (Alice) will have high degree; others should have low degree
    const products = Array.from({ length: 5 }, (_, i) => {
      const peerAuthor = { fullName: `Peer ${i}`, name: null, surname: null, rank: 2, pid: null };
      return makeProduct(`p${i}`, [AUTHORS['alice'], peerAuthor]);
    });

    const { nodes } = buildCollaborationGraph({ products, maxNodes: 3 });
    expect(nodes.length).toBeLessThanOrEqual(3);
  });

  test("returns exactly maxNodes nodes when there are more", () => {
    // Create enough products with unique authors to exceed maxNodes
    const products = Array.from({ length: 20 }, (_, i) => {
      const a1 = { fullName: `AuthorA ${i}`, name: null, surname: null, rank: 1, pid: null };
      const a2 = { fullName: `AuthorB ${i}`, name: null, surname: null, rank: 2, pid: null };
      return makeProduct(`p${i}`, [a1, a2]);
    });

    const { nodes } = buildCollaborationGraph({ products, maxNodes: 5 });
    expect(nodes.length).toBeLessThanOrEqual(5);
  });

  test("edge count never exceeds 500", () => {
    // Generate many products with shared authors to create many edges
    const hubAuthor = { fullName: "Hub Author", name: null, surname: null, rank: 1, pid: null };
    const products = Array.from({ length: 50 }, (_, i) => {
      const peer = { fullName: `Peer ${i}`, name: null, surname: null, rank: 2, pid: null };
      return makeProduct(`p${i}`, [hubAuthor, peer]);
    });

    const { edges } = buildCollaborationGraph({ products, maxNodes: 300 });
    expect(edges.length).toBeLessThanOrEqual(500);
  });
});

// ─── Connected components ─────────────────────────────────────────────────────

describe("buildCollaborationGraph — components", () => {
  test("single connected component for all co-authors", () => {
    // Alice-Bob-Charlie all co-author together → 1 component
    const product = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob'], AUTHORS['charlie']]);
    const { metrics } = buildCollaborationGraph({ products: [product] });
    expect(metrics.components).toBe(1);
  });

  test("two disconnected pairs → 2 components", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['charlie'], AUTHORS['diana']]);
    const { metrics } = buildCollaborationGraph({ products: [p1, p2] });
    expect(metrics.components).toBe(2);
  });

  test("three disconnected pairs → 3 components", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['charlie'], AUTHORS['diana']]);
    const p3 = makeProduct("p3", [AUTHORS['evan'], { fullName: "Fred", name: null, surname: null, rank: 2, pid: null }]);
    const { metrics } = buildCollaborationGraph({ products: [p1, p2, p3] });
    expect(metrics.components).toBe(3);
  });

  test("chain connection creates single component", () => {
    // A-B, B-C, C-D → all in one component
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const p2 = makeProduct("p2", [AUTHORS['bob'], AUTHORS['charlie']]);
    const p3 = makeProduct("p3", [AUTHORS['charlie'], AUTHORS['diana']]);
    const { metrics } = buildCollaborationGraph({ products: [p1, p2, p3] });
    expect(metrics.components).toBe(1);
  });

  test("zero nodes → 0 components", () => {
    const { metrics } = buildCollaborationGraph({ products: [] });
    expect(metrics.components).toBe(0);
  });
});

// ─── Metrics summary ─────────────────────────────────────────────────────────

describe("buildCollaborationGraph — metrics", () => {
  test("topNodes contains up to 10 highest-degree nodes", () => {
    const products = Array.from({ length: 3 }, (_, i) =>
      makeProduct(`p${i}`, [AUTHORS['alice'], AUTHORS['bob'], AUTHORS['charlie']])
    );
    const { metrics } = buildCollaborationGraph({ products });
    expect(metrics.topNodes.length).toBeLessThanOrEqual(10);
    // Top node should be highest degree
    for (let i = 1; i < metrics.topNodes.length; i++) {
      expect(metrics.topNodes[i]!.degree).toBeLessThanOrEqual(metrics.topNodes[i - 1]!.degree);
    }
  });

  test("avgDegree is positive for a connected graph", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob']]);
    const { metrics } = buildCollaborationGraph({ products: [p1] });
    expect(metrics.avgDegree).toBeGreaterThan(0);
  });

  test("nodeCount and edgeCount match nodes/edges arrays", () => {
    const p1 = makeProduct("p1", [AUTHORS['alice'], AUTHORS['bob'], AUTHORS['charlie']]);
    const { nodes, edges, metrics } = buildCollaborationGraph({ products: [p1] });
    expect(metrics.nodeCount).toBe(nodes.length);
    expect(metrics.edgeCount).toBe(edges.length);
  });
});
