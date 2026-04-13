import { useQuery } from "@tanstack/react-query";
import { postAPI } from "../lib/api-client";
import { useComparisonContext } from "../contexts/ComparisonContext";
import type { ComparisonEntity, ComparisonResult } from "@openaire-explorer/shared";

interface ComparisonFilters {
  fromYear?: number;
  toYear?: number;
}

/** POST /api/compare — fetch metrics for the currently selected entities. */
export function useComparisonResults(filters?: ComparisonFilters) {
  const { selectedEntities } = useComparisonContext();
  const entityIds = selectedEntities.map((e) => e.id).sort();

  return useQuery({
    queryKey: ["comparison", entityIds, filters],
    queryFn: () =>
      postAPI<ComparisonResult>("/api/compare", {
        entities: selectedEntities.map((e) => ({ id: e.id, type: e.type })),
        filters,
      }),
    enabled: selectedEntities.length >= 2,
    staleTime: 10 * 60 * 1000, // match server cache TTL
    gcTime: 15 * 60 * 1000,
  });
}

/** Re-export the context hook under the common name. */
export { useComparisonContext as useComparison } from "../contexts/ComparisonContext";

export type { ComparisonEntity, ComparisonFilters };
