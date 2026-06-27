import { useEffect, useRef, useState } from "react";
import type { Request } from "@/lib/types";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";

/**
 * Mobile/tablet detail: a slide-in overlay (hidden at lg+, where the persistent
 * DetailPane column takes over). Both are driven by the same selectedId.
 */
export function DetailDrawer({
  request,
  onClose,
  ...handlers
}: { request: Request | null; onClose: () => void } & DetailHandlers) {
  const open = request !== null;

  // Keep last content visible during the close transition.
  const [shown, setShown] = useState<Request | null>(request);
  if (request !== null && request !== shown) setShown(request);

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
        className={`absolute inset-0 bg-[rgba(26,24,20,0.28)] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={shown ? shown.documentType : "Request details"}
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-[440px] max-w-[92vw] flex-col bg-surface shadow-drawer outline-none transition-transform duration-200 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {shown && <RequestDetail request={shown} onClose={onClose} {...handlers} />}
      </div>
    </div>
  );
}
