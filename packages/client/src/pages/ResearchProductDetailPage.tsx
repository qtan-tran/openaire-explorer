import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, GitBranch, PlusCircle } from "lucide-react";
import clsx from "clsx";

import { AppShell } from "../components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";

import { EntityBadge } from "../components/detail/EntityBadge";
import { OAStatusBadge } from "../components/detail/OAStatusBadge";
import { MetadataGrid } from "../components/detail/MetadataGrid";
import { RelatedEntitiesList } from "../components/detail/RelatedEntitiesList";

import { useResearchProduct } from "../hooks/useResearchProduct";
import { useRelatedProducts } from "../hooks/useRelatedProducts";
import type { ResearchProduct } from "@openaire-explorer/shared";

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/search"))}
      className={clsx(
        "inline-flex items-center gap-1.5 text-sm text-text-secondary",
        "hover:text-foreground transition-colors"
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to results
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="rect" height={18} width={120} />
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton variant="rect" height={22} width={90} />
          <Skeleton variant="rect" height={22} width={70} />
        </div>
        <Skeleton variant="text" lines={2} className="max-w-2xl" />
        <Skeleton variant="text" lines={1} width="60%" />
      </div>
      <Skeleton variant="rect" height={160} />
      <Skeleton variant="rect" height={200} />
    </div>
  );
}

// ─── Abstract (expandable) ────────────────────────────────────────────────────

function Abstract({ descriptions }: { descriptions: string[] | null }) {
  const [expanded, setExpanded] = useState(false);
  const text = descriptions?.join("\n\n") ?? "";
  if (!text) return null;

  const LIMIT = 400;
  const isLong = text.length > LIMIT;
  const display = isLong && !expanded ? text.slice(0, LIMIT).trimEnd() + "…" : text;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
        Abstract
      </h2>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-xs text-accent hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}

// ─── Impact indicators ────────────────────────────────────────────────────────

const CLASS_COLORS: Record<string, string> = {
  C1: "bg-oa-green/10 text-oa-green",
  C2: "bg-oa-green/10 text-oa-green",
  C3: "bg-accent/10 text-accent",
  C4: "bg-warning/10 text-warning",
  C5: "bg-oa-closed/10 text-oa-closed",
};

function ImpactPill({ label, value }: { label: string; value: string | number | null }) {
  if (value == null) return null;
  const cls = typeof value === "string" ? (CLASS_COLORS[value] ?? "bg-bg-secondary text-text-secondary") : "";
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      <span className={clsx("px-2.5 py-0.5 rounded-full text-sm font-semibold", cls || "text-foreground")}>
        {typeof value === "number" ? new Intl.NumberFormat().format(value) : value}
      </span>
    </div>
  );
}

// ─── Boolean flag badge ───────────────────────────────────────────────────────

function FlagBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <Badge variant={value ? "success" : "default"} className="whitespace-nowrap">
      {value ? "✓" : "✗"} {label}
    </Badge>
  );
}

// ─── Main product detail ──────────────────────────────────────────────────────

function ProductDetail({ product }: { product: ResearchProduct }) {
  const doi = product.pids?.find((p) => p.scheme.toLowerCase() === "doi")?.value;
  const peerReviewed = product.instances.some((i) => i.refereed === "peerReviewed");
  const impact = product.indicators?.citationImpact;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EntityBadge kind="product" productType={product.type} />
          <OAStatusBadge
            color={product.openAccessColor}
            accessRightLabel={product.bestAccessRight?.label}
          />
          {product.isGreen && <Badge variant="oa-green">Green</Badge>}
          {product.isInDiamondJournal && <Badge variant="oa-hybrid">Diamond</Badge>}
        </div>

        <h1 className="text-3xl font-bold text-foreground leading-tight">
          {product.mainTitle}
        </h1>
        {product.subTitle && (
          <p className="text-lg text-text-secondary">{product.subTitle}</p>
        )}

        {/* Authors */}
        {product.authors && product.authors.length > 0 && (
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-sm text-text-secondary">
            {product.authors.map((author, i) => (
              <span key={i}>
                <Link
                  to={`/search?q=${encodeURIComponent(author.fullName)}`}
                  className="hover:text-accent hover:underline transition-colors"
                >
                  {author.fullName}
                </Link>
                {i < product.authors.length - 1 && <span className="text-text-muted">,</span>}
              </span>
            ))}
          </div>
        )}

        {/* Publication meta row */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          {product.publicationDate && (
            <span>{product.publicationDate.slice(0, 4)}</span>
          )}
          {product.publisher && (
            <>
              <span aria-hidden className="text-border">·</span>
              <span>{product.publisher}</span>
            </>
          )}
          {product.container?.name && (
            <>
              <span aria-hidden className="text-border">·</span>
              <span className="italic">{product.container.name}</span>
            </>
          )}
          {doi && (
            <>
              <span aria-hidden className="text-border">·</span>
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                DOI <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </>
          )}
        </div>

        {/* Action row */}
        <div className="flex flex-wrap gap-2 pt-1">
          {product.instances[0]?.urls[0] && (
            <a
              href={product.instances[0].urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-7 px-3 py-1.5 text-xs rounded-md font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              View full text
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
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

      {/* Abstract */}
      <Abstract descriptions={product.descriptions} />

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
        <CardContent>
          <MetadataGrid
            items={[
              {
                label: "Language",
                value: product.language?.label ?? null,
                hidden: !product.language,
              },
              {
                label: "Publication date",
                value: product.publicationDate,
                hidden: !product.publicationDate,
              },
              {
                label: "Countries",
                value: product.countries?.length
                  ? product.countries.map((c) => c.label).join(", ")
                  : null,
                hidden: !product.countries?.length,
              },
              {
                label: "Embargo end",
                value: product.embargoEndDate,
                hidden: !product.embargoEndDate,
              },
              {
                label: "Version",
                value: product.version,
                hidden: !product.version,
              },
              {
                label: "Programming language",
                value: product.programmingLanguage,
                hidden: !product.programmingLanguage,
              },
              {
                label: "Repository",
                value: product.codeRepositoryUrl ? (
                  <a
                    href={product.codeRepositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <GitBranch className="h-3.5 w-3.5" aria-hidden />
                    {product.codeRepositoryUrl}
                  </a>
                ) : null,
                hidden: !product.codeRepositoryUrl,
              },
              {
                label: "Collected from",
                value: product.collectedFrom?.map((c) => c.value).join(", ") || null,
                hidden: !product.collectedFrom?.length,
              },
            ]}
          />

          {/* Subjects */}
          {product.subjects && product.subjects.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Subjects
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.subjects.map((s, i) => (
                  <Badge key={i} variant="default">
                    {s.subject.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Boolean flags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <FlagBadge label="Peer reviewed" value={peerReviewed} />
            <FlagBadge label="Diamond journal" value={product.isInDiamondJournal} />
            <FlagBadge label="Publicly funded" value={product.publiclyFunded} />
            <FlagBadge label="Green OA" value={product.isGreen} />
          </div>
        </CardContent>
      </Card>

      {/* Impact metrics */}
      {impact && (
        <Card>
          <CardHeader><CardTitle>Impact metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <ImpactPill label="Citations" value={impact.citationCount} />
              <ImpactPill label="Citation class" value={impact.citationClass} />
              <ImpactPill label="Influence class" value={impact.influenceClass} />
              <ImpactPill label="Popularity class" value={impact.popularityClass} />
              <ImpactPill label="Impulse class" value={impact.impulseClass} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related projects */}
      {product.projects && product.projects.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {product.projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/entity/project/${encodeURIComponent(proj.id)}`}
                  className="text-sm text-accent hover:underline"
                >
                  {proj.title || proj.acronym || proj.code}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related organizations */}
      {product.organizations && product.organizations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Affiliated organizations</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {product.organizations.map((org) => (
                <Link
                  key={org.id}
                  to={`/entity/organization/${encodeURIComponent(org.id)}`}
                  className="text-sm text-accent hover:underline"
                >
                  {org.legalName}
                  {org.acronym && (
                    <span className="ml-1 text-text-muted">({org.acronym})</span>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ResearchProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : undefined;

  const { data: product, isLoading, isError, error, refetch } = useResearchProduct(decodedId);
  const { data: related, isLoading: relatedLoading } = useRelatedProducts(decodedId);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <BackButton />

        {isLoading && <ProductDetailSkeleton />}

        {isError && (
          <ErrorState
            description={(error as Error)?.message ?? "Failed to load this record."}
            onRetry={() => refetch()}
          />
        )}

        {product && (
          <>
            <ProductDetail product={product} />
            <RelatedEntitiesList
              products={related?.data}
              isLoading={relatedLoading}
              title="Related publications"
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
