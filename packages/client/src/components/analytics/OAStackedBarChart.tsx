import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { OADistributionData } from "../../hooks/useOADistribution";
import { OA_CATEGORIES, OA_COLORS, OA_LABELS } from "./oa-colors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface OAStackedBarChartProps {
  data: OADistributionData;
}

export function OAStackedBarChart({ data }: OAStackedBarChartProps) {
  const [normalized, setNormalized] = useState(false);

  const years = data.byYear.map((r) => String(r.year));

  const datasets = OA_CATEGORIES.map((cat) => ({
    label: OA_LABELS[cat],
    data: data.byYear.map((row) => {
      const raw = row[cat];
      if (!normalized) return raw;
      const rowTotal =
        row.gold + row.green + row.hybrid + row.bronze + row.closed + row.unknown;
      return rowTotal > 0 ? Math.round((raw / rowTotal) * 100) : 0;
    }),
    backgroundColor: OA_COLORS[cat],
    stack: "oa",
    borderWidth: 0,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={normalized}
            onChange={(e) => setNormalized(e.target.checked)}
            className="rounded"
          />
          100% stacked
        </label>
      </div>

      <div className="relative h-[280px]">
      <Bar
        data={{ labels: years, datasets }}
        options={{
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
              labels: { usePointStyle: true, pointStyleWidth: 10, padding: 12 },
            },
            tooltip: {
              mode: "index" as const,
              intersect: false,
              callbacks: {
                label: (ctx) =>
                  normalized
                    ? ` ${ctx.dataset.label}: ${ctx.raw}%`
                    : ` ${ctx.dataset.label}: ${(ctx.raw as number).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                precision: 0,
                callback: normalized ? (v) => `${v}%` : undefined,
              },
              max: normalized ? 100 : undefined,
            },
          },
        }}
      />
      </div>
    </div>
  );
}
