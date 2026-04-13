import { Component, Suspense } from "react";
import type { ReactNode, ErrorInfo } from "react";
import clsx from "clsx";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import { WIDGET_REGISTRY, WIDGET_SIZE_CLASSES } from "../../lib/widget-registry";
import type { DashboardPanel } from "../../contexts/DashboardContext";
import type { WidgetSize } from "../../lib/widget-registry";
import type { OADistributionFilters } from "../../hooks/useOADistribution";

// ─── Error boundary ───────────────────────────────────────────────────────────

interface EBState { hasError: boolean; message: string }

class WidgetErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): EBState {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[WidgetErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full min-h-[180px]">
          <p className="text-sm text-error text-center px-4">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Suspense fallback ────────────────────────────────────────────────────────

function WidgetSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-1">
      <Skeleton variant="rect" height={32} width="60%" />
      <Skeleton variant="rect" height={200} />
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface WidgetPanelProps {
  panel: DashboardPanel;
  filters: OADistributionFilters;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: WidgetSize) => void;
}

export function WidgetPanel({ panel, filters, onRemove, onSizeChange }: WidgetPanelProps) {
  const def = WIDGET_REGISTRY[panel.widgetType];
  const Component = def.component;
  const isExpanded = panel.size === "large";

  function toggleSize() {
    onSizeChange(panel.id, isExpanded ? def.defaultSize : "large");
  }

  return (
    <div className={clsx(WIDGET_SIZE_CLASSES[panel.size], "flex")}>
      <div className="flex-1 rounded-xl border border-border bg-background flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border shrink-0 bg-bg-secondary/40">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {def.icon} {def.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {/* Expand / collapse — only meaningful for non-large-default widgets */}
            {def.defaultSize !== "large" && (
              <button
                type="button"
                onClick={toggleSize}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1 rounded text-text-muted hover:text-foreground hover:bg-bg-secondary transition-colors"
                aria-label={isExpanded ? "Collapse widget" : "Expand widget"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(panel.id)}
              title="Remove widget"
              className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
              aria-label="Remove widget"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Widget body */}
        <div className="flex-1 overflow-auto p-4 min-h-0">
          <Suspense fallback={<WidgetSkeleton />}>
            <WidgetErrorBoundary>
              <Component filters={filters} />
            </WidgetErrorBoundary>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
