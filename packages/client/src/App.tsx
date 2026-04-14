import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { Spinner } from "./components/ui/Spinner";

// ─── Lazy page components ─────────────────────────────────────────────────────
// Each page becomes a separate Vite chunk — verify in the Network tab on first
// navigation to that route.

const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage }))
);
const ResearchProductDetailPage = lazy(() =>
  import("./pages/ResearchProductDetailPage").then((m) => ({
    default: m.ResearchProductDetailPage,
  }))
);
const OrganizationDetailPage = lazy(() =>
  import("./pages/OrganizationDetailPage").then((m) => ({
    default: m.OrganizationDetailPage,
  }))
);
const ProjectDetailPage = lazy(() =>
  import("./pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  }))
);
const ComparePage = lazy(() =>
  import("./pages/ComparePage").then((m) => ({ default: m.ComparePage }))
);
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage }))
);

// ─── Route loading fallback ───────────────────────────────────────────────────

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="md" />
    </div>
  );
}

// ─── Query client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ComparisonProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Main search */}
              <Route path="/"       element={<SearchPage />} />
              <Route path="/search" element={<SearchPage />} />

              {/* Entity detail pages */}
              <Route path="/entity/product/:id"      element={<ResearchProductDetailPage />} />
              <Route path="/entity/organization/:id" element={<OrganizationDetailPage />} />
              <Route path="/entity/project/:id"      element={<ProjectDetailPage />} />

              {/* Compare */}
              <Route path="/compare" element={<ComparePage />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ComparisonProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
