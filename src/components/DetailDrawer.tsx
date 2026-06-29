import { useEffect, useRef, useState } from "react";
import type { Case, Request } from "@/lib/types";
import { DraftRequestForm } from "./DraftRequestForm";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";

function useDrawerViewport() {
  const [isDrawerViewport, setIsDrawerViewport] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsDrawerViewport(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isDrawerViewport;
}

function detailLabel(request: Request): string {
  return request.documentType.trim() || "Untitled request";
}

/**
 * Mobile/tablet detail: a slide-in overlay (hidden at lg+, where the persistent
 * DetailPane column takes over). Both are driven by the same selectedId.
 */
export function DetailDrawer({
  caseData,
  request,
  composingDraft,
  onClose,
  ...handlers
}: {
  caseData: Case;
  request: Request | null;
  composingDraft: boolean;
  onClose: () => void;
} & DetailHandlers) {
  const isDrawerViewport = useDrawerViewport();
  const draftRequest = request?.status === "draft" ? request : null;
  const showDraft = composingDraft || draftRequest !== null;
  const contentKey = showDraft ? (draftRequest?.id ?? "new-draft") : request?.id;
  const current =
    contentKey === undefined
      ? null
      : showDraft
        ? { kind: "draft" as const, key: contentKey, request: draftRequest }
        : { kind: "request" as const, key: contentKey, request };
  const open = current !== null && isDrawerViewport;

  // Keep last content visible during the close transition.
  const [shown, setShown] = useState<{
    kind: "draft" | "request";
    key: string;
    request: Request | null;
  } | null>(current);
  if (
    current !== null &&
    (shown === null ||
      current.key !== shown.key ||
      current.kind !== shown.kind ||
      current.request !== shown.request)
  ) {
    setShown(current);
  }

  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    panel?.focus();
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panel) {
        const f = panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocus.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[rgba(17,17,17,0.2)] backdrop-blur-sm transition-opacity duration-300 ease-out ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={
          shown?.kind === "draft"
            ? "Draft request"
            : shown?.request
              ? detailLabel(shown.request)
              : "Request details"
        }
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-[440px] max-w-[92vw] flex-col border-l border-white/60 bg-glass-strong shadow-drawer backdrop-blur-2xl outline-none transition-transform duration-500 ease-[var(--ease-liquid)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {shown?.kind === "draft" ? (
          <DraftRequestForm
            key={shown.request?.id ?? "new-draft"}
            request={shown.request}
            caseData={caseData}
            onCancel={onClose}
            onAutosaveDraft={handlers.onAutosaveDraft}
            onDeleteDraft={handlers.onDeleteDraft}
            onSubmitDraft={handlers.onSubmitDraft}
          />
        ) : shown?.request ? (
          <RequestDetail request={shown.request} onClose={onClose} {...handlers} />
        ) : null}
      </div>
    </div>
  );
}
