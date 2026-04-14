import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonTable } from "../../../components/comparison/ComparisonTable";
import type { ComparisonEntity, ComparisonMetrics } from "@openaire-explorer/shared";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeEntity(id: string, name: string): ComparisonEntity {
  return { id, type: "organization", name };
}

function makeMetrics(entityId: string, overrides: Partial<ComparisonMetrics> = {}): ComparisonMetrics {
  return {
    entityId,
    totalOutputs: 100,
    oaRate: 0.75,
    outputsByType: { publications: 70, datasets: 20, software: 8, other: 2 },
    oaDistribution: { gold: 40, green: 30, hybrid: 5, bronze: 5, closed: 10, unknown: 10 },
    yearlyOutputs: [{ year: 2023, count: 50 }, { year: 2022, count: 50 }],
    citationProfile: { c1: 5, c2: 15, c3: 30, c4: 30, c5: 20 },
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ComparisonTable", () => {
  test("renders entity names as column headers", () => {
    const entities = [makeEntity("e1", "MIT"), makeEntity("e2", "CERN")];
    const metrics = [makeMetrics("e1"), makeMetrics("e2")];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("MIT")).toBeTruthy();
    expect(screen.getByText("CERN")).toBeTruthy();
  });

  test("renders total outputs row with formatted numbers", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1", { totalOutputs: 12345 })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    // Intl.NumberFormat formats 12345 as "12,345" (en locale)
    expect(screen.getByText("12,345")).toBeTruthy();
  });

  test("renders OA rate row", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1", { oaRate: 0.75 })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("75%")).toBeTruthy();
  });

  test("renders publications count", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1", { outputsByType: { publications: 70, datasets: 20, software: 8, other: 2 } })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("70")).toBeTruthy();
  });

  test("renders datasets count", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1")];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("20")).toBeTruthy();
  });

  test("renders the Metric column header", () => {
    render(<ComparisonTable entities={[makeEntity("e1", "MIT")]} metrics={[makeMetrics("e1")]} />);
    expect(screen.getByText("Metric")).toBeTruthy();
  });

  test("renders all defined row labels", () => {
    render(<ComparisonTable entities={[makeEntity("e1", "MIT")]} metrics={[makeMetrics("e1")]} />);
    expect(screen.getByText("Total outputs")).toBeTruthy();
    expect(screen.getByText("OA rate")).toBeTruthy();
    expect(screen.getByText("Publications")).toBeTruthy();
    expect(screen.getByText("Datasets")).toBeTruthy();
    expect(screen.getByText("Software")).toBeTruthy();
    expect(screen.getByText("Top citation class")).toBeTruthy();
  });

  test("renders top citation class correctly", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1", { citationProfile: { c1: 5, c2: 15, c3: 0, c4: 0, c5: 0 } })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("C1 (5)")).toBeTruthy();
  });

  test("renders — for top citation class when all counts are zero", () => {
    const entities = [makeEntity("e1", "MIT")];
    const metrics = [makeMetrics("e1", { citationProfile: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 } })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("—")).toBeTruthy();
  });

  test("handles two entities side-by-side", () => {
    const entities = [makeEntity("e1", "MIT"), makeEntity("e2", "CERN")];
    const metrics = [
      makeMetrics("e1", { totalOutputs: 200 }),
      makeMetrics("e2", { totalOutputs: 300 }),
    ];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("200")).toBeTruthy();
    expect(screen.getByText("300")).toBeTruthy();
  });

  test("renders as a table element", () => {
    const { container } = render(
      <ComparisonTable entities={[makeEntity("e1", "MIT")]} metrics={[makeMetrics("e1")]} />
    );
    expect(container.querySelector("table")).toBeTruthy();
  });

  test("renders 0% OA rate correctly", () => {
    const entities = [makeEntity("e1", "Closed Org")];
    const metrics = [makeMetrics("e1", { oaRate: 0 })];
    render(<ComparisonTable entities={entities} metrics={metrics} />);
    expect(screen.getByText("0%")).toBeTruthy();
  });
});
