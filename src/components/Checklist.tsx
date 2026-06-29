"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Request, Bucket, Case } from "@/lib/types";
import type { FilterSpec, SortKey, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { bucketFilter } from "@/lib/filter";
import { resolveLabelFor } from "@/lib/nextAction";
import { rawStatusLabel } from "@/lib/tokens";
import { StatusDot } from "./StatusDot";
import { CategoryPill } from "./CategoryPill";
import { DueLabel } from "./DueLabel";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Check, ChevronDown, Close } from "./icons";

export interface Group {
  bucket: Bucket;
  label: string;
  hint?: string;
  items: Request[];
}

type RowHandlers = {
  selectedId: string | null;
  onOpen: (id: string) => void;
  onResolve: (id: string) => void;
  onFollowUp: (id: string) => void;
  onDeleteDraft: (id: string) => void;
};

// Enter/exit is opacity + a whisper of scale only — never size/height. Survivors
// reflow purely on the compositor via Motion's `layout="position"`, so the blurred
// glass is never re-rasterized and the whole move reads as one spring. popLayout
// pulls a leaving item out of flow instantly, so the gap closes while it fades —
// no two-beat.
const ENTER = { opacity: 0, scale: 0.96 };
const SHOWN = { opacity: 1, scale: 1 };

function displayDocumentType(r: Request): string {
  return r.documentType.trim() || "Untitled request";
}

function displaySource(r: Request): string {
  return r.source.trim() || "No source yet";
}

/** Lead identity. Many docs share a prefix ("Medical Records — …"); the part
 *  after the separator is what tells them apart, so the prefix recedes to faint
 *  and the tail keeps full ink — the eye lands on what's actually different. */
function DocTitle({ r, className }: { r: Request; className?: string }) {
  const sep = " — ";
  const title = displayDocumentType(r);
  const at = title.indexOf(sep);
  const prefix = at === -1 ? "" : title.slice(0, at + sep.length);
  const tail = at === -1 ? title : title.slice(at + sep.length);
  return (
    <span className={`truncate font-medium text-ink ${className ?? ""}`}>
      {prefix && <span className="text-ink-faint">{prefix}</span>}
      {tail}
    </span>
  );
}

/** The quiet line under a title, state-first: the raw status leads in a legible
 *  weight so every item's state reads at a glance ("think in states"), then the
 *  source. Category isn't here — it rides in the right meta cluster next to the
 *  date. */
function SupportLine({ r }: { r: Request }) {
  return (
    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-meta text-ink-faint">
      <span className="shrink-0 font-medium italic text-ink-muted">{rawStatusLabel[r.status]}</span>
      <span className="shrink-0" aria-hidden="true">·</span>
      <span className="truncate text-ink-muted">{displaySource(r)}</span>
    </span>
  );
}

/* ── Action-needed card (needs_you) ───────────────────────────────── */
function ActionCard({ r, selectedId, onOpen, onResolve }: { r: Request } & RowHandlers) {
  const selected = r.id === selectedId;
  const dimmed = selectedId !== null && !selected;
  return (
    <article
      className={`liquid-surface flex h-full min-w-0 flex-col rounded-[22px] border p-4 shadow-card ${
        selected
          ? "border-white/90 bg-white/90"
          : dimmed
            ? "border-white/70 bg-white/64 opacity-65 hover:border-white/90 hover:bg-white/74 hover:opacity-100"
            : "border-white/70 bg-white/64 hover:border-white/90 hover:bg-white/74"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(r.id)}
        className="min-w-0 cursor-pointer text-left focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <DocTitle r={r} className="block text-row" />
            <SupportLine r={r} />
          </div>
        </div>

        {r.attentionReason && (
          <p className="mt-3 rounded-2xl border border-white/45 bg-white/30 px-3 py-2 text-body text-ink-muted">
            {r.attentionReason}
          </p>
        )}
      </button>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3.5">
        <span className="flex items-center gap-2.5">
          <CategoryPill category={r.category} />
          <DueLabel request={r} />
        </span>
        <span className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onOpen(r.id);
              onResolve(r.id);
            }}
          >
            {resolveLabelFor(r)}
          </Button>
        </span>
      </div>
    </article>
  );
}

/* ── In-progress / draft / canceled row ───────────────────────────── */
function RequestRow({
  r,
  selectedId,
  onOpen,
  onDelete,
}: { r: Request; onDelete?: (id: string) => void } & Pick<RowHandlers, "selectedId" | "onOpen">) {
  const selected = r.id === selectedId;
  const dimmed = selectedId !== null && !selected;
  const stateClass = selected
    ? "bg-white/74 shadow-rest"
    : dimmed
      ? "opacity-65 hover:text-ink hover:opacity-100"
      : "hover:text-ink";

  const body = (
    <>
      <span className="min-w-0 flex-1">
        <DocTitle r={r} className="block text-row" />
        <SupportLine r={r} />
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <CategoryPill category={r.category} />
        <span className="w-[112px] text-right">
          <DueLabel request={r} />
        </span>
      </span>
    </>
  );

  // Plain navigable row (in-progress, canceled) — a single button.
  if (!onDelete) {
    return (
      <button
        type="button"
        onClick={() => onOpen(r.id)}
        className={`liquid-row flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left ${stateClass}`}
      >
        {body}
      </button>
    );
  }

  // Draft row: the main body and delete action are sibling buttons. pr-12
  // reserves the gutter so the × never overlaps the meta, and reveal causes no
  // layout shift.
  return (
    <div
      className={`liquid-row group relative min-h-16 w-full text-left ${stateClass}`}
    >
      <button
        type="button"
        onClick={() => onOpen(r.id)}
        className="flex min-h-16 w-full cursor-pointer items-center gap-3 py-3 pl-4 pr-12 text-left focus-visible:outline-none"
      >
        {body}
      </button>
      <button
        type="button"
        aria-label="Delete draft"
        onClick={() => onDelete(r.id)}
        className="liquid-control absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-transparent p-1 text-ink-faint opacity-0 transition hover:border-overdue/35 hover:bg-white/62 hover:text-overdue focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Close className="size-4" />
      </button>
    </div>
  );
}

/* ── Collected chip (done) ────────────────────────────────────────── */
function CollectedChip({
  r,
  selectedId,
  onOpen,
}: { r: Request } & Pick<RowHandlers, "selectedId" | "onOpen">) {
  const selected = r.id === selectedId;
  const dimmed = selectedId !== null && !selected;
  return (
    <button
      type="button"
      onClick={() => onOpen(r.id)}
      className={`liquid-row inline-flex items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-3 shadow-rest ${
        selected
          ? "border-white/80 bg-white/80"
          : dimmed
            ? "border-white/55 bg-glass-strong opacity-65 hover:border-white/78 hover:bg-white/64 hover:opacity-100"
            : "border-white/55 bg-glass-strong hover:border-white/78 hover:bg-white/64"
      }`}
    >
      <DocTitle r={r} className="min-w-0 text-meta" />
    </button>
  );
}

/* ── A group section ──────────────────────────────────────────────── */
function GroupSection({ group, handlers }: { group: Group; handlers: RowHandlers }) {
  const { bucket, label, hint, items } = group;

  // The list shell differs per bucket; the per-item Motion wrapper is shared.
  const containerClass =
    bucket === "needs_you"
      ? "relative grid min-w-0 gap-3 sm:grid-cols-2"
      : bucket === "done"
        ? "relative flex flex-wrap gap-2.5"
        : "liquid-surface relative divide-y divide-hairline overflow-hidden rounded-[22px] border border-white/42 bg-white/30 shadow-rest";

  return (
    <motion.section layout="position" className="min-w-0">
      <header className="mb-3 flex items-center gap-2.5 px-1">
        <StatusDot bucket={bucket} />
        <h2 className="text-body font-medium text-ink">{label}</h2>
        <span className="liquid-control rounded-full border border-white/70 bg-glass-strong px-2 py-0.5 text-badge font-medium text-ink-muted shadow-rest">
          {items.length}
        </span>
        <span className="h-px flex-1 bg-hairline" />
        {hint && <span className="text-meta text-ink-faint">{hint}</span>}
      </header>

      <div className={containerClass}>
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((r) => (
            <motion.div
              key={r.id}
              layout="position"
              initial={ENTER}
              animate={SHOWN}
              exit={ENTER}
              className={bucket === "needs_you" ? "min-w-0" : bucket === "done" ? "inline-flex" : ""}
            >
              {bucket === "needs_you" ? (
                <ActionCard r={r} {...handlers} />
              ) : bucket === "done" ? (
                <CollectedChip r={r} selectedId={handlers.selectedId} onOpen={handlers.onOpen} />
              ) : (
                <RequestRow
                  r={r}
                  selectedId={handlers.selectedId}
                  onOpen={handlers.onOpen}
                  onDelete={bucket === "draft" ? handlers.onDeleteDraft : undefined}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ── Mobile filter pills (lg:hidden) ──────────────────────────────── */
const MOBILE_BUCKETS: (Bucket | null)[] = [null, "needs_you", "in_flight", "done", "draft", "closed"];
function MobilePills({
  filter,
  counts,
  onSetFilter,
}: {
  filter: FilterSpec;
  counts: OverviewCounts;
  onSetFilter: (p: Partial<FilterSpec>) => void;
}) {
  return (
    <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
      {MOBILE_BUCKETS.filter((b) => b !== "closed" || counts.byBucket.closed > 0).map((b) => {
        const active = filter.bucket === b;
        const count = b ? counts.byBucket[b] : counts.total;
        return (
          <button
            key={b ?? "all"}
            type="button"
            onClick={() => onSetFilter(bucketFilter(b))}
            className={`liquid-control inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-meta font-medium shadow-rest ${
              active ? "border-white/80 bg-white/70 text-ink" : "border-white/55 bg-glass-strong text-ink-muted hover:bg-white/62"
            }`}
          >
            {b && <StatusDot bucket={b} />}
            {b ? BUCKET_LABEL[b] : "All"}
            <span className="text-[11px] text-ink-faint">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "urgency", label: "Urgency" },
  { key: "due", label: "Due date" },
  { key: "updated", label: "Last updated" },
];

function SortMenu({
  sort,
  onSetSort,
}: {
  sort: SortKey;
  onSetSort: (s: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  useEffect(() => {
    if (!open) return;

    function closeFromOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative z-50 flex w-full items-center gap-2 text-meta text-ink-muted sm:w-auto sm:shrink-0">
      <span className="font-medium text-ink-muted">Sort</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="liquid-control glass-focus inline-flex h-9 min-w-[142px] flex-1 items-center justify-between gap-3 rounded-full border border-white/85 bg-white/68 px-3.5 text-left text-meta font-semibold text-ink shadow-rest hover:bg-white/78 sm:flex-none"
      >
        <span>{selected.label}</span>
        <ChevronDown className={`size-3.5 text-ink-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Sort requests"
          className="liquid-popover absolute right-0 top-[calc(100%+0.5rem)] z-[100] min-w-[168px] overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-lift"
        >
          {SORTS.map((s) => {
            const active = s.key === sort;
            return (
              <button
                key={s.key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSetSort(s.key);
                  setOpen(false);
                }}
                className={`liquid-row flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-body ${
                  active
                    ? "bg-white/64 font-medium text-ink shadow-rest ring-1 ring-white/60 focus-visible:outline-none"
                    : "text-ink-muted hover:bg-white/55 hover:text-ink focus-visible:outline-none"
                }`}
              >
                {s.label}
                {active && <Check className="size-3.5 text-ink-muted" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Checklist({
  caseData,
  groups,
  filter,
  counts,
  sort,
  onSetSort,
  onSetFilter,
  onNewRequest,
  noData,
  filteredEmpty,
  ...handlers
}: {
  caseData: Case;
  groups: Group[];
  filter: FilterSpec;
  counts: OverviewCounts;
  sort: SortKey;
  onSetSort: (s: SortKey) => void;
  onSetFilter: (p: Partial<FilterSpec>) => void;
  onNewRequest: () => void;
  noData: boolean;
  filteredEmpty: boolean;
} & RowHandlers) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-transparent">
      {/* Panel header */}
      <div className="relative z-20 flex min-w-0 flex-col gap-3 border-b border-white/60 bg-white/16 px-5 py-5 backdrop-blur-2xl sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-meta text-ink-faint lg:hidden">{caseData.clientName}</p>
            <h2 className="truncate text-section font-medium text-ink lg:text-subhead">
              <span className="lg:hidden">{caseData.matterName}</span>
              <span className="hidden lg:inline">Document checklist</span>
            </h2>
          </div>
          <SortMenu sort={sort} onSetSort={onSetSort} />
        </div>
        <MobilePills filter={filter} counts={counts} onSetFilter={onSetFilter} />
      </div>

      {/* Body — layoutScroll lets Motion measure positions correctly under scroll */}
      <motion.div layoutScroll className="min-h-0 min-w-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-6">
        {noData ? (
          <EmptyState variant="no-data" onNewRequest={onNewRequest} />
        ) : filteredEmpty ? (
          <EmptyState variant="filtered" onClearFilters={() => onSetFilter({ ...bucketFilter(null), category: null })} />
        ) : (
          <AnimatePresence initial={false}>
            {groups.map((g) => (
              <GroupSection key={g.bucket} group={g} handlers={handlers} />
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </section>
  );
}
