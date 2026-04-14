import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { CumulativeEntry } from "../../hooks/useTrendsData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const TYPE_COLORS = {
  publications: { border: "rgb(59, 130, 246)",  fill: "rgba(59, 130, 246, 0.25)" },
  datasets:     { border: "rgb(16, 185, 129)",  fill: "rgba(16, 185, 129, 0.25)" },
  software:     { border: "rgb(245, 158, 11)",  fill: "rgba(245, 158, 11, 0.25)" },
  other:        { border: "rgb(156, 163, 175)", fill: "rgba(156, 163, 175, 0.2)" },
};

interface CumulativeAreaChartProps {
  data: CumulativeEntry[];
}

export function CumulativeAreaChart({ data }: CumulativeAreaChartProps) {
  const labels = data.map((e) => e.period);

  const datasets = (
    Object.entries(TYPE_COLORS) as [keyof typeof TYPE_COLORS, (typeof TYPE_COLORS)[keyof typeof TYPE_COLORS]][]
  ).map(([key, colors]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    data: data.map((e) => e[key]),
    borderColor: colors.border,
    backgroundColor: colors.fill,
    fill: true,
    tension: 0.35,
    pointRadius: labels.length > 20 ? 0 : 3,
    pointHoverRadius: 5,
  }));

  return (
    <div className="relative h-[300px]">
    <Line
      data={{ labels, datasets }}
      options={{
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top" as const,
            labels: { usePointStyle: true, pointStyleWidth: 10, padding: 14 },
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const total = items.reduce((s, i) => s + (i.raw as number), 0);
                return `Total: ${total.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: "rgba(128,128,128,0.1)" },
          },
        },
      }}
    />
    </div>
  );
}
