import clsx from "clsx";
import type { ReactNode } from "react";

interface TrendProps {
  direction: "up" | "down" | "neutral";
  label: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: TrendProps;
  /** Optional small visual (e.g. a mini bar) */
  visual?: ReactNode;
  className?: string;
}

function TrendIndicator({ direction, label }: TrendProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        direction === "up" && "text-oa-green",
        direction === "down" && "text-error",
        direction === "neutral" && "text-text-muted"
      )}
    >
      {direction === "up" && "↑"}
      {direction === "down" && "↓"}
      {direction === "neutral" && "→"}
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  visual,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-background p-4 flex flex-col gap-2",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="text-3xl font-bold text-foreground leading-none tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col gap-0.5">
          {sub && <span className="text-xs text-text-secondary">{sub}</span>}
          {trend && <TrendIndicator {...trend} />}
        </div>
        {visual && <div className="shrink-0">{visual}</div>}
      </div>
    </div>
  );
}
