import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { OADistributionData } from "../../hooks/useOADistribution";
import { OA_CATEGORIES, OA_COLORS, OA_LABELS } from "./oa-colors";

ChartJS.register(ArcElement, Tooltip, Legend);

// Indices 0=gold, 1=green, 2=hybrid are "open"
const OPEN_INDICES = new Set([0, 1, 2]);

/** Renders the OA rate percentage in the donut centre. */
const centerTextPlugin = {
  id: "oaCenterText",
  afterDraw(chart: ChartJS) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const raw = chart.data.datasets[0]?.data as number[] | undefined;
    if (!raw) return;

    const total = raw.reduce((s, v) => s + v, 0);
    const openTotal = raw.reduce(
      (s, v, i) => s + (OPEN_INDICES.has(i) ? v : 0),
      0
    );
    const rate = total > 0 ? openTotal / total : 0;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-foreground")
      .trim() || "#111827";
    ctx.fillText(`${(rate * 100).toFixed(0)}%`, cx, cy - 9);

    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("OA rate", cx, cy + 14);

    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

interface OADonutChartProps {
  data: OADistributionData;
}

export function OADonutChart({ data }: OADonutChartProps) {
  const counts = OA_CATEGORIES.map((c) => data.distribution[c]?.count ?? 0);
  const colors = OA_CATEGORIES.map((c) => OA_COLORS[c]);

  return (
    <Doughnut
      data={{
        labels: OA_CATEGORIES.map((c) => OA_LABELS[c]),
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.6)",
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        cutout: "68%",
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom" as const,
            labels: {
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const cat = OA_CATEGORIES[ctx.dataIndex];
                const entry = data.distribution[cat];
                return ` ${OA_LABELS[cat]}: ${entry.count.toLocaleString()} (${entry.percentage}%)`;
              },
            },
          },
        },
      }}
    />
  );
}
