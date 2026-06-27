import type { Request, Bucket, Case } from "@/lib/types";
import type { FilterSpec, SortKey, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { resolveLabelFor } from "@/lib/nextAction";
import { StatusDot } from "./StatusDot";
import { CategoryPill } from "./CategoryPill";
import { DueLabel } from "./DueLabel";
import { AssigneeChip } from "./Avatar";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Check } from "./icons";

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

/* ── Action-needed card (needs_you) ───────────────────────────────── */
function ActionCard({ r, selectedId, onOpen, onResolve, onFollowUp }: { r: Request } & RowHandlers) {
  const selected = r.id === selectedId;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(r.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(r.id))}
      className={`liquid-surface min-w-0 cursor-pointer rounded-[22px] border border-white/75 bg-glass-strong p-4 shadow-card hover:border-white/90 hover:bg-white/82 ${
        selected ? "bg-white/84 shadow-lift ring-1 ring-brand/65" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <StatusDot bucket="needs_you" className="mt-1" />
          <div className="min-w-0">
            <div className="truncate text-row font-medium text-ink">{r.documentType}</div>
            <div className="truncate text-meta text-ink-muted">{r.source}</div>
          </div>
        </div>
        <CategoryPill category={r.category} />
      </div>

      {r.attentionReason && (
        <p className="mt-3 rounded-2xl border border-white/60 bg-white/42 px-3 py-2 text-body text-ink-muted">
          {r.attentionReason}
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-meta text-ink-faint">
          <DueLabel request={r} />
          <span aria-hidden>·</span>
          <AssigneeChip name={r.assignee} />
        </span>
        <span className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={(e) => (e.stopPropagation(), onFollowUp(r.id))}>
            Follow up
          </Button>
          <Button variant="secondary" onClick={(e) => (e.stopPropagation(), onResolve(r.id))}>{resolveLabelFor(r)}</Button>
        </span>
      </div>
    </div>
  );
}

/* ── In-progress / draft row ──────────────────────────────────────── */
function RequestRow({ r, bucket, selectedId, onOpen }: { r: Request; bucket: Bucket } & Pick<RowHandlers, "selectedId" | "onOpen">) {
  const selected = r.id === selectedId;
  return (
    <button
      type="button"
      onClick={() => onOpen(r.id)}
      className={`liquid-row flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left ${
        selected ? "bg-white/82 shadow-rest ring-1 ring-white/70" : "hover:bg-white/76 hover:text-ink"
      }`}
    >
      <StatusDot bucket={bucket} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-medium text-ink">{r.documentType}</span>
        <span className="block truncate text-meta text-ink-muted">{r.source}</span>
      </span>
      <CategoryPill category={r.category} className="hidden sm:inline-flex" />
      <span className="w-[112px] shrink-0 text-right">
        <DueLabel request={r} />
      </span>
      <span className="hidden xl:inline-flex">
        <AssigneeChip name={r.assignee} />
      </span>
    </button>
  );
}

/* ── Collected chip (done) ────────────────────────────────────────── */
function CollectedChip({ r, selectedId, onOpen }: { r: Request } & Pick<RowHandlers, "selectedId" | "onOpen">) {
  const selected = r.id === selectedId;
  return (
    <button
      type="button"
      onClick={() => onOpen(r.id)}
      className={`liquid-control inline-flex items-center gap-2.5 rounded-full border border-white/75 bg-glass-strong py-2 pl-2.5 pr-3 shadow-rest hover:border-white/90 hover:bg-white/78 ${
        selected ? "ring-1 ring-brand/65" : ""
      }`}
    >
      <span className="grid size-5 place-items-center rounded-full border border-white/70 bg-white/70 text-ink-muted">
        <Check className="size-3" />
      </span>
      <span className="text-meta font-medium text-ink">{r.documentType}</span>
      <CategoryPill category={r.category} />
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
        <div className="liquid-surface divide-y divide-hairline overflow-hidden rounded-[22px] border border-white/75 bg-white/50 shadow-card">
          {items.map((r) => (
            <RequestRow key={r.id} r={r} bucket={bucket} selectedId={handlers.selectedId} onOpen={handlers.onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Mobile filter pills (lg:hidden) ──────────────────────────────── */
const MOBILE_BUCKETS: (Bucket | null)[] = [null, "needs_you", "in_flight", "done", "draft"];
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
      {MOBILE_BUCKETS.map((b) => {
        const active = filter.bucket === b;
        const count = b ? counts.byBucket[b] : counts.total;
        return (
          <button
            key={b ?? "all"}
            type="button"
            onClick={() => onSetFilter({ bucket: b })}
            className={`liquid-control inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-meta font-medium shadow-rest ${
              active ? "border-white/90 bg-white/82 text-ink" : "border-white/70 bg-glass-strong text-ink-muted hover:bg-white/74"
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
      <div className="flex min-w-0 flex-col gap-3 border-b border-white/60 bg-white/16 px-5 py-5 backdrop-blur-2xl sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-meta text-ink-faint lg:hidden">{caseData.clientName}</p>
            <h2 className="truncate text-section font-medium text-ink lg:text-subhead">
              <span className="lg:hidden">{caseData.matterName}</span>
              <span className="hidden lg:inline">Document checklist</span>
            </h2>
          </div>
          <label className="flex w-full items-center gap-2 text-meta text-ink-muted sm:w-auto sm:shrink-0">
            <span className="text-ink-faint">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSetSort(e.target.value as SortKey)}
              className="liquid-control h-9 min-w-0 flex-1 rounded-full border border-white/75 bg-glass-strong px-3 text-meta text-ink shadow-rest hover:bg-white/76 sm:flex-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
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
