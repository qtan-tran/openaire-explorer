import { X } from "lucide-react";
import clsx from "clsx";
import type { ComparisonEntity } from "@openaire-explorer/shared";

const TYPE_COLORS: Record<ComparisonEntity["type"], string> = {
  "research-product": "bg-accent/10 text-accent border-accent/30",
  organization: "bg-oa-green/10 text-oa-green border-oa-green/30",
  project: "bg-warning/10 text-warning border-warning/30",
};

const TYPE_LABEL: Record<ComparisonEntity["type"], string> = {
  "research-product": "Product",
  organization: "Org",
  project: "Project",
};

interface EntityChipProps {
  entity: ComparisonEntity;
  onRemove: (id: string) => void;
}

export function EntityChip({ entity, onRemove }: EntityChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        TYPE_COLORS[entity.type]
      )}
    >
      <span className="opacity-70">{TYPE_LABEL[entity.type]}</span>
      <span className="max-w-[160px] truncate">{entity.name}</span>
      <button
        type="button"
        aria-label={`Remove ${entity.name} from comparison`}
        onClick={() => onRemove(entity.id)}
        className="shrink-0 rounded-full hover:opacity-70 transition-opacity -mr-0.5"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}
