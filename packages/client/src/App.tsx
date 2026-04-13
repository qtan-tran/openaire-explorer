import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout";
import { Container, PageHeader } from "./components/layout";
import { EmptyState } from "./components/ui";
import { SearchPage } from "./pages/SearchPage";

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
        <Routes>
          {/* Main search — both / and /search point here */}
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Entity detail (placeholder) */}
          <Route
            path="/entity/:type/:id"
            element={<ComingSoon title="Entity Detail" />}
          />

          {/* Compare (placeholder) */}
          <Route
            path="/compare"
            element={<ComingSoon title="Compare Entities" />}
          />

          {/* Analytics (placeholder) */}
          <Route
            path="/analytics"
            element={<ComingSoon title="Analytics" />}
          />

          {/* Redirect any unknown path to search */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
