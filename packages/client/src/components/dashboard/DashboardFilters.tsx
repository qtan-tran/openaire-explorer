import clsx from "clsx";
import { X } from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";
import type { OADistributionFilters } from "../../hooks/useOADistribution";

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={clsx(
          "rounded-lg border border-border bg-bg-secondary",
          "px-3 py-1.5 text-sm text-foreground placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/60"
        )}
      />
    </div>
  );
}

/**
 * Global dashboard filter bar — reads/writes filters from DashboardContext.
 * Filters are passed to every widget simultaneously.
 */
export function DashboardFilters() {
  const { filters, setFilters } = useDashboard();

  const set =
    (key: keyof OADistributionFilters) => (value: string) =>
      setFilters({ ...filters, [key]: value || undefined });

  const hasAny = Object.values(filters).some(Boolean);

  const clear = () =>
    setFilters({
      search: undefined,
      organizationId: undefined,
      projectId: undefined,
      funderShortName: undefined,
      fromYear: undefined,
      toYear: undefined,
    });

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-border bg-background">
      <FieldInput
        label="Search"
        value={filters.search ?? ""}
        onChange={set("search")}
        placeholder="Keywords…"
      />
      <FieldInput
        label="Funder"
        value={filters.funderShortName ?? ""}
        onChange={set("funderShortName")}
        placeholder="e.g. EC, NSF"
      />
      <FieldInput
        label="Org ID"
        value={filters.organizationId ?? ""}
        onChange={set("organizationId")}
        placeholder="OpenAIRE org ID"
      />
      <FieldInput
        label="Project ID"
        value={filters.projectId ?? ""}
        onChange={set("projectId")}
        placeholder="OpenAIRE project ID"
      />
      <FieldInput
        label="From year"
        value={filters.fromYear ?? ""}
        onChange={set("fromYear")}
        placeholder="2010"
        type="number"
        min={1900}
        max={2100}
      />
      <FieldInput
        label="To year"
        value={filters.toYear ?? ""}
        onChange={set("toYear")}
        placeholder="2024"
        type="number"
        min={1900}
        max={2100}
      />

      {hasAny && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 h-[34px] px-3 rounded-lg text-sm text-text-secondary border border-border hover:text-foreground hover:border-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear all
        </button>
      )}
    </div>
  );
}
