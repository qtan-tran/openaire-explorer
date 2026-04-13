import { Link } from "react-router-dom";
import type { ResearchProduct, Organization, Project } from "@openaire-explorer/shared";
import { Badge } from "../ui/Badge";
import type { BadgeVariant } from "../ui/Badge";
import clsx from "clsx";
import { Calendar, Building2, BookOpen, FlaskConical, Code2, Globe } from "lucide-react";

// ─── Discriminated union ──────────────────────────────────────────────────────

export type SearchResultItem =
  | { kind: "product"; item: ResearchProduct }
  | { kind: "org"; item: Organization }
  | { kind: "project"; item: Project };

// ─── OA badge helpers ─────────────────────────────────────────────────────────

function oaBadgeVariant(color: string | null | undefined): BadgeVariant {
  switch (color) {
    case "gold":   return "oa-gold";
    case "green":  return "oa-green";
    case "hybrid": return "oa-hybrid";
    case "bronze": return "oa-bronze";
    default:       return "oa-closed";
  }
}

function oaBadgeLabel(color: string | null | undefined): string {
  if (!color) return "Closed";
  return color.charAt(0).toUpperCase() + color.slice(1);
}

// ─── Product type icons ───────────────────────────────────────────────────────

function ProductTypeIcon({ type }: { type: string }) {
  const cls = "h-3.5 w-3.5";
  switch (type) {
    case "dataset":  return <FlaskConical className={cls} aria-hidden />;
    case "software": return <Code2 className={cls} aria-hidden />;
    default:         return <BookOpen className={cls} aria-hidden />;
  }
}

function productTypeLabel(type: string): string {
  switch (type) {
    case "publication": return "Publication";
    case "dataset":     return "Dataset";
    case "software":    return "Software";
    default:            return "Other";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAuthors(authors: ResearchProduct["authors"], max = 3): string {
  if (!authors || authors.length === 0) return "";
  const names = authors.slice(0, max).map((a) => a.fullName);
  return authors.length > max ? `${names.join(", ")} et al.` : names.join(", ");
}

function truncateDescription(text: string | null | undefined, lines = 2): string {
  if (!text) return "";
  // Rough 2-line approximation: ~180 chars
  if (text.length <= 180) return text;
  return text.slice(0, 180).replace(/\s+\S*$/, "") + "…";
}

function extractYear(date: string | null | undefined): string {
  if (!date) return "";
  return date.slice(0, 4);
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function CardShell({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={clsx(
        "group relative flex flex-col gap-2 rounded-xl border border-border bg-background p-4",
        "transition-shadow duration-150 hover:shadow-md hover:border-border"
      )}
    >
      <Link
        to={to}
        className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
        tabIndex={-1}
        aria-hidden
      />
      {children}
    </article>
  );
}

// ─── Research Product card ────────────────────────────────────────────────────

function ProductCard({ item }: { item: ResearchProduct }) {
  const authors = truncateAuthors(item.authors);
  const year = extractYear(item.publicationDate);
  const description = truncateDescription(item.descriptions?.[0]);

  return (
    <CardShell to={`/entity/product/${encodeURIComponent(item.id)}`}>
      {/* Top row: type badge + OA badge */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default" className="flex items-center gap-1">
          <ProductTypeIcon type={item.type} />
          {productTypeLabel(item.type)}
        </Badge>
        <Badge variant={oaBadgeVariant(item.openAccessColor)}>
          {oaBadgeLabel(item.openAccessColor)}
        </Badge>
      </div>

      {/* Title */}
      <Link
        to={`/entity/product/${encodeURIComponent(item.id)}`}
        className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-2 relative z-10"
      >
        {item.mainTitle}
      </Link>

      {/* Authors + year */}
      {(authors || year) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {authors && <span>{authors}</span>}
          {authors && year && <span aria-hidden>·</span>}
          {year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden />
              {year}
            </span>
          )}
          {item.publisher && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate max-w-[200px]">{item.publisher}</span>
            </>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-text-secondary line-clamp-2">{description}</p>
      )}
    </CardShell>
  );
}

// ─── Organization card ────────────────────────────────────────────────────────

function OrgCard({ item }: { item: Organization }) {
  return (
    <CardShell to={`/entity/organization/${encodeURIComponent(item.id)}`}>
      <div className="flex items-center gap-2">
        <Badge variant="default" className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          Organization
        </Badge>
        {item.country && (
          <Badge variant="default">{item.country.label}</Badge>
        )}
      </div>

      <Link
        to={`/entity/organization/${encodeURIComponent(item.id)}`}
        className="text-sm font-semibold text-foreground hover:text-accent transition-colors relative z-10"
      >
        {item.legalName}
      </Link>

      {(item.legalShortName || item.websiteUrl) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {item.legalShortName && <span>{item.legalShortName}</span>}
          {item.websiteUrl && (
            <>
              {item.legalShortName && <span aria-hidden>·</span>}
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden />
                <a
                  href={item.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                </a>
              </span>
            </>
          )}
        </div>
      )}
    </CardShell>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ item }: { item: Project }) {
  const funder = item.fundings?.[0];
  const description = truncateDescription(item.summary);

  return (
    <CardShell to={`/entity/project/${encodeURIComponent(item.id)}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">Project</Badge>
        {funder && <Badge variant="success">{funder.shortName}</Badge>}
        {item.openAccessMandateForPublications && (
          <Badge variant="oa-green">OA Mandate</Badge>
        )}
      </div>

      <Link
        to={`/entity/project/${encodeURIComponent(item.id)}`}
        className="text-sm font-semibold text-foreground hover:text-accent transition-colors relative z-10"
      >
        {item.title}
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {item.acronym && <span className="font-medium">{item.acronym}</span>}
        {item.acronym && item.code && <span aria-hidden>·</span>}
        {item.code && <span>{item.code}</span>}
        {item.startDate && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden />
              {extractYear(item.startDate)}
              {item.endDate && `–${extractYear(item.endDate)}`}
            </span>
          </>
        )}
      </div>

      {description && (
        <p className="text-xs text-text-secondary line-clamp-2">{description}</p>
      )}
    </CardShell>
  );
}

// ─── Exported unified card ────────────────────────────────────────────────────

export function ResultCard({ result }: { result: SearchResultItem }) {
  switch (result.kind) {
    case "product": return <ProductCard item={result.item} />;
    case "org":     return <OrgCard item={result.item} />;
    case "project": return <ProjectCard item={result.item} />;
  }
}
