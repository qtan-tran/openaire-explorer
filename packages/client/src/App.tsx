import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--text-h)" }}>
        OpenAIRE Explorer
      </h1>
      <p style={{ color: "var(--text)" }}>
        Search and compare open access research products, projects, and organisations.
      </p>
      <span
        className="px-3 py-1 text-sm rounded-full"
        style={{
          background: "var(--accent-bg)",
          color: "var(--accent)",
          border: "1px solid var(--accent-border)",
        }}
      >
        Coming soon
      </span>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
