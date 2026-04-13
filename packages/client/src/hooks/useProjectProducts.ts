import { useQuery } from "@tanstack/react-query";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export function useProjectProducts(
  projectId: string | undefined,
  params?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["projects", "products", projectId, params],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<ResearchProduct>>(
        `/api/search/projects/${encodeURIComponent(projectId!)}/products`,
        { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 }
      ),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
