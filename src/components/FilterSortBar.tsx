import type { Bucket } from "@/lib/types";
import { BUCKET_LABEL } from "@/lib/bucket";
import type { FilterSpec, SortKey } from "@/lib/selectors";

const BUCKET_TABS: (Bucket | null)[] = [null, "needs_you", "in_flight", "done", "draft"];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "urgency", label: "Urgency" },
  { key: "due", label: "Due date" },
  { key: "updated", label: "Last updated" },
  { key: "category", label: "Category" },
];

function Pill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-meta font-medium transition-colors ${
        active ? "bg-sage-tint text-sage-ink" : "text-ink-muted hover:bg-surface-hover"
      }`}
    >
      {label}
      <span className={`tnum text-[11px] ${active ? "text-sage-ink" : "text-ink-faint"}`}>
        {count}
      </span>
    </button>
  );
}

export function FilterSortBar({
  filter,
  sort,
  byBucket,
  total,
  hasCanceled,
  onSetFilter,
  onSetSort,
}: {
  filter: FilterSpec;
  sort: SortKey;
  byBucket: Record<Bucket, number>;
  total: number;
  hasCanceled: boolean;
  onSetFilter: (patch: Partial<FilterSpec>) => void;
  onSetSort: (sort: SortKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1">
        {BUCKET_TABS.map((b) => (
          <Pill
            key={b ?? "all"}
            active={filter.bucket === b}
            label={b ? BUCKET_LABEL[b] : "All"}
            count={b ? byBucket[b] : total}
            onClick={() => onSetFilter({ bucket: b })}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        {hasCanceled && (
          <label className="flex cursor-pointer select-none items-center gap-1.5 text-meta text-ink-muted">
            <input
              type="checkbox"
              checked={filter.includeCanceled}
              onChange={(e) => onSetFilter({ includeCanceled: e.target.checked })}
              className="size-3.5 accent-sage"
            />
            Show canceled
          </label>
        )}
        <label className="flex items-center gap-2 text-meta text-ink-muted">
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
    </div>
  );
}
