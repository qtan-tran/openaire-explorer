import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.tsx";
import { reportWebVitals } from "./lib/web-vitals.ts";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Report Core Web Vitals — logs to console in dev, sends to /api/analytics/vitals in prod
reportWebVitals();
