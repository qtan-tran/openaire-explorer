import type { ReactNode } from "react";

export interface MetadataItem {
  label: string;
  value: ReactNode;
  /** Skip rendering this item entirely */
  hidden?: boolean;
}

interface MetadataGridProps {
  items: MetadataItem[];
  columns?: 1 | 2;
}

export function MetadataGrid({ items, columns = 2 }: MetadataGridProps) {
  const visible = items.filter(
    (item) => !item.hidden && item.value != null && item.value !== ""
  );
  if (visible.length === 0) return null;

  return (
    <dl
      className={
        columns === 2
          ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
          : "flex flex-col gap-4"
      }
    >
      {visible.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1 min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </dt>
          <dd className="text-sm text-foreground break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
