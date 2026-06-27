import type { Request } from "@/lib/types";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";

/** Persistent right-hand detail column (desktop). Replaces the slide-in drawer. */
export function DetailPane({
  request,
  onClose,
  ...handlers
}: { request: Request | null; onClose: () => void } & DetailHandlers) {
  return (
    <aside className="hidden min-h-0 flex-col border-l border-white/60 bg-white/18 backdrop-blur-3xl lg:flex">
      {request ? (
        <RequestDetail request={request} onClose={onClose} {...handlers} />
      ) : (
        <div className="h-full" aria-hidden="true" />
      )}
    </aside>
  );
}
