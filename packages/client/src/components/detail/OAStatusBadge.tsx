import { Badge } from "../ui/Badge";
import type { BadgeVariant } from "../ui/Badge";

type OAColor = "gold" | "green" | "hybrid" | "bronze" | null | undefined;

const COLOR_VARIANT: Record<string, BadgeVariant> = {
  gold:   "oa-gold",
  green:  "oa-green",
  hybrid: "oa-hybrid",
  bronze: "oa-bronze",
};

const ACCESS_RIGHT_VARIANT: Record<string, BadgeVariant> = {
  OPEN:             "oa-green",
  EMBARGOEDACCESS:  "warning",
  RESTRICTED:       "error",
  CLOSEDACCESS:     "oa-closed",
};

const ACCESS_RIGHT_LABEL: Record<string, string> = {
  OPEN:            "Open",
  EMBARGOEDACCESS: "Embargo",
  RESTRICTED:      "Restricted",
  CLOSEDACCESS:    "Closed",
};

interface OAStatusBadgeProps {
  /** openAccessColor from ResearchProduct */
  color?: OAColor;
  /** bestAccessRight.label from ResearchProduct */
  accessRightLabel?: string | null;
}

export function OAStatusBadge({ color, accessRightLabel }: OAStatusBadgeProps) {
  if (color) {
    return (
      <Badge variant={COLOR_VARIANT[color] ?? "default"}>
        {color.charAt(0).toUpperCase() + color.slice(1)} OA
      </Badge>
    );
  }
  if (accessRightLabel) {
    const key = accessRightLabel.toUpperCase().replace(/\s+/g, "");
    return (
      <Badge variant={ACCESS_RIGHT_VARIANT[key] ?? "default"}>
        {ACCESS_RIGHT_LABEL[key] ?? accessRightLabel}
      </Badge>
    );
  }
  return <Badge variant="oa-closed">Closed</Badge>;
}
