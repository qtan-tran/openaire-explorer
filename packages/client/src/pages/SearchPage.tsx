import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { SlidersHorizontal } from "lucide-react";

import { AppShell } from "../components/layout/AppShell";
import { SearchBar } from "../components/search/SearchBar";
import { FilterSidebar } from "../components/search/FilterSidebar";
import type { SearchFilters } from "../components/search/FilterSidebar";
import { ResultsList } from "../components/search/ResultsList";
import { Pagination } from "../components/search/Pagination";
import {
  SortDropdown,
  RESEARCH_PRODUCT_SORT_OPTIONS,
  PROJECT_SORT_OPTIONS,
  ORGANIZATION_SORT_OPTIONS,
} from "../components/search/SortDropdown";
import type { SearchResultItem } from "../components/search/ResultCard";
import type { ResearchProduct, Organization, Project } from "@openaire-explorer/shared";

import { useSearchResearchProducts } from "../hooks/useSearchResearchProducts";
import { useSearchOrganizations } from "../hooks/useSearchOrganizations";
import { useSearchProjects } from "../hooks/useSearchProjects";

// ─── Entity type tabs ─────────────────────────────────────────────────────────

type EntityTab =
  | "all"
  | "publication"
  | "dataset"
  | "software"
  | "organization"
  | "project";

const TABS: { value: EntityTab; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "publication",  label: "Publications" },
  { value: "dataset",      label: "Datasets" },
  { value: "software",     label: "Software" },
  { value: "organization", label: "Organizations" },
  { value: "project",      label: "Projects" },
];

// ─── URL param helpers ────────────────────────────────────────────────────────

function buildParams(
  prev: URLSearchParams,
  updates: Record<string, string | null>
): URLSearchParams {
  const next = new URLSearchParams(prev);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  return next;
}

// ─── Number formatting ────────────────────────────────────────────────────────

function formatCount(n: number): string {
  return new Intl.NumberFormat().format(n);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ── Parse URL params ──────────────────────────────────────────────────────
  const q          = searchParams.get("q") ?? "";
  const activeTab  = (searchParams.get("type") ?? "all") as EntityTab;
  const fromYear   = searchParams.get("fromYear") ?? "";
  const toYear     = searchParams.get("toYear") ?? "";
  const oaStatus   = searchParams.get("oaStatus") ?? "";
  const openAccessColor = searchParams.get("openAccessColor") ?? "";
  const funder     = searchParams.get("funder") ?? "";
  const page       = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize   = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10));
  const sortBy     = searchParams.get("sortBy") ?? "";

  // ── Update helpers ────────────────────────────────────────────────────────

  const handleSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => buildParams(prev, { q: value || null, page: null }),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleTabChange = (tab: EntityTab) => {
    setSearchParams((prev) =>
      buildParams(prev, { type: tab === "all" ? null : tab, page: null, sortBy: null })
    );
  };

  const handleFiltersChange = (filters: SearchFilters) => {
    setSearchParams((prev) =>
      buildParams(prev, {
        fromYear: filters.fromYear || null,
        toYear: filters.toYear || null,
        oaStatus: filters.oaStatus || null,
        openAccessColor: filters.openAccessColor || null,
        funder: filters.funder || null,
        page: null,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) =>
      buildParams(prev, { page: String(newPage) })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value: string) => {
    setSearchParams((prev) =>
      buildParams(prev, { sortBy: value || null, page: null })
    );
  };

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileFilterOpen(false);
  }, [searchParams]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isOrgTab     = activeTab === "organization";
  const isProjectTab = activeTab === "project";
  const isProductTab = !isOrgTab && !isProjectTab;

  const filters: SearchFilters = { fromYear, toYear, oaStatus, openAccessColor, funder };

  const hasQuery = !!(q || fromYear || toYear || oaStatus || openAccessColor || funder);

  const productType =
    activeTab === "all" ? undefined : (activeTab as ResearchProduct["type"]);

  // ── Search hooks ──────────────────────────────────────────────────────────

  const productSearch = useSearchResearchProducts(
    {
      search: q || undefined,
      type: productType,
      fromYear: fromYear || undefined,
      toYear: toYear || undefined,
      oaStatus: oaStatus || undefined,
      openAccessColor: openAccessColor as ResearchProduct["openAccessColor"] | undefined,
      funderShortName: funder || undefined,
      page,
      pageSize,
      sortBy: sortBy || undefined,
    },
    { enabled: isProductTab && hasQuery }
  );

  const orgSearch = useSearchOrganizations(
    { search: q || undefined, page, pageSize },
    { enabled: isOrgTab && !!q }
  );

  const projectSearch = useSearchProjects(
    {
      search: q || undefined,
      funderShortName: funder || undefined,
      page,
      pageSize,
      sortBy: sortBy || undefined,
    },
    { enabled: isProjectTab && hasQuery }
  );

  // ── Active search state ───────────────────────────────────────────────────

  const activeSearch = isOrgTab
    ? orgSearch
    : isProjectTab
    ? projectSearch
    : productSearch;

  const totalResults = activeSearch.data?.meta.totalResults ?? 0;
  const totalPages   = activeSearch.data?.meta.totalPages ?? 0;

  // Convert API results to discriminated-union items
  const items: SearchResultItem[] | undefined = activeSearch.data
    ? isOrgTab
      ? (activeSearch.data.data as Organization[]).map((item) => ({
          kind: "org" as const,
          item,
        }))
      : isProjectTab
      ? (activeSearch.data.data as Project[]).map((item) => ({
          kind: "project" as const,
          item,
        }))
      : (activeSearch.data.data as ResearchProduct[]).map((item) => ({
          kind: "product" as const,
          item,
        }))
    : undefined;

  const sortOptions = isOrgTab
    ? ORGANIZATION_SORT_OPTIONS
    : isProjectTab
    ? PROJECT_SORT_OPTIONS
    : RESEARCH_PRODUCT_SORT_OPTIONS;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShell containerClassName="flex-col gap-0 py-0">
      {/* ── Search header ──────────────────────────────────────────────────── */}
      <div className="bg-background border-b border-border py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          <SearchBar
            defaultValue={q}
            onSearch={handleSearch}
          />

          {/* Entity type tabs */}
          <nav
            role="tablist"
            aria-label="Entity type"
            className="flex gap-1 overflow-x-auto scrollbar-hide pb-px"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={clsx(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                  activeTab === tab.value
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showOaFilters={isProductTab}
          mobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Results column */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Results header: count + mobile filter button + sort */}
          {hasQuery && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className={clsx(
                    "lg:hidden flex items-center gap-1.5 rounded-lg border border-border",
                    "bg-background px-3 py-1.5 text-sm text-foreground",
                    "hover:bg-bg-secondary transition-colors"
                  )}
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  Filters
                </button>

                {activeSearch.data && !activeSearch.isLoading && (
                  <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-foreground">
                      {formatCount(totalResults)}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""}
                    {q && (
                      <>
                        {" "}for{" "}
                        <span className="font-medium text-foreground">
                          &lsquo;{q}&rsquo;
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {sortOptions.length > 1 && (
                <SortDropdown
                  value={sortBy}
                  onChange={handleSortChange}
                  options={sortOptions}
                />
              )}
            </div>
          )}

          {/* Results list */}
          <ResultsList
            items={items}
            isLoading={activeSearch.isLoading}
            isFetching={activeSearch.isFetching}
            isError={activeSearch.isError}
            error={activeSearch.error as Error | null}
            onRetry={() => activeSearch.refetch()}
            hasQuery={hasQuery}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="pt-2"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
