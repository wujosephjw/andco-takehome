import { useEffect } from "react";
import { Undo } from "./icons";

export interface ToastState {
  id: number; // changes per action, so the timer + drain bar restart
  label: string;
}

export function UndoToast({
  toast,
  onUndo,
  onDismiss,
}: {
  toast: ToastState | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        key={toast.id}
        className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-full bg-ink py-2.5 pl-4 pr-3 shadow-toast"
      >
        <span className="text-meta text-surface/85">{toast.label}</span>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center gap-1 rounded-full px-2 text-meta font-semibold text-sage-onfill hover:bg-white/10"
        >
          <Undo className="size-3.5" /> Undo
        </button>
        <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-drain bg-white/50" />
      </div>
    </div>
  );
}
