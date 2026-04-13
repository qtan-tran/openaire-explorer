import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { WIDGET_REGISTRY } from "../../lib/widget-registry";
import type { WidgetType } from "../../lib/widget-registry";

interface AddWidgetModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
}

export function AddWidgetModal({ open, onClose, onAdd }: AddWidgetModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  if (!open) return null;

  const widgets = Object.values(WIDGET_REGISTRY);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Add widget"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl flex flex-col max-h-[80vh]"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add widget</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Click a widget to add it to your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Widget grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {widgets.map((def) => (
              <button
                key={def.type}
                type="button"
                onClick={() => { onAdd(def.type); onClose(); }}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg-secondary/30 p-4 text-left hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden>
                  {def.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    {def.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {def.description}
                  </p>
                  <span className="mt-1.5 inline-block text-[10px] uppercase tracking-wider font-medium text-text-muted border border-border rounded px-1.5 py-0.5">
                    {def.defaultSize}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
