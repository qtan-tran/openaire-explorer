import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { ComparisonEntity, ComparisonMetrics } from "@openaire-explorer/shared";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip);

const ENTITY_COLORS = [
  { border: "rgba(59, 130, 246, 0.9)", fill: "rgba(59, 130, 246, 0.15)" },
  { border: "rgba(16, 185, 129, 0.9)", fill: "rgba(16, 185, 129, 0.15)" },
  { border: "rgba(245, 158, 11, 0.9)", fill: "rgba(245, 158, 11, 0.15)" },
  { border: "rgba(239, 68, 68, 0.9)", fill: "rgba(239, 68, 68, 0.15)" },
  { border: "rgba(168, 85, 247, 0.9)", fill: "rgba(168, 85, 247, 0.15)" },
];

const AXES = [
  "OA rate",
  "Volume (norm.)",
  "Dataset ratio",
  "Citation quality",
];

/** Average citation class score: C1=5, C2=4, ... C5=1, unclassified=0 */
function citationScore(profile: ComparisonMetrics["citationProfile"], total: number): number {
  if (total === 0) return 0;
  const weighted =
    profile.c1 * 5 +
    profile.c2 * 4 +
    profile.c3 * 3 +
    profile.c4 * 2 +
    profile.c5 * 1;
  return weighted / total / 5; // normalise to 0-1
}

interface ComparisonRadarChartProps {
  entities: ComparisonEntity[];
  metrics: ComparisonMetrics[];
}

export function ComparisonRadarChart({ entities, metrics }: ComparisonRadarChartProps) {
  const maxOutputs = Math.max(...metrics.map((m) => m.totalOutputs), 1);

  const datasets = entities.map((e, i) => {
    const m = metrics.find((x) => x.entityId === e.id);
    if (!m) return { label: e.name, data: [0, 0, 0, 0], ...ENTITY_COLORS[i % ENTITY_COLORS.length] };

    const datasetTotal = m.totalOutputs;
    const datasetRatio =
      datasetTotal > 0 ? m.outputsByType.datasets / datasetTotal : 0;

    const data = [
      m.oaRate,
      m.totalOutputs / maxOutputs,
      datasetRatio,
      citationScore(m.citationProfile, m.totalOutputs),
    ].map((v) => Math.round(v * 100));

    const colors = ENTITY_COLORS[i % ENTITY_COLORS.length];
    return {
      label: e.name,
      data,
      borderColor: colors.border,
      backgroundColor: colors.fill,
      fill: true,
      pointRadius: 4,
    };
  });

  return (
    <Radar
      data={{ labels: AXES, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, callback: (v) => `${v}%` },
            grid: { color: "rgba(128,128,128,0.15)" },
          },
        },
        plugins: {
          legend: { position: "top" as const },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
            },
          },
        },
      }}
    />
  );
}
