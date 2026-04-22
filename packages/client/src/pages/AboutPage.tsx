import { AppShell } from "../components/layout/AppShell";
import { Container } from "../components/layout/Container";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export function AboutPage() {
  return (
    <AppShell>
      <Container>
        <div className="flex flex-col gap-6 py-6">
          <PageHeader
            title="About OpenAIRE Explorer"
            description="A research intelligence dashboard for exploring, comparing, and analysing open-access scholarship."
          />

          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary leading-6">
              <p>
                OpenAIRE Explorer helps researchers and decision-makers discover and interpret
                publications, organisations, and projects from the OpenAIRE Graph.
              </p>
              <p>
                The interface combines search, side-by-side comparison, and analytics widgets
                so users can move from exploration to evidence-based insights in one workflow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary leading-6">
              <p>
                The client is a React + Vite single-page application with route-level code
                splitting and TanStack Query for server-state management.
              </p>
              <p>
                The backend is an Express + TypeScript API that normalises OpenAIRE responses,
                enforces request validation, and exposes endpoints for search, comparison,
                and analytics.
              </p>
              <p>
                The project uses npm workspaces in a monorepo (`client`, `server`, and `shared`)
                to keep types and contracts consistent across the stack.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitations and Caveats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary leading-6">
              <p>
                Data coverage and freshness depend on the OpenAIRE Graph API, so temporary
                inconsistencies or delays in upstream indexing may appear in results.
              </p>
              <p>
                Some metrics and visualisations are derived from available metadata and should be
                interpreted as analytical aids rather than definitive bibliometric evaluations.
              </p>
              <p>
                The API includes rate limiting and caching; very high-volume or highly specific
                queries may require retries or narrower filters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attribution and Citation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary leading-6">
              <p>
                OpenAIRE Explorer was created and is maintained by Quoc-Tan Tran, Open Science
                Researcher at the Faculty of Sociology, Bielefeld University, with technical
                assistance from Claude AI.
              </p>
              <p>Suggested APA citation:</p>
              <blockquote className="rounded-lg border border-border bg-bg-secondary p-3 text-foreground">
                Tran, Q.-T. (2026). OpenAIRE Explorer: Intelligence dashboard for exploring,
                comparing, and analysing open-access publications. GitHub.
                https://github.com/qtan-tran/openaire-explorer
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </Container>
    </AppShell>
  );
}
