import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, ExternalLink, Calendar, PlusCircle } from "lucide-react";
import clsx from "clsx";

import { AppShell } from "../components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

import { EntityBadge } from "../components/detail/EntityBadge";
import { MetadataGrid } from "../components/detail/MetadataGrid";
import { OAStatusBadge } from "../components/detail/OAStatusBadge";
import { Pagination } from "../components/search/Pagination";

import { useProject } from "../hooks/useProject";
import { useProjectProducts } from "../hooks/useProjectProducts";
import { useComparison } from "../hooks/useComparison";
import type { Project, ResearchProduct } from "@openaire-explorer/shared";

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/search"))}
      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to results
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="rect" height={18} width={120} />
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton variant="rect" height={22} width={70} />
          <Skeleton variant="rect" height={22} width={90} />
        </div>
        <Skeleton variant="text" lines={2} width="80%" />
        <Skeleton variant="text" lines={1} width="50%" />
      </div>
      <Skeleton variant="rect" height={200} />
      <Skeleton variant="rect" height={300} />
    </div>
  );
}

// ─── Project status ───────────────────────────────────────────────────────────

function projectStatus(startDate: string | null, endDate: string | null): string {
  const now = new Date();
  if (endDate && new Date(endDate) < now) return "Completed";
  if (startDate && new Date(startDate) > now) return "Upcoming";
  return "Active";
}

const STATUS_VARIANT = {
  Active:    "success",
  Completed: "default",
  Upcoming:  "warning",
} as const;

// ─── Product list item ────────────────────────────────────────────────────────

function ProductListItem({ product }: { product: ResearchProduct }) {
  const year = product.publicationDate?.slice(0, 4);
  const authors = product.authors?.slice(0, 3).map((a) => a.fullName).join(", ");
  const hasMore = (product.authors?.length ?? 0) > 3;

  return (
    <article className="flex flex-col gap-1 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <OAStatusBadge
          color={product.openAccessColor}
          accessRightLabel={product.bestAccessRight?.label}
        />
        {year && <span className="text-xs text-text-muted">{year}</span>}
      </div>
      <Link
        to={`/entity/product/${encodeURIComponent(product.id)}`}
        className="text-sm font-medium text-foreground hover:text-accent transition-colors line-clamp-2"
      >
        {product.mainTitle}
      </Link>
      {authors && (
        <p className="text-xs text-text-secondary truncate">
          {authors}{hasMore ? " et al." : ""}
        </p>
      )}
    </article>
  );
}

// ─── Main project detail ──────────────────────────────────────────────────────

function ProjectDetail({ project }: { project: Project }) {
  const [page, setPage] = useState(1);
  const { data: products, isLoading: productsLoading } = useProjectProducts(
    project.id,
    { page, pageSize: 10 }
  );

  const status = projectStatus(project.startDate, project.endDate);
  const primaryFunding = project.fundings?.[0];
  const { addEntity, removeEntity, isSelected, isFull } = useComparison();
  const selected = isSelected(project.id);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EntityBadge kind="project" />
          <Badge variant={STATUS_VARIANT[status as keyof typeof STATUS_VARIANT] ?? "default"}>
            {status}
          </Badge>
          {project.openAccessMandateForPublications && (
            <Badge variant="oa-green">OA Mandate</Badge>
          )}
          {primaryFunding && (
            <Badge variant="success">{primaryFunding.shortName}</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground leading-tight">
          {project.title}
        </h1>

        {project.acronym && (
          <p className="text-lg text-text-secondary font-medium">{project.acronym}</p>
        )}

        {/* Date range */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Calendar className="h-4 w-4 text-text-muted" aria-hidden />
            {project.startDate?.slice(0, 10)}
            {project.endDate && ` – ${project.endDate.slice(0, 10)}`}
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap gap-2 pt-1">
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-7 px-3 py-1.5 text-xs rounded-md font-medium border border-border bg-background text-foreground hover:bg-bg-secondary transition-colors"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              Project website
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
          <Button
            variant={selected ? "primary" : "secondary"}
            size="sm"
            disabled={!selected && isFull}
            leftIcon={<PlusCircle className="h-3.5 w-3.5" aria-hidden />}
            onClick={() =>
              selected
                ? removeEntity(project.id)
                : addEntity({ id: project.id, type: "project", name: project.title })
            }
            title={isFull && !selected ? "Comparison is full (max 5)" : undefined}
          >
            {selected ? "In comparison" : "Add to comparison"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      {project.summary && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Summary
          </h2>
          <p className="text-sm text-foreground leading-relaxed">{project.summary}</p>
        </section>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle>Grant details</CardTitle></CardHeader>
        <CardContent>
          <MetadataGrid
            items={[
              {
                label: "Grant code",
                value: project.code,
                hidden: !project.code,
              },
              {
                label: "Call identifier",
                value: project.callIdentifier,
                hidden: !project.callIdentifier,
              },
              {
                label: "Funder",
                value: primaryFunding
                  ? `${primaryFunding.name} (${primaryFunding.shortName})`
                  : null,
                hidden: !primaryFunding,
              },
              {
                label: "Funding stream",
                value: primaryFunding?.fundingStream?.description ?? null,
                hidden: !primaryFunding?.fundingStream,
              },
              {
                label: "Jurisdiction",
                value: primaryFunding?.jurisdiction ?? null,
                hidden: !primaryFunding?.jurisdiction,
              },
              {
                label: "Total cost",
                value: project.granted
                  ? `${new Intl.NumberFormat().format(project.granted.totalCost)} ${project.granted.currency}`
                  : null,
                hidden: !project.granted?.totalCost,
              },
              {
                label: "Funded amount",
                value: project.granted
                  ? `${new Intl.NumberFormat().format(project.granted.fundedAmount)} ${project.granted.currency}`
                  : null,
                hidden: !project.granted?.fundedAmount,
              },
              {
                label: "OA mandate (publications)",
                value: project.openAccessMandateForPublications ? "Yes" : "No",
              },
              {
                label: "OA mandate (datasets)",
                value: project.openAccessMandateForDataset ? "Yes" : "No",
              },
            ]}
          />

          {/* Keywords */}
          {project.keywords && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.keywords
                  .split(/[;,]/)
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .map((kw, i) => (
                    <Badge key={i} variant="default">{kw}</Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {project.subjects && project.subjects.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Research areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.subjects.map((s, i) => (
                  <Badge key={i} variant="default">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* H2020 programmes */}
          {project.h2020Programmes && project.h2020Programmes.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                H2020 Programmes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.h2020Programmes.map((p, i) => (
                  <Badge key={i} variant="default">{p}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional funders */}
      {project.fundings && project.fundings.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Co-funders</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {project.fundings.slice(1).map((f, i) => (
                <div key={i} className="text-sm text-foreground">
                  <span className="font-medium">{f.name}</span>
                  {f.fundingStream && (
                    <span className="text-text-secondary ml-1">
                      · {f.fundingStream.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research products */}
      <Card>
        <CardHeader>
          <CardTitle>
            Research outputs
            {products?.meta.totalResults != null && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                ({new Intl.NumberFormat().format(products.meta.totalResults)})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
                  <Skeleton variant="rect" height={20} width={70} />
                  <Skeleton variant="text" lines={2} />
                </div>
              ))}
            </div>
          )}

          {!productsLoading && products?.data.length === 0 && (
            <EmptyState
              icon="📄"
              title="No research outputs found"
              description="No publications linked to this project yet."
            />
          )}

          {!productsLoading && products?.data && products.data.length > 0 && (
            <>
              <div className="flex flex-col">
                {products.data.map((p) => (
                  <ProductListItem key={p.id} product={p} />
                ))}
              </div>
              {products.meta.totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={products.meta.totalPages}
                  onPageChange={setPage}
                  className="mt-4"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : undefined;

  const { data: project, isLoading, isError, error, refetch } = useProject(decodedId);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <BackButton />

        {isLoading && <ProjectDetailSkeleton />}

        {isError && (
          <ErrorState
            description={(error as Error)?.message ?? "Failed to load this project."}
            onRetry={() => refetch()}
          />
        )}

        {project && <ProjectDetail project={project} />}
      </div>
    </AppShell>
  );
}
