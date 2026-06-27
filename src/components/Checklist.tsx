import type { Request, Bucket, Case } from "@/lib/types";
import type { FilterSpec, SortKey, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { resolveLabelFor } from "@/lib/nextAction";
import { StatusDot } from "./StatusDot";
import { CategoryPill } from "./CategoryPill";
import { DueLabel } from "./DueLabel";
import { AssigneeChip } from "./Avatar";
import { ProgressMeter } from "./ProgressMeter";
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
      className={`cursor-pointer rounded-lg border border-needs-border bg-surface p-4 shadow-card transition-shadow hover:shadow-lift ${
        selected ? "ring-2 ring-brand" : ""
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-dot-needs)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-row font-medium text-ink">{r.documentType}</div>
          <div className="truncate text-meta text-ink-muted">{r.source}</div>
        </div>
        <CategoryPill category={r.category} />
      </div>

      {r.attentionReason && (
        <p className="mt-3 rounded-md border border-needs-border bg-needs-bg/60 px-3 py-2 text-body text-ink">
          {r.attentionReason}
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-meta text-ink-faint">
          <DueLabel request={r} />
          <span aria-hidden>·</span>
          <AssigneeChip name={r.assignee} />
        </span>
        <span className="flex items-center gap-2">
          <Button variant="ghost" onClick={(e) => (e.stopPropagation(), onFollowUp(r.id))}>
            Follow up
          </Button>
          <Button onClick={(e) => (e.stopPropagation(), onResolve(r.id))}>{resolveLabelFor(r)}</Button>
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
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        selected ? "bg-brand-tint" : "hover:bg-surface-hover"
      }`}
    >
      <StatusDot bucket={bucket} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-medium text-ink">{r.documentType}</span>
        <span className="block truncate text-meta text-ink-muted">{r.source}</span>
      </span>
      <span className="hidden md:block">
        <ProgressMeter request={r} />
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
      className={`inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface py-2 pl-2.5 pr-3 shadow-rest transition-shadow hover:shadow-card ${
        selected ? "ring-2 ring-brand" : ""
      }`}
    >
      <span className="grid size-5 place-items-center rounded-full bg-brand-tint text-brand">
        <Check className="size-3" />
      </span>
      <span className="text-meta font-medium text-ink">{r.documentType}</span>
      {r.pagesExpected != null && (
        <span className="text-meta tnum font-mono text-ink-faint">
          {r.pagesReceived ?? 0}/{r.pagesExpected}
        </span>
      )}
      <CategoryPill category={r.category} />
    </button>
  );
}

/* ── A group section ──────────────────────────────────────────────── */
function GroupSection({ group, handlers }: { group: Group; handlers: RowHandlers }) {
  const { bucket, label, hint, items } = group;
  return (
    <section>
      <header className="mb-3 flex items-center gap-2.5">
        <StatusDot bucket={bucket} />
        <h2 className="text-subhead font-semibold tracking-tight text-ink">{label}</h2>
        <span className="rounded-full bg-sunk px-2 py-0.5 text-badge font-medium text-ink-muted">{items.length}</span>
        <span className="h-px flex-1 bg-hairline" />
        {hint && <span className="text-meta text-ink-faint">{hint}</span>}
      </header>

      {bucket === "needs_you" ? (
        <div className="grid gap-3 sm:grid-cols-2">
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
        <div className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-surface shadow-rest">
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
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
      {MOBILE_BUCKETS.map((b) => {
        const active = filter.bucket === b;
        const count = b ? counts.byBucket[b] : counts.total;
        return (
          <button
            key={b ?? "all"}
            type="button"
            onClick={() => onSetFilter({ bucket: b })}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-meta font-medium transition-colors ${
              active ? "bg-brand-tint text-brand-ink" : "bg-surface text-ink-muted"
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
    <section className="flex min-h-0 flex-col">
      {/* Panel header */}
      <div className="flex flex-col gap-3 border-b border-hairline px-5 py-3.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-section text-ink lg:text-subhead">
              <span className="lg:hidden">{caseData.matterName}</span>
              <span className="hidden lg:inline">Document checklist</span>
            </h2>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-meta text-ink-muted">
            <span className="text-ink-faint">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSetSort(e.target.value as SortKey)}
              className="rounded-md border border-hairline bg-surface px-2 py-1 text-meta text-ink"
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
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-6">
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
