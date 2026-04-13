import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { ResultCard } from "./ResultCard";
import type { SearchResultItem } from "./ResultCard";

interface ResultsListProps {
  items?: SearchResultItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  hasQuery: boolean;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex gap-2">
        <Skeleton variant="rect" width={80} height={20} />
        <Skeleton variant="rect" width={60} height={20} />
      </div>
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="text" lines={1} width="60%" />
    </div>
  );
}

export function ResultsList({
  items,
  isLoading,
  isError,
  error,
  onRetry,
  hasQuery,
}: ResultsListProps) {
  // No search query yet — show landing / prompt
  if (!hasQuery) {
    return (
      <EmptyState
        icon="🔭"
        title="Start your search"
        description="Enter a search term above or use the filters to explore publications, datasets, organizations and projects."
      />
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy aria-label="Loading results">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        description={
          error?.message ?? "Could not load results. Check your connection."
        }
        onRetry={onRetry}
      />
    );
  }

  // Empty results
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No results found"
        description="Try different search terms, broaden your filters, or check for spelling errors."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Search results">
      {items.map((result, i) => (
        <div key={`${result.kind}-${i}`} role="listitem">
          <ResultCard result={result} />
        </div>
      ))}
    </div>
  );
}
