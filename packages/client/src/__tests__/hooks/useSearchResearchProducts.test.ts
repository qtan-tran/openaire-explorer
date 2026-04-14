import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { useSearchResearchProducts } from "../../hooks/useSearchResearchProducts";
import * as apiClient from "../../lib/api-client";
import type { ResearchProduct } from "@openaire-explorer/shared";

// ─── Wrapper ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── Fixture ──────────────────────────────────────────────────────────────────

const MOCK_PRODUCT: ResearchProduct = {
  id: "doi::abc",
  originalIds: [],
  type: "publication",
  mainTitle: "Test Product",
  subTitle: null,
  descriptions: null,
  authors: [],
  publicationDate: "2023-01-01",
  publisher: null,
  embargoEndDate: null,
  language: null,
  countries: null,
  subjects: null,
  openAccessColor: "gold",
  publiclyFunded: false,
  isGreen: false,
  isInDiamondJournal: false,
  bestAccessRight: null,
  container: null,
  sources: null,
  formats: null,
  contributors: null,
  coverages: null,
  documentationUrls: null,
  codeRepositoryUrl: null,
  programmingLanguage: null,
  contactPeople: null,
  contactGroups: null,
  tools: null,
  size: null,
  version: null,
  geoLocations: null,
  pids: null,
  dateOfCollection: null,
  lastUpdateTimeStamp: null,
  indicators: null,
  projects: null,
  organizations: null,
  communities: null,
  collectedFrom: [],
  instances: [],
};

const MOCK_RESPONSE = {
  data: [MOCK_PRODUCT],
  meta: { page: 1, pageSize: 10, totalResults: 1, totalPages: 1 },
};

describe("useSearchResearchProducts", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "fetchAPI").mockResolvedValue(MOCK_RESPONSE);
  });

  test("is disabled when no search filters are provided", () => {
    const { result } = renderHook(() => useSearchResearchProducts({}), {
      wrapper: makeWrapper(),
    });
    // Query should not fire — status stays 'pending' (not fetching)
    expect(result.current.isFetching).toBe(false);
  });

  test("is enabled when search param is provided", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ search: "climate" }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.fetchAPI).toHaveBeenCalledWith(
      "/api/search/research-products",
      expect.objectContaining({ search: "climate" })
    );
  });

  test("is enabled when fromYear param is provided", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ fromYear: "2020" }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.fetchAPI).toHaveBeenCalled();
  });

  test("is enabled when oaStatus param is provided", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ oaStatus: "OPEN" }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.fetchAPI).toHaveBeenCalled();
  });

  test("is enabled when organizationId param is provided", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ organizationId: "openorgs::abc" }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  test("returns fetched data correctly", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ search: "quantum" }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0]!.mainTitle).toBe("Test Product");
  });

  test("passes all query params to fetchAPI", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({
        search: "climate",
        type: "publication",
        fromYear: "2020",
        toYear: "2023",
        page: 2,
        pageSize: 20,
      }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.fetchAPI).toHaveBeenCalledWith(
      "/api/search/research-products",
      expect.objectContaining({
        search: "climate",
        type: "publication",
        fromYear: "2020",
        toYear: "2023",
        page: 2,
        pageSize: 20,
      })
    );
  });

  test("is enabled when enabled option is explicitly true", async () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({}, { enabled: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  test("is disabled when enabled option is explicitly false", () => {
    const { result } = renderHook(
      () => useSearchResearchProducts({ search: "climate" }, { enabled: false }),
      { wrapper: makeWrapper() }
    );

    expect(result.current.isFetching).toBe(false);
  });

  test("sets correct queryKey including params", async () => {
    const fetchSpy = vi.spyOn(apiClient, "fetchAPI").mockResolvedValue(MOCK_RESPONSE);
    const params = { search: "ai", page: 1 };

    const { result } = renderHook(
      () => useSearchResearchProducts(params),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
