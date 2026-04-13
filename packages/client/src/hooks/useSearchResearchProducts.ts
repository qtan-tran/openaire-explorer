import { useQuery } from "@tanstack/react-query";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export interface ResearchProductSearchParams {
  search?: string;
  type?: "publication" | "dataset" | "software" | "other";
  fromYear?: string;
  toYear?: string;
  oaStatus?: string;
  openAccessColor?: string;
  organizationId?: string;
  projectId?: string;
  funderShortName?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export function useSearchResearchProducts(
  params: ResearchProductSearchParams,
  options?: { enabled?: boolean }
) {
  const hasContent = !!(
    params.search ||
    params.fromYear ||
    params.toYear ||
    params.oaStatus ||
    params.openAccessColor ||
    params.funderShortName ||
    params.organizationId ||
    params.projectId
  );

  return useQuery({
    queryKey: ["research-products", "search", params],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<ResearchProduct>>(
        "/api/search/research-products",
        { ...params }
      ),
    enabled: options?.enabled ?? hasContent,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
