import type { HTMLAttributes } from "react";
import clsx from "clsx";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "oa-gold"
  | "oa-green"
  | "oa-hybrid"
  | "oa-bronze"
  | "oa-closed";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   "bg-bg-secondary text-text-secondary border-border",
  success:   "bg-success/10 text-success border-success/20",
  warning:   "bg-warning/10 text-warning border-warning/20",
  error:     "bg-error/10 text-error border-error/20",
  "oa-gold":   "bg-oa-gold/10 text-oa-gold border-oa-gold/20",
  "oa-green":  "bg-oa-green/10 text-oa-green border-oa-green/20",
  "oa-hybrid": "bg-oa-hybrid/10 text-oa-hybrid border-oa-hybrid/20",
  "oa-bronze": "bg-oa-bronze/10 text-oa-bronze border-oa-bronze/20",
  "oa-closed": "bg-oa-closed/10 text-oa-closed border-oa-closed/20",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
