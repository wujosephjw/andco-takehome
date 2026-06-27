import { useState } from "react";
import type { Request } from "@/lib/types";
import { bucketForStatus } from "@/lib/bucket";
import { progress, isBlockedOnUs } from "@/lib/derive";
import { shortDate } from "@/lib/relativeTime";
import { resolveLabelFor } from "@/lib/nextAction";
import { StatusBadge } from "./StatusBadge";
import { CategoryTag } from "./CategoryTag";
import { DueLabel } from "./DueLabel";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { ActivityTimeline } from "./ActivityTimeline";
import { Close } from "./icons";

export interface DetailHandlers {
  onResolve: (id: string) => void;
  onMarkReceived: (id: string) => void;
  onFollowUp: (id: string) => void;
  onAddNote: (id: string, text: string) => void;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-label font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-1 text-body text-ink">{children}</dd>
    </div>
  );
}

function NoteComposer({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  };
  return (
    <div className="mt-6 border-t border-hairline pt-4">
      <label className="mb-2 block text-label font-semibold uppercase tracking-wide text-ink-muted">
        Add a note
      </label>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Log a call, a follow-up…"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-paper px-3 py-2 text-body text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <Button variant="ghost" onClick={submit} disabled={!text.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}

function Footer({
  request,
  onResolve,
  onMarkReceived,
  onFollowUp,
}: { request: Request } & Pick<DetailHandlers, "onResolve" | "onMarkReceived" | "onFollowUp">) {
  const bucket = bucketForStatus(request.status);
  const primary =
    bucket === "needs_you" ? (
      <Button className="flex-1" onClick={() => onResolve(request.id)}>
        {resolveLabelFor(request)}
      </Button>
    ) : bucket === "in_flight" ? (
      <Button className="flex-1" onClick={() => onMarkReceived(request.id)}>
        Mark received
      </Button>
    ) : null;

  const showFollow = bucket === "needs_you" || bucket === "in_flight" || bucket === "draft";
  if (!primary && !showFollow) return null;

  return (
    <div className="flex items-center gap-2 border-t border-hairline px-5 py-3.5">
      {showFollow && (
        <Button variant="ghost" className={primary ? "" : "flex-1"} onClick={() => onFollowUp(request.id)}>
          Follow up
        </Button>
      )}
      {primary}
    </div>
  );
}

/** The request detail body — shared by the desktop pane and the mobile drawer. */
export function RequestDetail({
  request,
  onClose,
  ...handlers
}: { request: Request; onClose?: () => void } & DetailHandlers) {
  const p = progress(request);
  const blocked = isBlockedOnUs(request);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={request.status} />
            <CategoryTag category={request.category} showLabel />
          </div>
          <h2 className="font-display text-subhead leading-snug text-ink">{request.documentType}</h2>
          <p className="mt-0.5 text-meta text-ink-muted">{request.source}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="-mr-1 rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <Close className="size-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Fact label="Requested">{shortDate(request.requestedAt)}</Fact>
          <Fact label="Due">
            <DueLabel request={request} />
          </Fact>
          <Fact label="Assignee">
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={request.assignee} />
              {request.assignee}
            </span>
          </Fact>
          <Fact label="Pages">
            {p.tracked ? `${p.received} / ${p.expected}` : <span className="text-ink-faint">Not tracked</span>}
          </Fact>
        </dl>

        {request.attentionReason && (
          <div
            className={`mt-5 rounded-md border p-3 ${
              blocked ? "border-needs-border bg-needs-bg/60" : "border-hairline bg-sunk/50"
            }`}
          >
            <p
              className={`text-label font-semibold uppercase tracking-wide ${
                blocked ? "text-needs-text" : "text-ink-muted"
              }`}
            >
              {blocked ? "Action required" : "Reason"}
            </p>
            <p className="mt-1 text-body text-ink">{request.attentionReason}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-label font-semibold uppercase tracking-wide text-ink-muted">Activity</p>
          <ActivityTimeline entries={request.activity} fallbackUpdatedAt={request.updatedAt} />
        </div>

        <NoteComposer onAdd={(t) => handlers.onAddNote(request.id, t)} />
      </div>

      <Footer
        request={request}
        onResolve={handlers.onResolve}
        onMarkReceived={handlers.onMarkReceived}
        onFollowUp={handlers.onFollowUp}
      />
    </div>
  );
}
