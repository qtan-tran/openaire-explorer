import { AppShell } from "../components/layout/AppShell";
import { Container } from "../components/layout/Container";
import {
  Activity,
  AlertCircle,
  Code2,
  Database,
  Github,
  Lightbulb,
  LineChart,
  Scale,
  Settings,
  ShieldCheck,
  Target,
  User,
} from "lucide-react";

export function AboutPage() {
  const metrics = [
    {
      metric: "OA Distribution",
      method:
        "Aggregates openAccessColor, isGreen, and best-access-right metadata by year and entity subset.",
      limits:
        "Depends on completeness and consistency of upstream access-right annotations.",
    },
    {
      metric: "Comparison Profiles",
      method:
        "Normalises selected entities into shared indicators (outputs, OA rates, yearly trajectories, citation class distribution).",
      limits:
        "Not a causal or quality ranking; reflects metadata heterogeneity and domain norms.",
    },
    {
      metric: "Network Analytics",
      method:
        "Builds co-relation graphs from available links, computes topological summaries (degree, components, density).",
      limits:
        "Sensitive to missing links and entity disambiguation quality.",
    },
  ];

  const stack = [
    { label: "Next.js", sub: "React frontend" },
    { label: "Prisma", sub: "Data layer" },
    { label: "Tailwind CSS", sub: "Design system" },
    { label: "TypeScript", sub: "Type contracts" },
    { label: "Express", sub: "API routes" },
    { label: "OpenAIRE", sub: "Graph API" },
  ];

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        .about-root {
          font-family: 'DM Sans', sans-serif;
          color: var(--foreground);
        }

        .serif { font-family: 'Lora', Georgia, serif; }
        .mono  { font-family: 'DM Mono', monospace; }

        /* ── HERO ─────────────────────────────────────────────────── */
        .hero {
          position: relative;
          padding: 5rem 0 4rem;
          border-bottom: 1px solid var(--border);
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 55% at 80% 20%, color-mix(in srgb, var(--accent) 6%, transparent), transparent),
            radial-gradient(ellipse 40% 40% at 10% 90%, color-mix(in srgb, var(--accent) 4%, transparent), transparent);
          pointer-events: none;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 1.75rem;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.7;
        }
        .hero-title {
          font-size: clamp(2rem, 4.5vw, 3.25rem);
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: -0.02em;
          max-width: 820px;
          margin-bottom: 1.5rem;
        }
        .hero-title em {
          font-style: italic;
          font-weight: 400;
          color: var(--text-secondary);
        }
        .hero-lead {
          max-width: 600px;
          font-size: 1rem;
          line-height: 1.8;
          font-weight: 300;
          color: var(--text-secondary);
        }
        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.85rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--background);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--foreground);
        }

        /* ── SECTION SHELL ─────────────────────────────────────────── */
        .section { padding: 3.5rem 0; border-bottom: 1px solid var(--border); }
        .section:last-child { border-bottom: none; }
        .section-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 0.75rem;
        }
        .section-label svg { opacity: 0.6; }
        .section-heading {
          font-size: 1.6rem;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin-bottom: 1.75rem;
        }

        /* ── WHY / HOW CARDS ───────────────────────────────────────── */
        .why-how-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 1rem;
          overflow: hidden;
        }
        @media (max-width: 640px) { .why-how-grid { grid-template-columns: 1fr; } }
        .why-how-card {
          background: var(--background);
          padding: 1.75rem;
        }
        .why-how-card-label {
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.6rem;
        }
        .why-how-card p {
          font-size: 0.9rem;
          line-height: 1.75;
          font-weight: 300;
          color: var(--text-secondary);
        }

        /* ── SOURCE CARDS ──────────────────────────────────────────── */
        .source-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        @media (max-width: 640px) { .source-grid { grid-template-columns: 1fr; } }
        .source-card {
          border: 1px solid var(--border);
          border-radius: 0.875rem;
          padding: 1.5rem;
          background: var(--background);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: box-shadow 0.2s;
        }
        .source-card:hover { box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 8%, transparent); }
        .source-icon {
          width: 2.25rem; height: 2.25rem;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .source-card-title { font-size: 0.95rem; font-weight: 600; }
        .source-card-desc { font-size: 0.85rem; line-height: 1.7; font-weight: 300; color: var(--text-secondary); flex: 1; }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 500;
          width: fit-content;
        }
        .badge-green { background: color-mix(in srgb,#10b981 10%,transparent); color:#059669; border:1px solid color-mix(in srgb,#10b981 25%,transparent); }
        .badge-blue  { background: color-mix(in srgb,#3b82f6 10%,transparent); color:#2563eb; border:1px solid color-mix(in srgb,#3b82f6 25%,transparent); }

        /* ── METRICS TABLE ─────────────────────────────────────────── */
        .metrics-wrap {
          border: 1px solid var(--border);
          border-radius: 0.875rem;
          overflow: hidden;
          overflow-x: auto;
        }
        .metrics-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 680px;
        }
        .metrics-table thead th {
          padding: 0.85rem 1.25rem;
          text-align: left;
          font-size: 0.65rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary, color-mix(in srgb, var(--background) 60%, var(--border)));
          border-bottom: 1px solid var(--border);
        }
        .metrics-table tbody tr { border-bottom: 1px solid var(--border); }
        .metrics-table tbody tr:last-child { border-bottom: none; }
        .metrics-table tbody tr:hover { background: color-mix(in srgb, var(--accent) 3%, transparent); }
        .metrics-table td { padding: 1rem 1.25rem; vertical-align: top; line-height: 1.7; }
        .metrics-table td:first-child { font-weight: 500; white-space: nowrap; }
        .metrics-table td:not(:first-child) { color: var(--text-secondary); font-weight: 300; }

        /* ── TECH STACK ────────────────────────────────────────────── */
        .stack-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 640px) { .stack-grid { grid-template-columns: repeat(2,1fr); } }
        .stack-item {
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--background);
        }
        .stack-item-label { font-size: 0.9rem; font-weight: 600; }
        .stack-item-sub { font-size: 0.75rem; font-weight: 300; color: var(--text-muted); margin-top: 0.1rem; }

        /* ── LIMITATIONS ───────────────────────────────────────────── */
        .limitations-box {
          border: 1px solid color-mix(in srgb,#f59e0b 30%,var(--border));
          border-radius: 0.875rem;
          padding: 1.75rem;
          background: color-mix(in srgb,#f59e0b 3%,var(--background));
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .limitations-box p {
          font-size: 0.9rem;
          line-height: 1.8;
          font-weight: 300;
          color: var(--text-secondary);
          max-width: 680px;
        }
        .limitations-box strong { font-weight: 600; color: var(--foreground); }

        /* ── ATTRIBUTION ───────────────────────────────────────────── */
        .attribution-section { padding-top: 3.5rem; }
        .attribution-name { font-weight: 600; }
        .citation-box {
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: var(--background);
          margin: 1.25rem 0;
        }
        .citation-ref {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.7;
          color: var(--foreground);
        }
        .citation-ref em { font-style: italic; }
        .citation-url {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: var(--accent);
          text-decoration: none;
          display: block;
          margin-top: 0.5rem;
          opacity: 0.85;
          transition: opacity 0.15s;
        }
        .citation-url:hover { opacity: 1; }
        .gh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--background);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--foreground);
          text-decoration: none;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .gh-btn:hover {
          background: var(--bg-secondary, color-mix(in srgb, var(--background) 60%, var(--border)));
          box-shadow: 0 2px 8px color-mix(in srgb,#000 8%,transparent);
        }

        .divider {
          height: 1px;
          background: var(--border);
          margin: 0;
        }
      `}</style>

      <Container>
        <div className="about-root mx-auto w-full max-w-4xl">

          {/* ── HERO ── */}
          <div className="hero">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              OpenAIRE Explorer
              <span style={{ margin: "0 0.25rem", opacity: 0.3 }}>·</span>
              About
            </div>
            <h1 className="hero-title serif">
              Beyond metadata: <em>transparent</em> research metrics<br />for open science.
            </h1>
            <p className="hero-lead">
              OpenAIRE Explorer makes research indicators inspectable,
              contestable, and reproducible for scholars, institutions,
              and policy communities.
            </p>
            <div className="pill-row">
              <span className="pill"><Activity style={{ width: 12, height: 12, opacity: 0.6 }} /> Open Source</span>
              <span className="pill"><ShieldCheck style={{ width: 12, height: 12, opacity: 0.6 }} /> CC0 Data</span>
              <span className="pill"><Scale style={{ width: 12, height: 12, opacity: 0.6 }} /> Methodology-Transparent</span>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          <div className="section">
            <div className="section-label">
              <Lightbulb style={{ width: 13, height: 13 }} />
              Project Overview
            </div>
            <h2 className="section-heading serif">Why this exists</h2>
            <div className="why-how-grid">
              <div className="why-how-card">
                <div className="why-how-card-label">Why</div>
                <p>
                  Open research metadata is abundant, but interpretation is
                  fragmented. We bring discovery, comparison, and analytics
                  into one coherent interface.
                </p>
              </div>
              <div className="why-how-card">
                <div className="why-how-card-label">How</div>
                <p>
                  API-backed search, side-by-side entity comparison, and
                  configurable analytics widgets — built open-source for
                  full transparency and reuse.
                </p>
              </div>
            </div>
          </div>

          {/* ── DATA SOURCES ── */}
          <div className="section">
            <div className="section-label">
              <Database style={{ width: 13, height: 13 }} />
              Data Sources &amp; Provenance
            </div>
            <h2 className="section-heading serif">Where the data comes from</h2>
            <div className="source-grid">
              <div className="source-card">
                <div className="source-icon" style={{ background: "color-mix(in srgb,#3b82f6 12%,transparent)" }}>
                  <Database style={{ width: 18, height: 18, color: "#3b82f6" }} />
                </div>
                <div>
                  <div className="source-card-title">OpenAIRE Graph API</div>
                  <p className="source-card-desc">
                    Primary source for publications, organisations, projects,
                    and access-right metadata.
                  </p>
                </div>
                <span className="badge badge-green"><Scale style={{ width: 10, height: 10 }} /> CC0</span>
              </div>
              <div className="source-card">
                <div className="source-icon" style={{ background: "color-mix(in srgb,#a855f7 12%,transparent)" }}>
                  <LineChart style={{ width: 18, height: 18, color: "#a855f7" }} />
                </div>
                <div>
                  <div className="source-card-title">Metrics Layer</div>
                  <p className="source-card-desc">
                    Application-level aggregations with explicit methodological
                    documentation.
                  </p>
                </div>
                <span className="badge badge-blue"><ShieldCheck style={{ width: 10, height: 10 }} /> CC0-compatible</span>
              </div>
            </div>
          </div>

          {/* ── METRICS TABLE ── */}
          <div className="section">
            <div className="section-label">
              <Activity style={{ width: 13, height: 13 }} />
              Metric Methodology
            </div>
            <h2 className="section-heading serif">How indicators are built</h2>
            <div className="metrics-wrap">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Metric</th>
                    <th style={{ width: "45%" }}>Method</th>
                    <th style={{ width: "35%" }}>Limitations</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row) => (
                    <tr key={row.metric}>
                      <td>{row.metric}</td>
                      <td>{row.method}</td>
                      <td>{row.limits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TECH STACK ── */}
          <div className="section">
            <div className="section-label">
              <Code2 style={{ width: 13, height: 13 }} />
              Technical Architecture
            </div>
            <h2 className="section-heading serif">What it's built with</h2>
            <div className="stack-grid">
              {stack.map((s) => (
                <div className="stack-item" key={s.label}>
                  <div className="stack-item-label">{s.label}</div>
                  <div className="stack-item-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LIMITATIONS ── */}
          <div className="section">
            <div className="section-label">
              <AlertCircle style={{ width: 13, height: 13 }} />
              Limitations &amp; Integrity
            </div>
            <h2 className="section-heading serif">What this tool is — and isn't</h2>
            <div className="limitations-box">
              <p>
                This project prioritises <strong>transparency over certainty</strong>.
                Metrics are analytical instruments built from evolving metadata,
                not definitive judgments of research quality, impact, or social value.
              </p>
              <p>
                Upstream coverage gaps, classification drift, and API constraints
                can affect result stability. Always interpret with domain expertise
                and triangulate with other sources.
              </p>
            </div>
          </div>

          {/* ── ATTRIBUTION ── */}
          <div className="attribution-section">
            <div className="section-label">
              <User style={{ width: 13, height: 13 }} />
              Attribution &amp; Citation
            </div>
            <h2 className="section-heading serif">Cite this work</h2>
            <p style={{ fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.8, color: "var(--text-secondary)", maxWidth: 520 }}>
              Created and maintained by{" "}
              <span className="attribution-name">Quoc-Tan Tran</span>,
              Faculty of Sociology, Bielefeld University.
            </p>
            <div className="citation-box">
              <div className="citation-ref">
                Tran, Q.-T. (2026). <em>Beyond Metadata: Decoding Open Research</em> with OpenAIRE Explorer.
              </div>
              <a
                href="https://github.com/qtan-tran/openaire-explorer"
                className="citation-url"
              >
                github.com/qtan-tran/openaire-explorer
              </a>
            </div>
            <a
              href="https://github.com/qtan-tran/openaire-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="gh-btn"
            >
              <Github style={{ width: 15, height: 15 }} />
              View Repository
            </a>
          </div>

        </div>
      </Container>
    </AppShell>
  );
}
