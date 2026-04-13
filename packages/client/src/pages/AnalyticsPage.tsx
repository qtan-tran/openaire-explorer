import { useState } from "react";
import clsx from "clsx";
import { AppShell } from "../components/layout/AppShell";
import { Container } from "../components/layout/Container";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { AnalyticsFilterBar } from "../components/analytics/AnalyticsFilterBar";
import {
  OADistributionPanel,
  OADistributionSkeleton,
} from "../components/analytics/OADistributionPanel";
import {
  TrendsPanel,
  TrendsSkeleton,
} from "../components/analytics/TrendsPanel";
import {
  NetworkPanel,
  NetworkSkeleton,
} from "../components/analytics/NetworkPanel";
import { useOADistribution } from "../hooks/useOADistribution";
import { useTrendsData } from "../hooks/useTrendsData";
import { useNetworkData } from "../hooks/useNetworkData";
import type { OADistributionFilters } from "../hooks/useOADistribution";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type AnalyticsTab = "oa-distribution" | "trends" | "network";

const TABS: { id: AnalyticsTab; label: string; ready: boolean }[] = [
  { id: "oa-distribution", label: "OA Distribution", ready: true },
  { id: "trends",          label: "Trends",          ready: true },
  { id: "network",         label: "Network",          ready: true  },
];

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
}: {
  active: AnalyticsTab;
  onChange: (t: AnalyticsTab) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => t.ready && onChange(t.id)}
          disabled={!t.ready}
          className={clsx(
            "py-2.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors",
            t.id === active
              ? "border-accent text-accent"
              : t.ready
              ? "border-transparent text-text-secondary hover:text-foreground"
              : "border-transparent text-text-muted cursor-not-allowed opacity-50"
          )}
        >
          {t.label}
          {!t.ready && (
            <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-60">
              soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── OA Distribution tab ──────────────────────────────────────────────────────

function OADistributionTab() {
  const [filters, setFilters] = useState<OADistributionFilters>({});
  const { data, isLoading, isError, error, refetch } = useOADistribution(filters);
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsFilterBar filters={filters} onChange={setFilters} />

      {!hasFilter ? (
        <EmptyState
          icon="🔍"
          title="Apply a filter to get started"
          description="Enter a search term, funder, organization ID, or project ID to load OA distribution data."
        />
      ) : isLoading ? (
        <OADistributionSkeleton />
      ) : isError ? (
        <ErrorState
          description={(error as Error)?.message ?? "Failed to load analytics data."}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <OADistributionPanel data={data} />
      ) : null}
    </div>
  );
}

// ─── Trends tab ───────────────────────────────────────────────────────────────

function TrendsTab() {
  const [filters, setFilters] = useState<OADistributionFilters>({});
  const { data, isLoading, isError, error, refetch } = useTrendsData(filters);
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsFilterBar filters={filters} onChange={setFilters} />

      {!hasFilter ? (
        <EmptyState
          icon="📈"
          title="Apply a filter to get started"
          description="Enter a search term, funder, organization ID, or project ID to load trend data."
        />
      ) : isLoading ? (
        <TrendsSkeleton />
      ) : isError ? (
        <ErrorState
          description={(error as Error)?.message ?? "Failed to load trend data."}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <TrendsPanel data={data} />
      ) : null}
    </div>
  );
}

// ─── Network tab ──────────────────────────────────────────────────────────────

function NetworkTab() {
  const [filters, setFilters] = useState<OADistributionFilters>({});
  const { data, isLoading, isError, error, refetch } = useNetworkData(filters);
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsFilterBar filters={filters} onChange={setFilters} />

      {!hasFilter ? (
        <EmptyState
          icon="🕸️"
          title="Apply a filter to get started"
          description="Enter a search term, funder, organization ID, or project ID to load the collaboration network."
        />
      ) : isLoading ? (
        <NetworkSkeleton />
      ) : isError ? (
        <ErrorState
          description={(error as Error)?.message ?? "Failed to load network data."}
          onRetry={() => refetch()}
        />
      ) : data && data.nodes.length > 0 ? (
        <NetworkPanel data={data} />
      ) : data ? (
        <EmptyState
          icon="📭"
          title="No network data"
          description="No connections found for the selected filters. Try broadening your search."
        />
      ) : null}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>("oa-distribution");

  return (
    <AppShell>
      <Container>
        <div className="flex flex-col gap-6 py-6">
          <PageHeader
            title="Analytics"
            description="Explore open access trends and research output patterns."
          />

          <TabBar active={tab} onChange={setTab} />

          <div>
            {tab === "oa-distribution" && <OADistributionTab />}
            {tab === "trends"          && <TrendsTab />}
            {tab === "network"         && <NetworkTab />}
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
