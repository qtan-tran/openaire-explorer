import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout";
import { PageHeader, Container } from "./components/layout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  Spinner,
  Tooltip,
} from "./components/ui";
import { Search } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

/** Kitchen-sink showcase of every UI component */
function HomePage() {
  return (
    <AppShell>
      <PageHeader
        title="OpenAIRE Explorer"
        description="Search and compare open access research products, projects, and organisations."
        actions={
          <Button size="sm" leftIcon={<Search className="h-3.5 w-3.5" />}>
            Quick search
          </Button>
        }
      />

      {/* Component showcase */}
      <section className="grid gap-6 md:grid-cols-2">

        {/* Badges */}
        <Card>
          <CardHeader><CardTitle>Open Access Badges</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="oa-gold">Gold</Badge>
              <Badge variant="oa-green">Green</Badge>
              <Badge variant="oa-hybrid">Hybrid</Badge>
              <Badge variant="oa-bronze">Bronze</Badge>
              <Badge variant="oa-closed">Closed</Badge>
              <Badge variant="success">Published</Badge>
              <Badge variant="warning">Embargo</Badge>
              <Badge variant="error">Retracted</Badge>
              <Badge>Default</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                label="Search publications"
                placeholder="e.g. climate change 2024"
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Input
                label="DOI"
                placeholder="10.1234/example"
                error="Invalid DOI format"
              />
              <Input
                label="ORCID"
                placeholder="0000-0000-0000-0000"
                hint="Your 16-digit ORCID identifier"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skeletons + Spinner */}
        <Card>
          <CardHeader><CardTitle>Loading States</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={40} />
                <Skeleton variant="text" lines={2} className="flex-1" />
              </div>
              <Skeleton variant="rect" height={80} />
              <div className="flex items-center gap-3">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hoverable card */}
        <Card hoverable>
          <CardHeader><CardTitle>Hoverable Card</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              This card lifts on hover — useful for result lists.
            </p>
          </CardContent>
        </Card>

        {/* Tooltip */}
        <Card>
          <CardHeader><CardTitle>Tooltip</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Tooltip content="Opens full record in OpenAIRE">
                <Button variant="secondary" size="sm">Hover me (top)</Button>
              </Tooltip>
              <Tooltip content="Filter by open access route" position="bottom">
                <Button variant="secondary" size="sm">Hover me (bottom)</Button>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

      </section>

      {/* Empty / Error states */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card noPadding>
          <EmptyState
            icon="🔍"
            title="No results found"
            description="Try adjusting your search terms or filters."
            action={{ label: "Clear filters", onClick: () => {} }}
          />
        </Card>
        <Card noPadding>
          <ErrorState
            description="Could not reach the OpenAIRE API. Check your connection."
            onRetry={() => {}}
          />
        </Card>
      </section>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="*"
            element={
              <AppShell>
                <Container>
                  <EmptyState
                    icon="🗺️"
                    title="Page not found"
                    description="The page you're looking for doesn't exist."
                  />
                </Container>
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
