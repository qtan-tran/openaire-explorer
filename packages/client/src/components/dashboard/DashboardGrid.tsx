import type { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
}

/**
 * Responsive 3-column CSS Grid.
 * - Mobile  (< md):  1 column
 * - Tablet  (≥ md):  2 columns
 * - Desktop (≥ lg):  3 columns
 * Auto-rows ensure each row is at least 300px tall.
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(300px,auto)]">
      {children}
    </div>
  );
}
