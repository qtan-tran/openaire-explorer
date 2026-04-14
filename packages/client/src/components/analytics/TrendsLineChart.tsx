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
import type { TimeSeriesEntry, MovingAverageEntry } from "../../hooks/useTrendsData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export type TrendsMetric = "totalOutputs" | "publications" | "datasets" | "software";

const METRIC_LABELS: Record<TrendsMetric, string> = {
  totalOutputs: "Total outputs",
  publications: "Publications",
  datasets: "Datasets",
  software: "Software",
};

const METRIC_COLOR = "rgb(59, 130, 246)"; // blue
const OA_COLOR    = "rgb(34, 197, 94)";   // green
const MA3_COLOR   = "rgba(249, 115, 22, 0.9)"; // orange
const MA5_COLOR   = "rgba(168, 85, 247, 0.9)"; // purple

interface TrendsLineChartProps {
  series: TimeSeriesEntry[];
  movingAverages: MovingAverageEntry[];
  metric: TrendsMetric;
  showOARate: boolean;
  showMA: boolean;
}

export function TrendsLineChart({
  series,
  movingAverages,
  metric,
  showOARate,
  showMA,
}: TrendsLineChartProps) {
  const labels = series.map((e) => e.period);
  const primaryData = series.map((e) => e[metric]);

  const datasets = [
    {
      label: METRIC_LABELS[metric],
      data: primaryData,
      borderColor: METRIC_COLOR,
      backgroundColor: METRIC_COLOR.replace("rgb", "rgba").replace(")", ", 0.1)"),
      fill: true,
      tension: 0.3,
      pointRadius: labels.length > 20 ? 2 : 4,
      pointHoverRadius: 6,
      yAxisID: "y",
    },
  ];

  if (showOARate) {
    datasets.push({
      label: "OA rate (%)",
      data: series.map((e) => Math.round(e.oaRate * 1000) / 10) as number[],
      borderColor: OA_COLOR,
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      pointRadius: labels.length > 20 ? 2 : 3,
      pointHoverRadius: 5,
      yAxisID: "y2",
    } as Parameters<typeof datasets.push>[0]);
  }

  if (showMA) {
    datasets.push(
      {
        label: "3-period MA",
        data: movingAverages.map((m) => m.ma3) as number[],
        borderColor: MA3_COLOR,
        backgroundColor: "transparent",
        borderDash: [5, 3],
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: "y",
      } as Parameters<typeof datasets.push>[0],
      {
        label: "5-period MA",
        data: movingAverages.map((m) => m.ma5) as number[],
        borderColor: MA5_COLOR,
        backgroundColor: "transparent",
        borderDash: [8, 4],
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: "y",
      } as Parameters<typeof datasets.push>[0]
    );
  }

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
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: "rgba(128,128,128,0.1)" },
          },
          ...(showOARate
            ? {
                y2: {
                  position: "right" as const,
                  min: 0,
                  max: 100,
                  ticks: { callback: (v: string | number) => `${v}%` },
                  grid: { display: false },
                },
              }
            : {}),
        },
      }}
    />
    </div>
  );
}
