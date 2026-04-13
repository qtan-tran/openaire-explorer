import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ComparisonEntity, ComparisonMetrics } from "@openaire-explorer/shared";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Filler
);

const ENTITY_COLORS = [
  "rgb(59, 130, 246)",
  "rgb(16, 185, 129)",
  "rgb(245, 158, 11)",
  "rgb(239, 68, 68)",
  "rgb(168, 85, 247)",
];

interface ComparisonLineChartProps {
  entities: ComparisonEntity[];
  metrics: ComparisonMetrics[];
}

export function ComparisonLineChart({ entities, metrics }: ComparisonLineChartProps) {
  const [normalized, setNormalized] = useState(false);

  // Collect all years across entities
  const allYears = Array.from(
    new Set(
      metrics.flatMap((m) => m.yearlyOutputs.map((y) => y.year))
    )
  ).sort();

  const datasets = entities.map((e, i) => {
    const m = metrics.find((x) => x.entityId === e.id);
    const yearMap = new Map(m?.yearlyOutputs.map((y) => [y.year, y.count]) ?? []);
    const counts = allYears.map((yr) => yearMap.get(yr) ?? 0);

    let data: number[];
    if (normalized) {
      const max = Math.max(...counts, 1);
      data = counts.map((c) => Math.round((c / max) * 100));
    } else {
      data = counts;
    }

    const color = ENTITY_COLORS[i % ENTITY_COLORS.length];
    return {
      label: e.name,
      data,
      borderColor: color,
      backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.1)"),
      fill: false,
      tension: 0.3,
      pointRadius: allYears.length > 20 ? 2 : 4,
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={normalized}
            onChange={(e) => setNormalized(e.target.checked)}
            className="rounded"
          />
          Normalize (% of peak)
        </label>
      </div>
      <Line
        data={{ labels: allYears.map(String), datasets }}
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
              ticks: {
                precision: 0,
                callback: normalized
                  ? (v) => `${v}%`
                  : undefined,
              },
            },
          },
        }}
      />
    </div>
  );
}
