import { describe, test, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ComparisonProvider, useComparisonContext } from "../../contexts/ComparisonContext";
import type { ComparisonEntity } from "@openaire-explorer/shared";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeEntity(id: string, name: string): ComparisonEntity {
  return { id, type: "organization", name };
}

const ENTITIES = {
  mit: makeEntity("openorgs::mit001", "MIT"),
  cern: makeEntity("openorgs::cern001", "CERN"),
  oxford: makeEntity("openorgs::ox001", "Oxford"),
  eth: makeEntity("openorgs::eth001", "ETH Zürich"),
  cnrs: makeEntity("openorgs::cnrs001", "CNRS"),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useComparisonContext (via ComparisonProvider)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("starts with empty selectedEntities", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });
    expect(result.current.selectedEntities).toEqual([]);
  });

  test("addEntity adds entity to selectedEntities", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));

    expect(result.current.selectedEntities).toHaveLength(1);
    expect(result.current.selectedEntities[0]!.id).toBe(ENTITIES.mit.id);
  });

  test("addEntity does not add duplicate entities", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.mit));

    expect(result.current.selectedEntities).toHaveLength(1);
  });

  test("addEntity adds multiple different entities", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));
    act(() => result.current.addEntity(ENTITIES.oxford));

    expect(result.current.selectedEntities).toHaveLength(3);
  });

  test("removeEntity removes entity by id", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));
    act(() => result.current.removeEntity(ENTITIES.mit.id));

    expect(result.current.selectedEntities).toHaveLength(1);
    expect(result.current.selectedEntities[0]!.id).toBe(ENTITIES.cern.id);
  });

  test("removeEntity does nothing for non-existent id", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.removeEntity("nonexistent::id"));

    expect(result.current.selectedEntities).toHaveLength(1);
  });

  test("clearAll removes all entities", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));
    act(() => result.current.clearAll());

    expect(result.current.selectedEntities).toHaveLength(0);
  });

  test("isSelected returns true for selected entity", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));

    expect(result.current.isSelected(ENTITIES.mit.id)).toBe(true);
  });

  test("isSelected returns false for unselected entity", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });
    expect(result.current.isSelected(ENTITIES.mit.id)).toBe(false);
  });

  test("isFull is false when fewer than 5 entities are selected", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));

    expect(result.current.isFull).toBe(false);
  });

  test("isFull is true when 5 entities are selected", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));
    act(() => result.current.addEntity(ENTITIES.oxford));
    act(() => result.current.addEntity(ENTITIES.eth));
    act(() => result.current.addEntity(ENTITIES.cnrs));

    expect(result.current.isFull).toBe(true);
  });

  test("addEntity is a no-op when isFull (5 entities)", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));
    act(() => result.current.addEntity(ENTITIES.cern));
    act(() => result.current.addEntity(ENTITIES.oxford));
    act(() => result.current.addEntity(ENTITIES.eth));
    act(() => result.current.addEntity(ENTITIES.cnrs));

    const sixth = makeEntity("extra::1", "Extra Org");
    act(() => result.current.addEntity(sixth));

    expect(result.current.selectedEntities).toHaveLength(5);
  });

  test("persists entities to localStorage", () => {
    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    act(() => result.current.addEntity(ENTITIES.mit));

    const stored = localStorage.getItem("openaire-comparison-entities");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe(ENTITIES.mit.id);
  });

  test("loads persisted entities from localStorage on mount", () => {
    // Pre-populate localStorage
    localStorage.setItem(
      "openaire-comparison-entities",
      JSON.stringify([ENTITIES.mit, ENTITIES.cern])
    );

    const { result } = renderHook(() => useComparisonContext(), { wrapper: ComparisonProvider });

    expect(result.current.selectedEntities).toHaveLength(2);
    expect(result.current.selectedEntities[0]!.id).toBe(ENTITIES.mit.id);
  });

  test("throws when used outside ComparisonProvider", () => {
    // vitest captures the thrown error
    expect(() =>
      renderHook(() => useComparisonContext())
    ).toThrow("useComparisonContext must be used within ComparisonProvider");
  });
});
