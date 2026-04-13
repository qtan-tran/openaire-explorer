import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { OADistributionData } from "../../hooks/useOADistribution";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface OARateTrendChartProps {
  data: OADistributionData;
}

export function OARateTrendChart({ data }: OARateTrendChartProps) {
  const years = data.oaRateByYear.map((r) => String(r.year));
  const rates = data.oaRateByYear.map((r) => Math.round(r.rate * 1000) / 10);

  // Dashed 50% reference annotation via dataset
  const refLine = years.map(() => 50);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.datasetIndex === 0
              ? ` OA rate: ${ctx.raw}%`
              : ` Reference: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: "rgba(128,128,128,0.1)" },
      },
    },
  };

  return (
    <Line
      data={{
        labels: years,
        datasets: [
          {
            label: "OA rate",
            data: rates,
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: years.length > 15 ? 2 : 4,
            pointHoverRadius: 6,
          },
          {
            label: "50% reference",
            data: refLine,
            borderColor: "rgba(156, 163, 175, 0.6)",
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
        ],
      }}
      options={options}
    />
  );
}
