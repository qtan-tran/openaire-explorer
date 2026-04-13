import { BookOpen, FlaskConical, Code2, Building2, FolderKanban } from "lucide-react";
import { Badge } from "../ui/Badge";

type ProductType = "publication" | "dataset" | "software" | "other";

interface EntityBadgeProps {
  kind: "product" | "org" | "project";
  productType?: ProductType;
}

const PRODUCT_CONFIG: Record<
  ProductType,
  { label: string; Icon: React.ElementType }
> = {
  publication: { label: "Publication", Icon: BookOpen },
  dataset:     { label: "Dataset",     Icon: FlaskConical },
  software:    { label: "Software",    Icon: Code2 },
  other:       { label: "Other",       Icon: BookOpen },
};

export function EntityBadge({ kind, productType }: EntityBadgeProps) {
  if (kind === "product") {
    const { label, Icon } = PRODUCT_CONFIG[productType ?? "publication"];
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </Badge>
    );
  }
  if (kind === "org") {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        Organization
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="flex items-center gap-1">
      <FolderKanban className="h-3.5 w-3.5" aria-hidden />
      Project
    </Badge>
  );
}
