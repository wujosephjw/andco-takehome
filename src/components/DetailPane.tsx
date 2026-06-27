import type { Request } from "@/lib/types";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";
import { Inbox } from "./icons";

/** Persistent right-hand detail column (desktop). Replaces the slide-in drawer. */
export function DetailPane({
  request,
  ...handlers
}: { request: Request | null } & DetailHandlers) {
  return (
    <aside className="hidden min-h-0 flex-col border-l border-white/60 bg-white/18 backdrop-blur-3xl lg:flex">
      {request ? (
        <RequestDetail request={request} {...handlers} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="liquid-control grid size-12 place-items-center rounded-full border border-white/70 bg-glass-strong shadow-rest">
            <Inbox className="size-6 text-ink-faint" />
          </span>
          <p className="text-body text-ink-muted">Select a request to see its details, activity, and actions.</p>
        </div>
      )}
    </aside>
  );
}
