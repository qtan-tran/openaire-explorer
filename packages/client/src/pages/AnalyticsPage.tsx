import { useState } from "react";
import { LayoutDashboard, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Container } from "../components/layout/Container";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { DashboardProvider, useDashboard } from "../contexts/DashboardContext";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";
import { WidgetPanel } from "../components/dashboard/WidgetPanel";
import { AddWidgetModal } from "../components/dashboard/AddWidgetModal";
import { DashboardFilters } from "../components/dashboard/DashboardFilters";
import type { WidgetType, WidgetSize } from "../lib/widget-registry";

// ─── Inner page (needs DashboardContext) ─────────────────────────────────────

function DashboardContent() {
  const { panels, filters, addPanel, removePanel, updatePanelSize, resetLayout } =
    useDashboard();
  const [showModal, setShowModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (confirmReset) {
      resetLayout();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }

  function handleAddWidget(type: WidgetType) {
    addPanel(type);
    setShowModal(false);
  }

  function handleSizeChange(id: string, size: WidgetSize) {
    updatePanelSize(id, size);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text-muted">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-sm">
            {panels.length} widget{panels.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={handleReset}
            className={confirmReset ? "text-error border-error hover:bg-error/10" : ""}
          >
            {confirmReset ? "Click again to confirm" : "Reset layout"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setShowModal(true)}
          >
            Add widget
          </Button>
        </div>
      </div>

      {/* Global filters */}
      <DashboardFilters />

      {/* Grid */}
      {panels.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No widgets yet"
          description="Add widgets to start exploring your data."
          action={{ label: "Add widget", onClick: () => setShowModal(true) }}
        />
      ) : (
        <DashboardGrid>
          {panels.map((panel) => (
            <WidgetPanel
              key={panel.id}
              panel={panel}
              filters={filters}
              onRemove={removePanel}
              onSizeChange={handleSizeChange}
            />
          ))}
        </DashboardGrid>
      )}

      {/* Add widget modal */}
      <AddWidgetModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddWidget}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  return (
    <AppShell>
      <Container>
        <div className="flex flex-col gap-6 py-6">
          <PageHeader
            title="Analytics Dashboard"
            description="Add, remove, and rearrange widgets to explore open access patterns."
          />
          <DashboardProvider>
            <DashboardContent />
          </DashboardProvider>
        </div>
      </Container>
    </AppShell>
  );
}
