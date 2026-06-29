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
      <dt className="text-meta font-medium text-ink-faint">{label}</dt>
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
    <div className="mt-6 border-t border-white/60 pt-4">
      <label className="mb-2 block text-meta font-medium text-ink-muted">
        Add a note
      </label>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Log a call, a follow-up..."
          className="liquid-control glass-focus h-10 min-w-0 flex-1 rounded-full border border-white/70 bg-glass-strong px-4 text-body text-ink shadow-rest placeholder:text-ink-faint focus-visible:outline-none"
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

  const showFollow = bucket === "needs_you" || bucket === "in_flight";
  if (!primary && !showFollow) return null;

  return (
    <div className="flex items-center gap-2 border-t border-white/60 bg-white/14 px-5 py-4 backdrop-blur-2xl">
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
      <div className="flex items-start justify-between gap-3 border-b border-white/60 bg-white/14 px-5 py-5 backdrop-blur-2xl">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={request.status} />
            <CategoryTag category={request.category} showLabel />
          </div>
          <h2 className="text-subhead font-medium leading-snug text-ink">{request.documentType}</h2>
          <p className="mt-0.5 text-meta text-ink-muted">{request.source}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="liquid-control -mr-1 rounded-full border border-transparent p-1 text-ink-muted hover:border-white/70 hover:bg-glass-strong hover:text-ink"
          >
            <Close className="size-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <dl className="liquid-surface grid grid-cols-2 gap-x-4 gap-y-4 rounded-[22px] border border-white/70 bg-white/42 p-4 shadow-rest">
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
            className={`liquid-surface mt-5 rounded-2xl border p-3 ${
              blocked ? "border-white/70 bg-white/54" : "border-white/60 bg-white/40"
            }`}
          >
            <p
              className={`text-meta font-medium ${
                blocked ? "text-ink" : "text-ink-muted"
              }`}
            >
              {blocked ? "Action required" : "Reason"}
            </p>
            <p className="mt-1 text-body text-ink">{request.attentionReason}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-meta font-medium text-ink-muted">Activity</p>
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
