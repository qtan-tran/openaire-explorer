import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ResultCard } from "./ResultCard";
import type { SearchResultItem } from "./ResultCard";

/** Estimated card height in px (covers most cases; dynamic measurement corrects it). */
const ESTIMATED_HEIGHT = 130;
/** Gap between cards in px (matches gap-3 = 12px). */
const GAP = 12;
/** Fixed scroll-container height for the virtualized list. */
const CONTAINER_HEIGHT = 640;

interface VirtualizedResultsListProps {
  items: SearchResultItem[];
}

/**
 * Virtualizes a large result list so only visible DOM nodes are rendered.
 * Activates automatically when a ResultsList has > 50 items.
 *
 * Uses dynamic item measurement so variable-height cards lay out correctly.
 */
export function VirtualizedResultsList({ items }: VirtualizedResultsListProps) {
  'use no memo';

  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ESTIMATED_HEIGHT,
    // Dynamically measure rendered elements so layout is pixel-perfect.
    measureElement: (el) => el.getBoundingClientRect().height,
    gap: GAP,
    overscan: 4,
  });

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-xl"
      style={{ height: CONTAINER_HEIGHT }}
      role="list"
      aria-label="Search results"
    >
      <div
        style={{ height: virtualizer.getTotalSize(), position: "relative" }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const result = items[virtualItem.index];
          if (!result) return null;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              role="listitem"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ResultCard result={result} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
