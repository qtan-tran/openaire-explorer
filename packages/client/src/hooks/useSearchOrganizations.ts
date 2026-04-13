import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export interface OrganizationSearchParams {
  search?: string;
  countryCode?: string;
  page?: number;
  pageSize?: number;
}

export function useSearchOrganizations(
  params: OrganizationSearchParams,
  options?: { enabled?: boolean }
) {
  const hasContent = !!(params.search || params.countryCode);

  return useQuery({
    queryKey: ["organizations", "search", params],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<Organization>>(
        "/api/search/organizations",
        { ...params }
      ),
    enabled: options?.enabled ?? hasContent,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
