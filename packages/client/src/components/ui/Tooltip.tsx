import { cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
}

/**
 * CSS-only tooltip using the [data-tooltip] + ::after approach defined in globals.css.
 * Clones the direct child element and injects the data-tooltip / data-tooltip-position
 * attributes. No JS, no Portal — just CSS transitions.
 */
export function Tooltip({ content, position = "top", children }: TooltipProps) {
  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  const child = children as ReactElement<Record<string, unknown>>;
  const extraProps: Record<string, string> = {
    "data-tooltip": content,
    ...(position !== "top" ? { "data-tooltip-position": position } : {}),
  };

  return cloneElement(child, extraProps);
}
