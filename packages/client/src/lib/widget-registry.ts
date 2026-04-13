import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { OADistributionFilters } from "../hooks/useOADistribution";

// ─── Widget types ─────────────────────────────────────────────────────────────

export type WidgetType =
  | "oa-distribution"
  | "oa-donut"
  | "trends-line"
  | "trends-cumulative"
  | "growth-rate"
  | "network-graph"
  | "top-nodes"
  | "stat-card";

export type WidgetSize = "small" | "medium" | "large";

export interface WidgetProps {
  filters: OADistributionFilters;
}

export interface WidgetDef {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  component: LazyExoticComponent<ComponentType<WidgetProps>>;
}

// ─── Lazy widget imports ──────────────────────────────────────────────────────

const StatCardWidget    = lazy(() => import("../components/dashboard/widgets/StatCardWidget"));
const OADonutWidget     = lazy(() => import("../components/dashboard/widgets/OADonutWidget"));
const OADistributionWidget = lazy(() => import("../components/dashboard/widgets/OADistributionWidget"));
const TrendsLineWidget  = lazy(() => import("../components/dashboard/widgets/TrendsLineWidget"));
const TrendsCumulativeWidget = lazy(() => import("../components/dashboard/widgets/TrendsCumulativeWidget"));
const GrowthRateWidget  = lazy(() => import("../components/dashboard/widgets/GrowthRateWidget"));
const NetworkGraphWidget = lazy(() => import("../components/dashboard/widgets/NetworkGraphWidget"));
const TopNodesWidget    = lazy(() => import("../components/dashboard/widgets/TopNodesWidget"));

// ─── Registry ─────────────────────────────────────────────────────────────────

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDef> = {
  "stat-card": {
    type: "stat-card",
    title: "Summary Stats",
    description: "Key OA metrics at a glance: total outputs, OA rate, and open/closed ratio.",
    icon: "📊",
    defaultSize: "small",
    component: StatCardWidget,
  },
  "oa-donut": {
    type: "oa-donut",
    title: "OA Donut",
    description: "Donut chart showing the breakdown by open access category.",
    icon: "🍩",
    defaultSize: "medium",
    component: OADonutWidget,
  },
  "oa-distribution": {
    type: "oa-distribution",
    title: "OA Distribution",
    description: "Full OA distribution: donut, yearly stacked bar, and trend line.",
    icon: "📈",
    defaultSize: "large",
    component: OADistributionWidget,
  },
  "trends-line": {
    type: "trends-line",
    title: "Output Trends",
    description: "Year-over-year research output trends with optional OA rate overlay.",
    icon: "📉",
    defaultSize: "large",
    component: TrendsLineWidget,
  },
  "trends-cumulative": {
    type: "trends-cumulative",
    title: "Cumulative Outputs",
    description: "Cumulative stacked area chart of research outputs by type.",
    icon: "🏔️",
    defaultSize: "medium",
    component: TrendsCumulativeWidget,
  },
  "growth-rate": {
    type: "growth-rate",
    title: "Growth Rate",
    description: "Year-over-year growth rate as a bar chart (green = growth, red = decline).",
    icon: "📐",
    defaultSize: "medium",
    component: GrowthRateWidget,
  },
  "network-graph": {
    type: "network-graph",
    title: "Collaboration Network",
    description: "Force-directed graph of author co-authorship and organizational affiliations.",
    icon: "🕸️",
    defaultSize: "large",
    component: NetworkGraphWidget,
  },
  "top-nodes": {
    type: "top-nodes",
    title: "Top Nodes",
    description: "Most-connected authors, organizations, and projects in the network.",
    icon: "🏅",
    defaultSize: "medium",
    component: TopNodesWidget,
  },
};

// ─── CSS grid span helpers ────────────────────────────────────────────────────

/** Tailwind grid-span classes for each size (mobile-first, 3-col desktop). */
export const WIDGET_SIZE_CLASSES: Record<WidgetSize, string> = {
  small:  "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large:  "col-span-1 md:col-span-2 lg:col-span-3",
};
