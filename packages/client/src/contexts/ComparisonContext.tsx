import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { ComparisonEntity } from "@openaire-explorer/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonContextValue {
  selectedEntities: ComparisonEntity[];
  addEntity: (entity: ComparisonEntity) => void;
  removeEntity: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

const MAX_ENTITIES = 5;
const STORAGE_KEY = "openaire-comparison-entities";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedEntities, setSelectedEntities] = useState<ComparisonEntity[]>(
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored) as unknown;
        return Array.isArray(parsed) ? (parsed as ComparisonEntity[]) : [];
      } catch {
        return [];
      }
    }
  );

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedEntities));
  }, [selectedEntities]);

  const addEntity = useCallback((entity: ComparisonEntity) => {
    setSelectedEntities((prev) => {
      if (prev.length >= MAX_ENTITIES) return prev;
      if (prev.some((e) => e.id === entity.id)) return prev;
      return [...prev, entity];
    });
  }, []);

  const removeEntity = useCallback((id: string) => {
    setSelectedEntities((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedEntities([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedEntities.some((e) => e.id === id),
    [selectedEntities]
  );

  return (
    <ComparisonContext.Provider
      value={{
        selectedEntities,
        addEntity,
        removeEntity,
        clearAll,
        isSelected,
        isFull: selectedEntities.length >= MAX_ENTITIES,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useComparisonContext(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error("useComparisonContext must be used within ComparisonProvider");
  }
  return ctx;
}
