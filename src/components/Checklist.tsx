import { useEffect, useRef, useState } from "react";
import type { Request, Bucket, Case, Category, Status } from "@/lib/types";
import type { FilterSpec, SortKey, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { resolveLabelFor } from "@/lib/nextAction";
import { categoryLabel, rawStatusLabel } from "@/lib/tokens";
import { StatusDot } from "./StatusDot";
import { DueLabel } from "./DueLabel";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ProgressMeter } from "./ProgressMeter";
import { Check, ChevronDown } from "./icons";

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
};

/** Lead identity. Many docs share a prefix ("Medical Records — …"); the part
 *  after the separator is what tells them apart, so the prefix recedes to faint
 *  and the tail keeps full ink — the eye lands on what's actually different. */
function DocTitle({ r, className }: { r: Request; className?: string }) {
  const sep = " — ";
  const at = r.documentType.indexOf(sep);
  const prefix = at === -1 ? "" : r.documentType.slice(0, at + sep.length);
  const tail = at === -1 ? r.documentType : r.documentType.slice(at + sep.length);
  return (
    <span className={`truncate font-medium text-ink ${className ?? ""}`}>
      {prefix && <span className="text-ink-faint">{prefix}</span>}
      {tail}
    </span>
  );
}

/** Category as a quiet tag in the right meta cluster, paired with the date. It's
 *  a slicing dimension, so it rides next to urgency instead of competing with the
 *  document title on the left. */
function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-white/45 bg-white/35 px-2 py-0.5 text-meta text-ink-muted">
      {categoryLabel[category]}
    </span>
  );
}

/** Statuses whose word would just echo the section header, so the grouping
 *  already says it: `in_progress` under "In progress", `received` under
 *  "Collected", `draft`/`canceled` under their own sections. Every other status
 *  (requested, partial, needs-action, rejected, on-hold) is a distinct sub-state
 *  worth surfacing. Relies on items always being rendered grouped by bucket. */
const STATUS_ECHOES_SECTION = new Set<Status>([
  "in_progress",
  "received",
  "draft",
  "canceled",
]);

/** The quiet line under a title, state-first: the raw status leads in a legible
 *  weight so every item's state reads at a glance ("think in states"), then the
 *  source, then a page meter when partial. The status word is dropped only where
 *  it would just echo the section header. Category isn't here — it rides in the
 *  right meta cluster next to the date. */
function SupportLine({ r }: { r: Request }) {
  const showStatus = !STATUS_ECHOES_SECTION.has(r.status);
  return (
    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-meta text-ink-faint">
      {showStatus && (
        <>
          <span className="shrink-0 font-medium text-ink-muted">{rawStatusLabel[r.status]}</span>
          <span className="shrink-0" aria-hidden="true">·</span>
        </>
      )}
      <span className="truncate text-ink-muted">{r.source}</span>
      <ProgressMeter request={r} />
    </span>
  );
}

/* ── Action-needed card (needs_you) ───────────────────────────────── */
function ActionCard({ r, selectedId, onOpen, onResolve }: { r: Request } & RowHandlers) {
  const selected = r.id === selectedId;
  const dimmed = selectedId !== null && !selected;
  return (
    <article
      className={`liquid-surface relative flex min-w-0 flex-col rounded-[22px] border p-4 shadow-card ${
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
        aria-label={`Open details for ${r.documentType}`}
        className="absolute inset-0 z-10 rounded-[inherit] text-left focus-visible:outline-none"
      />
      <div className="pointer-events-none relative z-20 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <DocTitle r={r} className="block text-row" />
          <SupportLine r={r} />
        </div>
      </div>

      {r.attentionReason && (
        <p className="pointer-events-none relative z-20 mt-3 rounded-2xl border border-white/45 bg-white/30 px-3 py-2 text-body text-ink-muted">
          {r.attentionReason}
        </p>
      )}

      <div className="relative z-20 mt-auto flex flex-wrap items-center justify-between gap-3 pt-3.5">
        <span className="pointer-events-none flex items-center gap-2.5">
          <CategoryTag category={r.category} />
          <DueLabel request={r} />
        </span>
        <span className="relative z-30 flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => onResolve(r.id)}>{resolveLabelFor(r)}</Button>
        </span>
      </div>
    </article>
  );
}

/* ── In-progress / draft row ──────────────────────────────────────── */
function RequestRow({ r, selectedId, onOpen }: { r: Request } & Pick<RowHandlers, "selectedId" | "onOpen">) {
  const selected = r.id === selectedId;
  const dimmed = selectedId !== null && !selected;
  return (
    <button
      type="button"
      onClick={() => onOpen(r.id)}
      className={`liquid-row flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left ${
        selected
          ? "bg-white/74 shadow-rest"
          : dimmed
            ? "opacity-65 hover:text-ink hover:opacity-100"
            : "hover:text-ink"
      }`}
    >
      <span className="min-w-0 flex-1">
        <DocTitle r={r} className="block text-row" />
        <SupportLine r={r} />
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <CategoryTag category={r.category} />
        <span className="w-[112px] text-right">
          <DueLabel request={r} />
        </span>
      </span>
    </button>
  );
}

/* ── Collected chip (done) ────────────────────────────────────────── */
function CollectedChip({ r, selectedId, onOpen }: { r: Request } & Pick<RowHandlers, "selectedId" | "onOpen">) {
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
  return (
    <section className="min-w-0">
      <header className="mb-3 flex items-center gap-2.5 px-1">
        <StatusDot bucket={bucket} />
        <h2 className="text-body font-medium text-ink">{label}</h2>
        <span className="liquid-control rounded-full border border-white/70 bg-glass-strong px-2 py-0.5 text-badge font-medium text-ink-muted shadow-rest">
          {items.length}
        </span>
        <span className="h-px flex-1 bg-hairline" />
        {hint && <span className="text-meta text-ink-faint">{hint}</span>}
      </header>

      {bucket === "needs_you" ? (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {items.map((r) => (
            <ActionCard key={r.id} r={r} {...handlers} />
          ))}
        </div>
      ) : bucket === "done" ? (
        <div className="flex flex-wrap gap-2.5">
          {items.map((r) => (
            <CollectedChip key={r.id} r={r} selectedId={handlers.selectedId} onOpen={handlers.onOpen} />
          ))}
        </div>
      ) : (
        <div className="liquid-surface divide-y divide-hairline overflow-hidden rounded-[22px] border border-white/42 bg-white/30 shadow-rest">
          {items.map((r) => (
            <RequestRow key={r.id} r={r} selectedId={handlers.selectedId} onOpen={handlers.onOpen} />
          ))}
        </div>
      )}
    </section>
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
            onClick={() =>
              onSetFilter({
                bucket: b,
                includeCanceled: b === "closed" ? true : false,
              })
            }
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

function OverviewStrip({ counts }: { counts: OverviewCounts }) {
  const items = [
    { label: "Requests", value: counts.total, className: "text-ink" },
    { label: "Needs you", value: counts.needsYou, className: counts.needsYou ? "text-ink" : "text-ink-muted" },
    { label: "Overdue", value: counts.overdue, className: counts.overdue ? "text-overdue" : "text-ink-muted" },
    { label: "Collected", value: counts.done, className: "text-ink-muted" },
  ];

  return (
    <div
      aria-label="Case request overview"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="liquid-control rounded-2xl border border-white/65 bg-glass-strong px-3 py-2 shadow-rest"
        >
          <div className={`text-count font-medium tabular-nums ${item.className}`}>
            {item.value}
          </div>
          <div className="text-label font-medium text-ink-faint">{item.label}</div>
        </div>
      ))}
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
      <span className="text-ink-faint">Sort</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="liquid-control glass-focus inline-flex h-9 min-w-[132px] flex-1 items-center justify-between gap-3 rounded-full border border-white/75 bg-glass-strong px-3 text-left text-meta font-medium text-ink shadow-rest hover:bg-white/76 focus-visible:outline-none sm:flex-none"
      >
        <span>{selected.label}</span>
        <ChevronDown className={`size-3.5 text-ink-faint transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
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
                className={`liquid-row flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-meta ${
                  active
                    ? "bg-white/70 font-medium text-ink shadow-rest focus-visible:outline-none"
                    : "text-ink-muted hover:bg-white/60 hover:text-ink focus-visible:outline-none"
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
        <OverviewStrip counts={counts} />
        <MobilePills filter={filter} counts={counts} onSetFilter={onSetFilter} />
      </div>

      {/* Body */}
      <div className="min-h-0 min-w-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-6">
        {noData ? (
          <EmptyState variant="no-data" />
        ) : filteredEmpty ? (
          <EmptyState variant="filtered" onClearFilters={() => onSetFilter({ bucket: null, category: null })} />
        ) : (
          groups.map((g) => <GroupSection key={g.bucket} group={g} handlers={handlers} />)
        )}
      </div>
    </section>
  );
}
