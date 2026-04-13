import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { StatCard } from "./StatCard";
import { OADonutChart } from "./OADonutChart";
import { OAStackedBarChart } from "./OAStackedBarChart";
import { OARateTrendChart } from "./OARateTrendChart";
import type { OADistributionData } from "../../hooks/useOADistribution";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function OADistributionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton variant="rect" height={110} />
        <Skeleton variant="rect" height={110} />
        <Skeleton variant="rect" height={110} />
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rect" height={300} />
        <Skeleton variant="rect" height={300} />
      </div>
      {/* Trend chart */}
      <Skeleton variant="rect" height={240} />
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface OADistributionPanelProps {
  data: OADistributionData;
}

export function OADistributionPanel({ data }: OADistributionPanelProps) {
  if (data.total === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No results"
        description="Try adjusting your filters to find matching research products."
      />
    );
  }

  const oaPercent = `${(data.oaRate * 100).toFixed(1)}%`;
  const closedCount =
    (data.distribution.closed?.count ?? 0) +
    (data.distribution.unknown?.count ?? 0);
  const openCount = data.total - closedCount;
  const ratio =
    closedCount > 0
      ? (openCount / closedCount).toFixed(1)
      : "∞";

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total outputs"
          value={data.total}
          sub="research products"
        />
        <StatCard
          label="OA rate"
          value={oaPercent}
          sub="gold + green + hybrid"
        />
        <StatCard
          label="Open / Closed"
          value={`${ratio} : 1`}
          sub={`${openCount.toLocaleString()} open, ${closedCount.toLocaleString()} not`}
        />
      </div>

      {/* Donut + stacked bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>OA Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-[340px] mx-auto">
              <OADonutChart data={data} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution by Year</CardTitle>
          </CardHeader>
          <CardContent>
            {data.byYear.length === 0 ? (
              <EmptyState
                title="No yearly data"
                description="No publication year information available."
              />
            ) : (
              <OAStackedBarChart data={data} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* OA rate trend */}
      {data.oaRateByYear.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>OA Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <OARateTrendChart data={data} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
