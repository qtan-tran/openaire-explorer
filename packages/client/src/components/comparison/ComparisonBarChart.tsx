import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ComparisonEntity, ComparisonMetrics } from "@openaire-explorer/shared";

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

// Palette that works in both light and dark mode
const ENTITY_COLORS = [
  "rgba(59, 130, 246, 0.8)",   // blue
  "rgba(16, 185, 129, 0.8)",   // green
  "rgba(245, 158, 11, 0.8)",   // amber
  "rgba(239, 68, 68, 0.8)",    // red
  "rgba(168, 85, 247, 0.8)",   // purple
];

const OA_CATEGORIES = ["gold", "green", "hybrid", "bronze", "closed", "unknown"] as const;

interface ComparisonBarChartProps {
  entities: ComparisonEntity[];
  metrics: ComparisonMetrics[];
}

export function ComparisonBarChart({ entities, metrics }: ComparisonBarChartProps) {
  const datasets = entities.map((e, i) => {
    const m = metrics.find((x) => x.entityId === e.id);
    return {
      label: e.name,
      data: OA_CATEGORIES.map((cat) => m?.oaDistribution[cat] ?? 0),
      backgroundColor: ENTITY_COLORS[i % ENTITY_COLORS.length],
      borderRadius: 4,
    };
  });

  return (
    <Bar
      data={{ labels: OA_CATEGORIES, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "top" as const },
          tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      }}
    />
  );
}
