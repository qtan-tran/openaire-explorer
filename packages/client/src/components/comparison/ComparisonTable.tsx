import type { ReactNode } from "react";
import clsx from "clsx";
import type { ComparisonEntity, ComparisonMetrics } from "@openaire-explorer/shared";

interface ComparisonTableProps {
  entities: ComparisonEntity[];
  metrics: ComparisonMetrics[];
}

function OABar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-right text-xs font-semibold">
        {(rate * 100).toFixed(0)}%
      </span>
      <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-oa-green rounded-full transition-all"
          style={{ width: `${Math.min(rate * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function topCitationClass(profile: ComparisonMetrics["citationProfile"]): string {
  const order = [
    { label: "C1", count: profile.c1 },
    { label: "C2", count: profile.c2 },
    { label: "C3", count: profile.c3 },
    { label: "C4", count: profile.c4 },
    { label: "C5", count: profile.c5 },
  ];
  const top = order.find((c) => c.count > 0);
  return top ? `${top.label} (${top.count})` : "—";
}

export function ComparisonTable({ entities, metrics }: ComparisonTableProps) {
  const rowDefs: {
    label: string;
    render: (m: ComparisonMetrics) => ReactNode;
  }[] = [
    {
      label: "Total outputs",
      render: (m) => (
        <span className="font-semibold">
          {m.totalOutputs.toLocaleString()}
        </span>
      ),
    },
    {
      label: "OA rate",
      render: (m) => <OABar rate={m.oaRate} />,
    },
    {
      label: "Publications",
      render: (m) => m.outputsByType.publications.toLocaleString(),
    },
    {
      label: "Datasets",
      render: (m) => m.outputsByType.datasets.toLocaleString(),
    },
    {
      label: "Software",
      render: (m) => m.outputsByType.software.toLocaleString(),
    },
    {
      label: "Top citation class",
      render: (m) => topCitationClass(m.citationProfile),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-secondary">
            <th className="py-3 px-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-36 shrink-0">
              Metric
            </th>
            {entities.map((e) => (
              <th
                key={e.id}
                className="py-3 px-4 text-left text-xs font-semibold text-foreground min-w-[180px]"
              >
                <span className="block truncate max-w-[220px]">{e.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowDefs.map((row, i) => (
            <tr
              key={row.label}
              className={clsx(
                "border-b border-border last:border-0",
                i % 2 === 0 ? "bg-background" : "bg-bg-secondary/30"
              )}
            >
              <td className="py-3 px-4 text-text-muted font-medium whitespace-nowrap">
                {row.label}
              </td>
              {entities.map((e) => {
                const m = metrics.find((x) => x.entityId === e.id);
                return (
                  <td key={e.id} className="py-3 px-4 text-foreground">
                    {m ? row.render(m) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
