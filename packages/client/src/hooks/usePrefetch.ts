import { useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "../lib/api-client";
import type { ResearchProduct, Organization, Project } from "@openaire-explorer/shared";
import type { SingleEnvelope } from "../lib/api-client";

/**
 * Returns prefetch callbacks that warm the React Query cache on hover.
 * Uses the same queryKey/queryFn as the detail hooks so the cached data
 * is immediately available when the user navigates to a detail page.
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  function prefetchResearchProduct(id: string) {
    void queryClient.prefetchQuery({
      queryKey: ["research-products", "detail", id],
      queryFn: () =>
        fetchAPI<SingleEnvelope<ResearchProduct>>(
          `/api/search/research-products/${encodeURIComponent(id)}`
        ).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    });
  }

  function prefetchOrganization(id: string) {
    void queryClient.prefetchQuery({
      queryKey: ["organizations", "detail", id],
      queryFn: () =>
        fetchAPI<SingleEnvelope<Organization>>(
          `/api/search/organizations/${encodeURIComponent(id)}`
        ).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    });
  }

  function prefetchProject(id: string) {
    void queryClient.prefetchQuery({
      queryKey: ["projects", "detail", id],
      queryFn: () =>
        fetchAPI<SingleEnvelope<Project>>(
          `/api/search/projects/${encodeURIComponent(id)}`
        ).then((r) => r.data),
      staleTime: 5 * 60 * 1000,
    });
  }

  return { prefetchResearchProduct, prefetchOrganization, prefetchProject };
}
