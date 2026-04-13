import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={clsx("flex items-center justify-center gap-1", className)}
    >
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 text-center text-sm text-text-muted select-none"
          >
            …
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium",
        "transition-colors select-none",
        "disabled:opacity-40 disabled:pointer-events-none",
        active
          ? "bg-accent text-white"
          : "border border-border bg-background text-foreground hover:bg-bg-secondary"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const result: (number | "…")[] = [];
  result.push(1);

  if (current > 4) result.push("…");

  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i++) result.push(i);

  if (current < total - 3) result.push("…");
  result.push(total);

  return result;
}
