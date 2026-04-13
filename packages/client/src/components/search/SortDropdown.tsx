import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  options,
  className,
}: SortDropdownProps) {
  return (
    <div className={clsx("relative inline-flex items-center", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort results"
        className={clsx(
          "appearance-none rounded-lg border border-border bg-background",
          "pl-3 pr-8 py-1.5 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-accent/60",
          "cursor-pointer transition-colors hover:border-text-muted"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none"
        aria-hidden
      />
    </div>
  );
}

export const RESEARCH_PRODUCT_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
  { value: "publicationDate DESC", label: "Date (newest)" },
  { value: "publicationDate ASC", label: "Date (oldest)" },
  { value: "popularity DESC", label: "Popularity" },
  { value: "citationCount DESC", label: "Citation count" },
];

export const PROJECT_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
  { value: "startDate DESC", label: "Start date (newest)" },
  { value: "startDate ASC", label: "Start date (oldest)" },
];

export const ORGANIZATION_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevance" },
];
