import { useQuery } from "@tanstack/react-query";
import type { Project } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export interface ProjectSearchParams {
  search?: string;
  funderShortName?: string;
  fromStartDate?: string;
  toStartDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export function useSearchProjects(
  params: ProjectSearchParams,
  options?: { enabled?: boolean }
) {
  const hasContent = !!(
    params.search ||
    params.funderShortName ||
    params.fromStartDate ||
    params.toStartDate
  );

  return useQuery({
    queryKey: ["projects", "search", params],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<Project>>("/api/search/projects", {
        ...params,
      }),
    enabled: options?.enabled ?? hasContent,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
