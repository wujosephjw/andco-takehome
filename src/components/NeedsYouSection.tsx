import type { Request } from "@/lib/types";
import { resolveLabelFor } from "@/lib/nextAction";
import { StatusBadge } from "./StatusBadge";
import { DueLabel } from "./DueLabel";
import { AssigneeChip } from "./Avatar";
import { Button } from "./Button";
import { CategoryIcon, Check } from "./icons";

function AttentionCard({
  request,
  onResolve,
  onFollowUp,
  onOpen,
}: {
  request: Request;
  onResolve: (id: string) => void;
  onFollowUp: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div
      className="rounded-lg border border-needs-border bg-surface p-4 shadow-card"
      style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-needs-accent)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(request.id)}
          className="group min-w-0 text-left"
        >
          <span className="flex items-center gap-2">
            <CategoryIcon category={request.category} className="size-4 shrink-0 text-ink-faint" />
            <span className="truncate text-row font-medium text-ink group-hover:underline">
              {request.documentType}
            </span>
          </span>
          <span className="block truncate text-meta text-ink-muted">{request.source}</span>
        </button>
        <StatusBadge status={request.status} />
      </div>

      {request.attentionReason && (
        <p className="mt-3 text-body text-ink">{request.attentionReason}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-meta text-ink-faint">
          <DueLabel request={request} />
          <span aria-hidden>·</span>
          <AssigneeChip name={request.assignee} />
        </span>
        <span className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => onFollowUp(request.id)}>
            Follow up
          </Button>
          <Button onClick={() => onResolve(request.id)}>{resolveLabelFor(request)}</Button>
        </span>
      </div>
    </div>
  );
}

/** The pinned triage zone. Elevated by structure + one warm rule, not saturation. */
export function NeedsYouSection({
  requests,
  onResolve,
  onFollowUp,
  onOpen,
}: {
  requests: Request[];
  onResolve: (id: string) => void;
  onFollowUp: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <section aria-label="Needs you">
      <header className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-section text-ink">Needs you</h2>
        {requests.length > 0 && (
          <span className="rounded-full bg-needs-bg px-2 py-0.5 text-badge font-medium text-needs-text">
            {requests.length}
          </span>
        )}
      </header>

      {requests.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-surface px-4 py-3.5 text-subhead font-display text-sage-ink">
          <Check className="size-5 text-sage" />
          Nothing needs you right now.
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((r) => (
            <AttentionCard
              key={r.id}
              request={r}
              onResolve={onResolve}
              onFollowUp={onFollowUp}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </section>
  );
}
