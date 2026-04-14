import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { TimeSeriesEntry } from "../../hooks/useTrendsData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface GrowthRateChartProps {
  series: TimeSeriesEntry[];
}

export function GrowthRateChart({ series }: GrowthRateChartProps) {
  // Only include periods with a growth rate
  const filtered = series.filter((e) => e.growthRate !== null);
  const labels = filtered.map((e) => e.period);
  const rates = filtered.map((e) => Math.round((e.growthRate as number) * 1000) / 10);

  const backgroundColors = rates.map((r) =>
    r >= 0 ? "rgba(34, 197, 94, 0.75)" : "rgba(239, 68, 68, 0.75)"
  );
  const borderColors = rates.map((r) =>
    r >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
  );

  return (
    <div className="relative h-[280px]">
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "YoY growth rate",
            data: rates,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1.5,
            borderRadius: 4,
          },
        ],
      }}
      options={{
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${(ctx.raw as number) >= 0 ? "+" : ""}${ctx.raw}%`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: (v) => `${v}%` },
            grid: { color: "rgba(128,128,128,0.1)" },
            // Draw a visible zero line
            border: { display: false },
          },
        },
      }}
    />
    </div>
  );
}
