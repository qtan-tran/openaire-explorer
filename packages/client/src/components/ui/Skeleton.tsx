import clsx from "clsx";
import type { CSSProperties } from "react";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  /** Number of stacked text lines to render */
  lines?: number;
  className?: string;
}

function toCSS(v: string | number | undefined) {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  const style: CSSProperties = {
    width: toCSS(width),
    height: toCSS(height),
  };

  if (variant === "text") {
    return (
      <div className={clsx("flex flex-col gap-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={clsx(
              "block h-4 rounded skeleton-shimmer",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    const size = toCSS(width ?? height ?? 40);
    return (
      <span
        aria-hidden
        role="presentation"
        className={clsx("block rounded-full skeleton-shimmer shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  // rect
  return (
    <span
      aria-hidden
      role="presentation"
      className={clsx("block rounded-lg skeleton-shimmer", className)}
      style={{ width: toCSS(width) ?? "100%", height: toCSS(height) ?? "1rem", ...style }}
    />
  );
}
