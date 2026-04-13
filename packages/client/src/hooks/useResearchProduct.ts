import { useQuery } from "@tanstack/react-query";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { fetchAPI, type SingleEnvelope } from "../lib/api-client";

export function useResearchProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["research-products", "detail", id],
    queryFn: () =>
      fetchAPI<SingleEnvelope<ResearchProduct>>(
        `/api/search/research-products/${encodeURIComponent(id!)}`
      ).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
