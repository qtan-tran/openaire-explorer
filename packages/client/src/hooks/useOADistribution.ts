import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "../lib/api-client";

export type OACategory =
  | "gold"
  | "green"
  | "hybrid"
  | "bronze"
  | "closed"
  | "unknown";

export interface OADistributionFilters {
  search?: string;
  organizationId?: string;
  projectId?: string;
  funderShortName?: string;
  fromYear?: string;
  toYear?: string;
}

export interface OADistributionEntry {
  count: number;
  percentage: number;
}

export interface OAByYearEntry {
  year: number;
  gold: number;
  green: number;
  hybrid: number;
  bronze: number;
  closed: number;
  unknown: number;
}

export interface OADistributionData {
  total: number;
  distribution: Record<OACategory, OADistributionEntry>;
  byYear: OAByYearEntry[];
  oaRate: number;
  oaRateByYear: Array<{ year: number; rate: number }>;
}

export function useOADistribution(filters: OADistributionFilters) {
  const hasFilter = !!(
    filters.search ||
    filters.organizationId ||
    filters.projectId ||
    filters.funderShortName ||
    filters.fromYear ||
    filters.toYear
  );

  return useQuery({
    queryKey: ["metrics", "oa-distribution", filters],
    queryFn: () =>
      fetchAPI<{ data: OADistributionData }>("/api/metrics/oa-distribution", {
        ...filters,
      }),
    enabled: hasFilter,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (res) => res.data,
  });
}
