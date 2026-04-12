import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import clsx from "clsx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a subtle hover lift + shadow */
  hoverable?: boolean;
  /** Removes default padding */
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ hoverable = false, noPadding = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl border border-border bg-background",
          "transition-all duration-200",
          !noPadding && "p-4",
          hoverable && [
            "cursor-pointer",
            "hover:border-text-muted hover:shadow-md",
            "hover:-translate-y-0.5",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/** Semantic sub-sections for Card */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-col gap-1 pb-3 border-b border-border", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("text-base font-semibold text-foreground leading-tight", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("pt-3", className)} {...props} />;
}
