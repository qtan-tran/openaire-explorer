import { Link } from "react-router-dom";
import type { ResearchProduct } from "@openaire-explorer/shared";
import { Skeleton } from "../ui/Skeleton";
import { OAStatusBadge } from "./OAStatusBadge";
import clsx from "clsx";

// ─── Mini product card ────────────────────────────────────────────────────────

function MiniProductCard({ product }: { product: ResearchProduct }) {
  const year = product.publicationDate?.slice(0, 4);
  const authors = product.authors?.slice(0, 2).map((a) => a.fullName).join(", ");
  const hasMoreAuthors = (product.authors?.length ?? 0) > 2;

  return (
    <Link
      to={`/entity/product/${encodeURIComponent(product.id)}`}
      className={clsx(
        "flex flex-col gap-2 rounded-xl border border-border bg-background p-3",
        "w-56 shrink-0 hover:border-text-muted hover:shadow-md transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      )}
    >
      <OAStatusBadge
        color={product.openAccessColor}
        accessRightLabel={product.bestAccessRight?.label}
      />
      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
        {product.mainTitle}
      </p>
      {(authors || year) && (
        <p className="text-xs text-text-muted truncate">
          {authors}
          {hasMoreAuthors ? " et al." : ""}
          {authors && year ? " · " : ""}
          {year}
        </p>
      )}
    </Link>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface RelatedEntitiesListProps {
  products?: ResearchProduct[];
  isLoading?: boolean;
  title?: string;
}

export function RelatedEntitiesList({
  products,
  isLoading,
  title = "Related publications",
}: RelatedEntitiesListProps) {
  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-56 shrink-0 rounded-xl border border-border bg-background p-3 flex flex-col gap-2"
              >
                <Skeleton variant="rect" height={20} width={60} />
                <Skeleton variant="text" lines={2} />
                <Skeleton variant="rect" height={14} width="80%" />
              </div>
            ))
          : products!.map((p) => <MiniProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
