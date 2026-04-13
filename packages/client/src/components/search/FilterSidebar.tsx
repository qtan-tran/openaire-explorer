import clsx from "clsx";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchFilters {
  fromYear: string;
  toYear: string;
  oaStatus: string;
  openAccessColor: string;
  funder: string;
}

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  showOaFilters: boolean; // only show for product searches
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── OA options ───────────────────────────────────────────────────────────────

const OA_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "EMBARGOEDACCESS", label: "Embargo" },
  { value: "RESTRICTED", label: "Restricted" },
  { value: "CLOSED", label: "Closed" },
];

const OA_COLOR_OPTIONS = [
  { value: "gold", label: "Gold" },
  { value: "green", label: "Green" },
  { value: "hybrid", label: "Hybrid" },
  { value: "bronze", label: "Bronze" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
      {children}
    </p>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value === value ? "" : opt.value)}
            onClick={() => { if (value === opt.value) onChange(""); }}
            className={clsx(
              "h-3.5 w-3.5 border-border text-accent",
              "focus:ring-accent/60 focus:ring-offset-background"
            )}
          />
          <span className="text-sm text-foreground group-hover:text-accent transition-colors">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function FilterContent({
  filters,
  onFiltersChange,
  showOaFilters,
}: {
  filters: SearchFilters;
  onFiltersChange: (f: SearchFilters) => void;
  showOaFilters: boolean;
}) {
  const set = (key: keyof SearchFilters) => (value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasAnyFilter =
    filters.fromYear ||
    filters.toYear ||
    filters.oaStatus ||
    filters.openAccessColor ||
    filters.funder;

  return (
    <div className="flex flex-col gap-6">
      {/* Year range */}
      <section>
        <SectionLabel>Year range</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.fromYear}
            onChange={(e) => set("fromYear")(e.target.value)}
            placeholder="From"
            min={1900}
            max={2100}
            aria-label="From year"
            className={clsx(
              "w-full rounded-lg border border-border bg-background",
              "px-3 py-1.5 text-sm text-foreground placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/60"
            )}
          />
          <span className="text-text-muted text-sm shrink-0">–</span>
          <input
            type="number"
            value={filters.toYear}
            onChange={(e) => set("toYear")(e.target.value)}
            placeholder="To"
            min={1900}
            max={2100}
            aria-label="To year"
            className={clsx(
              "w-full rounded-lg border border-border bg-background",
              "px-3 py-1.5 text-sm text-foreground placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/60"
            )}
          />
        </div>
      </section>

      {/* OA Status — products only */}
      {showOaFilters && (
        <>
          <section>
            <SectionLabel>OA status</SectionLabel>
            <RadioGroup
              name="oaStatus"
              options={OA_STATUS_OPTIONS}
              value={filters.oaStatus}
              onChange={set("oaStatus")}
            />
          </section>

          <section>
            <SectionLabel>OA color (publications)</SectionLabel>
            <RadioGroup
              name="openAccessColor"
              options={OA_COLOR_OPTIONS}
              value={filters.openAccessColor}
              onChange={set("openAccessColor")}
            />
          </section>
        </>
      )}

      {/* Funder */}
      <section>
        <SectionLabel>Funder</SectionLabel>
        <input
          type="text"
          value={filters.funder}
          onChange={(e) => set("funder")(e.target.value)}
          placeholder="e.g. EC, NIH, NSF"
          aria-label="Funder name"
          className={clsx(
            "w-full rounded-lg border border-border bg-background",
            "px-3 py-1.5 text-sm text-foreground placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent/60"
          )}
        />
      </section>

      {/* Clear all */}
      {hasAnyFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFiltersChange({
              fromYear: "",
              toYear: "",
              oaStatus: "",
              openAccessColor: "",
              funder: "",
            })
          }
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function FilterSidebar({
  filters,
  onFiltersChange,
  showOaFilters,
  mobileOpen,
  onMobileClose,
}: FilterSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col"
        aria-label="Search filters"
      >
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-text-muted" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Filters</span>
        </div>
        <FilterContent
          filters={filters}
          onFiltersChange={onFiltersChange}
          showOaFilters={showOaFilters}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal aria-label="Search filters">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            aria-hidden
            onClick={onMobileClose}
          />
          {/* Sheet */}
          <div className="relative z-50 flex w-72 max-w-full flex-col gap-4 bg-background border-r border-border p-5 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Filters</span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close filters"
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterContent
              filters={filters}
              onFiltersChange={(f) => { onFiltersChange(f); }}
              showOaFilters={showOaFilters}
            />
          </div>
        </div>
      )}
    </>
  );
}
