import { useQuery } from "@tanstack/react-query";
import type { Project } from "@openaire-explorer/shared";
import { fetchAPI, type SingleEnvelope } from "../lib/api-client";

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () =>
      fetchAPI<SingleEnvelope<Project>>(
        `/api/search/projects/${encodeURIComponent(id!)}`
      ).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
