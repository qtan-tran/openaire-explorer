import { useQuery } from "@tanstack/react-query";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { fetchAPI, type PaginatedEnvelope } from "../lib/api-client";

export function useRelatedProducts(productId: string | undefined, pageSize = 6) {
  return useQuery({
    queryKey: ["research-products", "related", productId, pageSize],
    queryFn: () =>
      fetchAPI<PaginatedEnvelope<ResearchProduct>>(
        `/api/search/research-products/${encodeURIComponent(productId!)}/related`,
        { pageSize }
      ),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
