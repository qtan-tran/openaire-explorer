import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "../lib/api-client";
import type { OADistributionFilters } from "./useOADistribution";

export type TrendsGranularity = "year" | "quarter";

export interface TrendsFilters extends OADistributionFilters {
  granularity?: TrendsGranularity;
}

export interface TimeSeriesEntry {
  period: string;
  totalOutputs: number;
  publications: number;
  datasets: number;
  software: number;
  other: number;
  oaRate: number;
  growthRate: number | null;
}

export interface CumulativeEntry {
  period: string;
  cumulative: number;
  publications: number;
  datasets: number;
  software: number;
  other: number;
}

export interface MovingAverageEntry {
  period: string;
  ma3: number | null;
  ma5: number | null;
}

export interface TrendsSummaryData {
  totalOutputs: number;
  avgYearlyGrowth: number | null;
  peakYear: string;
  peakCount: number;
}

export interface TrendsData {
  timeSeries: TimeSeriesEntry[];
  cumulativeOutputs: CumulativeEntry[];
  movingAverages: MovingAverageEntry[];
  summary: TrendsSummaryData;
}

export function useTrendsData(filters: TrendsFilters) {
  const hasFilter = !!(
    filters.search ||
    filters.organizationId ||
    filters.projectId ||
    filters.funderShortName ||
    filters.fromYear ||
    filters.toYear
  );

  return useQuery({
    queryKey: ["metrics", "trends", filters],
    queryFn: () =>
      fetchAPI<{ data: TrendsData }>("/api/metrics/trends", { ...filters }),
    enabled: hasFilter,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (res) => res.data,
  });
}
