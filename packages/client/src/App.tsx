import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout";
import { Container, PageHeader } from "./components/layout";
import { EmptyState } from "./components/ui";
import { SearchPage } from "./pages/SearchPage";
import { ResearchProductDetailPage } from "./pages/ResearchProductDetailPage";
import { OrganizationDetailPage } from "./pages/OrganizationDetailPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ComparePage } from "./pages/ComparePage";
import { ComparisonProvider } from "./contexts/ComparisonContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

/** Placeholder for pages not yet built */
function ComingSoon({ title }: { title: string }) {
  return (
    <AppShell>
      <PageHeader title={title} />
      <Container>
        <EmptyState
          icon="🚧"
          title="Coming soon"
          description="This page is under construction."
        />
      </Container>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ComparisonProvider>
          <Routes>
            {/* Main search — both / and /search point here */}
            <Route path="/" element={<SearchPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Entity detail pages */}
            <Route path="/entity/product/:id" element={<ResearchProductDetailPage />} />
            <Route path="/entity/organization/:id" element={<OrganizationDetailPage />} />
            <Route path="/entity/project/:id" element={<ProjectDetailPage />} />

            {/* Compare */}
            <Route path="/compare" element={<ComparePage />} />

            {/* Analytics (placeholder) */}
            <Route
              path="/analytics"
              element={<ComingSoon title="Analytics" />}
            />

            {/* Redirect any unknown path to search */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ComparisonProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
