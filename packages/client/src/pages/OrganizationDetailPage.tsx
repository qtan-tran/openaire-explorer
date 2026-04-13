import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, ExternalLink, PlusCircle } from "lucide-react";
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

import { useOrganization } from "../hooks/useOrganization";
import { useOrganizationProducts } from "../hooks/useOrganizationProducts";
import type { Organization, ResearchProduct } from "@openaire-explorer/shared";

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

function OrgDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="rect" height={18} width={120} />
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton variant="rect" height={22} width={90} />
          <Skeleton variant="rect" height={22} width={70} />
        </div>
        <Skeleton variant="text" lines={1} width="70%" />
        <Skeleton variant="text" lines={1} width="40%" />
      </div>
      <Skeleton variant="rect" height={180} />
    </div>
  );
}

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

// ─── Main org detail ──────────────────────────────────────────────────────────

function OrgDetail({ org }: { org: Organization }) {
  const [page, setPage] = useState(1);
  const { data: products, isLoading: productsLoading } = useOrganizationProducts(
    org.id,
    { page, pageSize: 10 }
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EntityBadge kind="org" />
          {org.country && (
            <Badge variant="default">{org.country.label}</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground leading-tight">
          {org.legalName}
        </h1>

        {org.legalShortName && (
          <p className="text-lg text-text-secondary">{org.legalShortName}</p>
        )}

        {/* Action row */}
        <div className="flex flex-wrap gap-2 pt-1">
          {org.websiteUrl && (
            <a
              href={org.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-7 px-3 py-1.5 text-xs rounded-md font-medium border border-border bg-background text-foreground hover:bg-bg-secondary transition-colors"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              Website
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled
            leftIcon={<PlusCircle className="h-3.5 w-3.5" aria-hidden />}
            title="Comparison — coming soon"
          >
            Add to comparison
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <MetadataGrid
            items={[
              {
                label: "Country",
                value: org.country ? `${org.country.label} (${org.country.code})` : null,
                hidden: !org.country,
              },
              {
                label: "Short name",
                value: org.legalShortName,
                hidden: !org.legalShortName,
              },
              {
                label: "Alternative names",
                value: org.alternativeNames?.join(", ") || null,
                hidden: !org.alternativeNames?.length,
              },
              {
                label: "Website",
                value: org.websiteUrl ? (
                  <a
                    href={org.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1"
                  >
                    {org.websiteUrl}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                ) : null,
                hidden: !org.websiteUrl,
              },
            ]}
          />

          {/* PIDs */}
          {org.pids && org.pids.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Identifiers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {org.pids.map((pid, i) => (
                  <Badge key={i} variant="default">
                    {pid.scheme}: {pid.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              description="No publications linked to this organization yet."
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

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : undefined;

  const { data: org, isLoading, isError, error, refetch } = useOrganization(decodedId);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <BackButton />

        {isLoading && <OrgDetailSkeleton />}

        {isError && (
          <ErrorState
            description={(error as Error)?.message ?? "Failed to load this organization."}
            onRetry={() => refetch()}
          />
        )}

        {org && <OrgDetail org={org} />}
      </div>
    </AppShell>
  );
}
