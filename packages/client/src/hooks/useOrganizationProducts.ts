import { useQuery } from "@tanstack/react-query";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export function useOrganizationProducts(
  orgId: string | undefined,
  params?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["organizations", "products", orgId, params],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<ResearchProduct>>(
        `/api/search/organizations/${encodeURIComponent(orgId!)}/products`,
        { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 }
      ),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
