import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { WidgetType, WidgetSize } from "../lib/widget-registry";
import { WIDGET_REGISTRY } from "../lib/widget-registry";
import type { OADistributionFilters } from "../hooks/useOADistribution";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardPanel {
  id: string;
  widgetType: WidgetType;
  size: WidgetSize;
}

interface DashboardContextValue {
  panels: DashboardPanel[];
  filters: OADistributionFilters;
  addPanel: (widgetType: WidgetType) => void;
  removePanel: (id: string) => void;
  updatePanelSize: (id: string, size: WidgetSize) => void;
  resetLayout: () => void;
  setFilters: (f: OADistributionFilters) => void;
}

// ─── Default layout ───────────────────────────────────────────────────────────

const DEFAULT_PANELS: DashboardPanel[] = [
  { id: "default-stats",      widgetType: "stat-card",        size: "small"  },
  { id: "default-donut",      widgetType: "oa-donut",         size: "medium" },
  { id: "default-trends",     widgetType: "trends-line",      size: "large"  },
  { id: "default-growth",     widgetType: "growth-rate",      size: "medium" },
  { id: "default-cumulative", widgetType: "trends-cumulative", size: "medium" },
  { id: "default-network",    widgetType: "network-graph",    size: "large"  },
  { id: "default-topnodes",   widgetType: "top-nodes",        size: "medium" },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_PANELS_KEY  = "openaire-dashboard-panels";
const LS_FILTERS_KEY = "openaire-dashboard-filters";

function loadPanels(): DashboardPanel[] {
  try {
    const raw = localStorage.getItem(LS_PANELS_KEY);
    if (!raw) return DEFAULT_PANELS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PANELS;
    // Validate that each panel has required fields and known widget types
    const valid = (parsed as DashboardPanel[]).filter(
      (p) =>
        typeof p.id === "string" &&
        typeof p.widgetType === "string" &&
        p.widgetType in WIDGET_REGISTRY &&
        typeof p.size === "string"
    );
    return valid.length > 0 ? valid : DEFAULT_PANELS;
  } catch {
    return DEFAULT_PANELS;
  }
}

function savePanels(panels: DashboardPanel[]) {
  try {
    localStorage.setItem(LS_PANELS_KEY, JSON.stringify(panels));
  } catch {
    // storage quota exceeded — ignore
  }
}

function loadFilters(): OADistributionFilters {
  try {
    const raw = localStorage.getItem(LS_FILTERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OADistributionFilters;
  } catch {
    return {};
  }
}

function saveFilters(filters: OADistributionFilters) {
  try {
    localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextValue | null>(null);

function generateId(): string {
  return `panel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels]   = useState<DashboardPanel[]>(() => loadPanels());
  const [filters, setFiltersState] = useState<OADistributionFilters>(() => loadFilters());

  // Persist panels whenever they change
  useEffect(() => { savePanels(panels); }, [panels]);

  // Persist filters whenever they change
  useEffect(() => { saveFilters(filters); }, [filters]);

  const addPanel = useCallback((widgetType: WidgetType) => {
    const def = WIDGET_REGISTRY[widgetType];
    setPanels((prev) => [
      ...prev,
      { id: generateId(), widgetType, size: def.defaultSize },
    ]);
  }, []);

  const removePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePanelSize = useCallback((id: string, size: WidgetSize) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, size } : p))
    );
  }, []);

  const resetLayout = useCallback(() => {
    setPanels(DEFAULT_PANELS);
  }, []);

  const setFilters = useCallback((f: OADistributionFilters) => {
    setFiltersState(f);
  }, []);

  return (
    <DashboardContext.Provider
      value={{ panels, filters, addPanel, removePanel, updatePanelSize, resetLayout, setFilters }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
