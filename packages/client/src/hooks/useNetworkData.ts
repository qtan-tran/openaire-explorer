import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "../lib/api-client";
import type { NetworkData } from "@openaire-explorer/shared";
import type { OADistributionFilters } from "./useOADistribution";

export interface NetworkFilters extends OADistributionFilters {
  maxNodes?: number;
}

function buildParams(filters: NetworkFilters): Record<string, string> {
  const p: Record<string, string> = {};
  if (filters.search)           p.search = filters.search;
  if (filters.organizationId)   p.organizationId = filters.organizationId;
  if (filters.projectId)        p.projectId = filters.projectId;
  if (filters.funderShortName)  p.funderShortName = filters.funderShortName;
  if (filters.fromYear)         p.fromYear = String(filters.fromYear);
  if (filters.toYear)           p.toYear = String(filters.toYear);
  if (filters.maxNodes)         p.maxNodes = String(filters.maxNodes);
  return p;
}

interface NetworkResponse {
  data: NetworkData;
}

export function useNetworkData(filters: NetworkFilters) {
  const hasFilter = Object.entries(filters)
    .filter(([k]) => k !== "maxNodes")
    .some(([, v]) => Boolean(v));

  const params = buildParams(filters);
  const qs = new URLSearchParams(params).toString();

  return useQuery<NetworkData>({
    queryKey: ["network", filters],
    queryFn: async () => {
      const res = await fetchAPI<NetworkResponse>(`/api/metrics/network?${qs}`);
      return res.data;
    },
    enabled: hasFilter,
    staleTime: 5 * 60 * 1000,
  });
}
