import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Container } from "../components/layout/Container";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { EntityChip } from "../components/comparison/EntityChip";
import { AddEntityModal } from "../components/comparison/AddEntityModal";
import { ComparisonTable } from "../components/comparison/ComparisonTable";
import { ComparisonBarChart } from "../components/comparison/ComparisonBarChart";
import { ComparisonLineChart } from "../components/comparison/ComparisonLineChart";
import { ComparisonRadarChart } from "../components/comparison/ComparisonRadarChart";
import { useComparison, useComparisonResults } from "../hooks/useComparison";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ComparisonSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="rect" height={200} />
      <Skeleton variant="rect" height={300} />
      <Skeleton variant="rect" height={300} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ComparePage() {
  const [, setSearchParams] = useSearchParams();
  const { selectedEntities, addEntity, removeEntity, clearAll, isSelected, isFull } =
    useComparison();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError, error, refetch } = useComparisonResults();

  // Keep URL in sync while on this page (outbound — localStorage is source of truth)
  useEffect(() => {
    if (selectedEntities.length > 0) {
      setSearchParams(
        { compare: selectedEntities.map((e) => e.id).join(",") },
        { replace: true }
      );
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedEntities, setSearchParams]);

  return (
    <AppShell>
      <Container>
        <div className="flex flex-col gap-8 py-6">
          <PageHeader
            title="Compare Entities"
            description="Compare research outputs, OA rates, and citation metrics side by side."
          />

          {/* Entity selection bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-text-secondary shrink-0">
                  Comparing:
                </span>

                {selectedEntities.length === 0 ? (
                  <span className="text-sm text-text-muted italic">
                    No entities selected — add up to 5
                  </span>
                ) : (
                  selectedEntities.map((e) => (
                    <EntityChip key={e.id} entity={e} onRemove={removeEntity} />
                  ))
                )}

                <div className="flex gap-2 ml-auto">
                  {!isFull && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowModal(true)}
                    >
                      + Add entity
                    </Button>
                  )}
                  {selectedEntities.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
                      onClick={clearAll}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content */}
          {selectedEntities.length < 2 ? (
            <EmptyState
              icon="📊"
              title="Select at least 2 entities"
              description="Add organizations, projects, or research products to compare their metrics."
              action={{ label: "Add entity", onClick: () => setShowModal(true) }}
            />
          ) : isLoading ? (
            <ComparisonSkeleton />
          ) : isError ? (
            <ErrorState
              description={(error as Error)?.message ?? "Failed to compute metrics."}
              onRetry={() => refetch()}
            />
          ) : data ? (
            <div className="flex flex-col gap-8">
              {/* Summary table */}
              <section className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Summary
                </h2>
                <ComparisonTable
                  entities={data.entities}
                  metrics={data.metrics}
                />
              </section>

              {/* OA distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>OA Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-2xl mx-auto">
                    <ComparisonBarChart
                      entities={data.entities}
                      metrics={data.metrics}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Yearly trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Yearly Output Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonLineChart
                    entities={data.entities}
                    metrics={data.metrics}
                  />
                </CardContent>
              </Card>

              {/* Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Multi-metric Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <ComparisonRadarChart
                      entities={data.entities}
                      metrics={data.metrics}
                    />
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-text-muted text-right">
                Computed at {new Date(data.computedAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </Container>

      {showModal && (
        <AddEntityModal
          onAdd={addEntity}
          onClose={() => setShowModal(false)}
          isSelected={isSelected}
          isFull={isFull}
        />
      )}
    </AppShell>
  );
}
