import { useState } from "react";
import { X, Search } from "lucide-react";
import clsx from "clsx";
import { useSearchResearchProducts } from "../../hooks/useSearchResearchProducts";
import { useSearchOrganizations } from "../../hooks/useSearchOrganizations";
import { useSearchProjects } from "../../hooks/useSearchProjects";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import type { ComparisonEntity } from "@openaire-explorer/shared";

type EntityTab = "research-product" | "organization" | "project";

const TABS: { id: EntityTab; label: string }[] = [
  { id: "research-product", label: "Products" },
  { id: "organization", label: "Organizations" },
  { id: "project", label: "Projects" },
];

interface AddEntityModalProps {
  onAdd: (entity: ComparisonEntity) => void;
  onClose: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

export function AddEntityModal({
  onAdd,
  onClose,
  isSelected,
  isFull,
}: AddEntityModalProps) {
  const [tab, setTab] = useState<EntityTab>("organization");
  const [query, setQuery] = useState("");

  const { data: products, isLoading: loadingProducts } =
    useSearchResearchProducts({ search: query, pageSize: 8 });
  const { data: orgs, isLoading: loadingOrgs } = useSearchOrganizations({
    search: query,
    pageSize: 8,
  });
  const { data: projects, isLoading: loadingProjects } = useSearchProjects({
    search: query,
    pageSize: 8,
  });

  const isLoading =
    (tab === "research-product" && loadingProducts) ||
    (tab === "organization" && loadingOrgs) ||
    (tab === "project" && loadingProjects);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            Add entity to comparison
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-text-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              aria-label="Search entities"
              autoFocus
              className={clsx(
                "w-full rounded-lg border border-border bg-bg-secondary",
                "pl-9 pr-3 py-2 text-sm text-foreground",
                "placeholder:text-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/60"
              )}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 px-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                "py-2 px-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {tab === "research-product" &&
                (products?.data ?? []).map((p) => (
                  <ResultRow
                    key={p.id}
                    id={p.id}
                    name={p.mainTitle}
                    meta={p.publicationDate?.slice(0, 4)}
                    type="research-product"
                    onAdd={onAdd}
                    selected={isSelected(p.id)}
                    disabled={isFull && !isSelected(p.id)}
                  />
                ))}

              {tab === "organization" &&
                (orgs?.data ?? []).map((o) => (
                  <ResultRow
                    key={o.id}
                    id={o.id}
                    name={o.legalName}
                    meta={o.country?.label}
                    type="organization"
                    onAdd={onAdd}
                    selected={isSelected(o.id)}
                    disabled={isFull && !isSelected(o.id)}
                  />
                ))}

              {tab === "project" &&
                (projects?.data ?? []).map((p) => (
                  <ResultRow
                    key={p.id}
                    id={p.id}
                    name={p.title}
                    meta={p.fundings?.[0]?.shortName}
                    type="project"
                    onAdd={onAdd}
                    selected={isSelected(p.id)}
                    disabled={isFull && !isSelected(p.id)}
                  />
                ))}

              {!isLoading && !query && (
                <li className="py-6 text-center text-sm text-text-muted">
                  Type to search entities
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <Button variant="secondary" size="sm" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ResultRow({
  id,
  name,
  meta,
  type,
  onAdd,
  selected,
  disabled,
}: {
  id: string;
  name: string;
  meta?: string | null;
  type: ComparisonEntity["type"];
  onAdd: (entity: ComparisonEntity) => void;
  selected: boolean;
  disabled: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!selected) onAdd({ id, type, name });
        }}
        className={clsx(
          "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors",
          selected
            ? "bg-accent/10 text-accent cursor-default"
            : disabled
            ? "opacity-40 cursor-not-allowed text-foreground"
            : "hover:bg-bg-secondary text-foreground"
        )}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate font-medium">{name}</span>
          {meta && <span className="text-xs text-text-muted">{meta}</span>}
        </div>
        {selected && (
          <span className="shrink-0 text-xs font-semibold">Added</span>
        )}
      </button>
    </li>
  );
}
