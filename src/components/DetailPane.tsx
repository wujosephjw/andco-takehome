import type { Request } from "@/lib/types";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";
import { Inbox } from "./icons";

/** Persistent right-hand detail column (desktop). Replaces the slide-in drawer. */
export function DetailPane({
  request,
  ...handlers
}: { request: Request | null } & DetailHandlers) {
  return (
    <aside className="hidden min-h-0 flex-col border-l border-hairline bg-surface lg:flex">
      {request ? (
        <RequestDetail request={request} {...handlers} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <Inbox className="size-7 text-hairline-strong" />
          <p className="text-body text-ink-muted">Select a request to see its details, activity, and actions.</p>
        </div>
      )}
    </aside>
  );
}
