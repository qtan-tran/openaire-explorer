import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@openaire-explorer/shared";
import { fetchAPI, type SingleEnvelope } from "../lib/api-client";

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ["organizations", "detail", id],
    queryFn: () =>
      fetchAPI<SingleEnvelope<Organization>>(
        `/api/search/organizations/${encodeURIComponent(id!)}`
      ).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
