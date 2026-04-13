import type { OACategory } from "../../hooks/useOADistribution";

/** Chart.js-compatible RGBA values for each OA category. */
export const OA_COLORS: Record<OACategory, string> = {
  gold:    "rgba(234, 179, 8,   0.85)", // yellow-500
  green:   "rgba(34,  197, 94,  0.85)", // green-500
  hybrid:  "rgba(249, 115, 22,  0.85)", // orange-500
  bronze:  "rgba(180, 83,  9,   0.85)", // amber-800
  closed:  "rgba(239, 68,  68,  0.85)", // red-500
  unknown: "rgba(156, 163, 175, 0.85)", // gray-400
};

export const OA_COLORS_SOLID: Record<OACategory, string> = {
  gold:    "rgb(234, 179, 8)",
  green:   "rgb(34,  197, 94)",
  hybrid:  "rgb(249, 115, 22)",
  bronze:  "rgb(180, 83,  9)",
  closed:  "rgb(239, 68,  68)",
  unknown: "rgb(156, 163, 175)",
};

export const OA_LABELS: Record<OACategory, string> = {
  gold:    "Gold",
  green:   "Green",
  hybrid:  "Hybrid",
  bronze:  "Bronze",
  closed:  "Closed",
  unknown: "Unknown",
};

export const OA_CATEGORIES: OACategory[] = [
  "gold",
  "green",
  "hybrid",
  "bronze",
  "closed",
  "unknown",
];
