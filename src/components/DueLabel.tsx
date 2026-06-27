import type { Request } from "@/lib/types";
import { daysOverdue, isOverdue } from "@/lib/derive";
import { shortDate } from "@/lib/relativeTime";

/** Overdue recolors the due cell only — never the whole row (that would shout). */
export function DueLabel({ request }: { request: Request }) {
  if (request.dueAt === null) {
    return <span className="text-meta text-ink-faint">—</span>;
  }
  if (isOverdue(request)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-meta font-medium text-overdue">
        <span className="size-1.5 shrink-0 rounded-full bg-overdue-dot" aria-hidden />
        {daysOverdue(request)}d overdue
      </span>
    );
  }
  return <span className="text-meta text-ink-muted">Due {shortDate(request.dueAt)}</span>;
}
