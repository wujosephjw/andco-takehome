import type { Case, Bucket, Category } from "@/lib/types";
import type { FilterSpec, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { categoryLabel } from "@/lib/tokens";
import { StatusDot } from "./StatusDot";
import { Button } from "./Button";
import { StatePreviewSwitcher, type PreviewMode } from "./StatePreviewSwitcher";

const STATUS_BUCKETS: Bucket[] = ["needs_you", "in_flight", "done", "draft"];
const CAT_SWATCH: Record<Category, string> = {
  medical: "bg-cat-medical",
  insurance: "bg-cat-insurance",
  police: "bg-cat-police",
};

function NavItem({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-body transition-colors ${
        active ? "bg-brand-tint font-medium text-brand-ink" : "text-ink-muted hover:bg-surface-hover"
      }`}
    >
      {children}
      <span className={`ml-auto text-meta tabular-nums ${active ? "text-brand-ink" : "text-ink-faint"}`}>
        {count}
      </span>
    </button>
  );
}

export function CaseRail({
  caseData,
  counts,
  byCategory,
  filter,
  query,
  onQuery,
  onSetFilter,
  preview,
  onPreview,
}: {
  caseData: Case;
  counts: OverviewCounts;
  byCategory: Record<Category, number>;
  filter: FilterSpec;
  query: string;
  onQuery: (q: string) => void;
  onSetFilter: (patch: Partial<FilterSpec>) => void;
  preview: PreviewMode;
  onPreview: (m: PreviewMode) => void;
}) {
  return (
    <aside className="hidden min-h-0 flex-col border-r border-hairline bg-surface lg:flex">
      <div className="px-4 pb-3 pt-5">
        <p className="text-label font-medium uppercase tracking-wide text-ink-faint">Document requests</p>
        <h1 className="mt-1.5 font-display text-subhead leading-tight text-ink">{caseData.matterName}</h1>
        <p className="mt-1.5 text-meta text-ink-muted">
          {caseData.clientName} · {caseData.matterType}
        </p>
      </div>

      <div className="px-3.5 pb-2.5">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search requests…"
          className="w-full rounded-full border border-hairline-strong bg-surface px-3 py-1.5 text-meta text-ink placeholder:text-ink-faint"
        />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5">
        <div className="px-2.5 pb-1.5 text-label font-semibold uppercase tracking-wide text-ink-faint">Status</div>
        <NavItem active={filter.bucket === null} onClick={() => onSetFilter({ bucket: null })} count={counts.total}>
          All requests
        </NavItem>
        {STATUS_BUCKETS.map((b) => (
          <NavItem
            key={b}
            active={filter.bucket === b}
            onClick={() => onSetFilter({ bucket: filter.bucket === b ? null : b })}
            count={counts.byBucket[b]}
          >
            <StatusDot bucket={b} />
            {BUCKET_LABEL[b]}
          </NavItem>
        ))}

        <div className="mt-4 px-2.5 pb-1.5 text-label font-semibold uppercase tracking-wide text-ink-faint">
          Category
        </div>
        {(Object.keys(byCategory) as Category[]).map((c) => (
          <NavItem
            key={c}
            active={filter.category === c}
            onClick={() => onSetFilter({ category: filter.category === c ? null : c })}
            count={byCategory[c]}
          >
            <span className={`size-2 rounded-[2px] ${CAT_SWATCH[c]}`} aria-hidden />
            {categoryLabel[c]}
          </NavItem>
        ))}

        {counts.byBucket.closed > 0 && (
          <label className="mt-3 flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5 text-meta text-ink-muted">
            <input
              type="checkbox"
              checked={filter.includeCanceled}
              onChange={(e) => onSetFilter({ includeCanceled: e.target.checked })}
              className="size-3.5 accent-brand"
            />
            Show canceled ({counts.byBucket.closed})
          </label>
        )}
      </nav>

      <div className="space-y-3 border-t border-hairline px-3.5 py-3">
        <Button className="w-full">+ New request</Button>
        <StatePreviewSwitcher mode={preview} onChange={onPreview} />
      </div>
    </aside>
  );
}
