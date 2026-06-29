import Image from "next/image";
import type { Case, Bucket, Category } from "@/lib/types";
import type { FilterSpec, OverviewCounts } from "@/lib/selectors";
import { BUCKET_LABEL } from "@/lib/bucket";
import { categoryLabel } from "@/lib/tokens";
import { StatusDot } from "./StatusDot";
import { Button } from "./Button";
import { CategoryIcon, Plus, Search } from "./icons";

const STATUS_BUCKETS: Bucket[] = ["needs_you", "in_flight", "done", "draft"];

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
      className={`liquid-row flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-left text-body ${
        active ? "bg-white/64 font-medium text-ink shadow-rest ring-1 ring-white/60" : "text-ink-muted hover:bg-white/55 hover:text-ink"
      }`}
    >
      {children}
      <span className={`ml-auto text-meta tabular-nums ${active ? "text-ink-muted" : "text-ink-faint"}`}>
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
  onNewRequest,
}: {
  caseData: Case;
  counts: OverviewCounts;
  byCategory: Record<Category, number>;
  filter: FilterSpec;
  query: string;
  onQuery: (q: string) => void;
  onSetFilter: (patch: Partial<FilterSpec>) => void;
  onNewRequest: () => void;
}) {
  return (
    <aside className="hidden min-h-0 flex-col border-r border-white/60 bg-white/18 backdrop-blur-3xl lg:flex">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="liquid-control grid size-8 shrink-0 place-items-center rounded-full border border-white/70 bg-glass-strong shadow-rest">
            <Image src="/andco-mark.svg" alt="Andco" width={20} height={20} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-medium text-ink">{caseData.matterName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search requests"
            placeholder="Search requests"
            className="liquid-control glass-focus h-10 w-full rounded-full border border-white/85 bg-white/68 pl-9 pr-3 text-body font-medium text-ink shadow-rest placeholder:font-normal placeholder:text-ink-muted hover:bg-white/78 focus-visible:bg-white/82"
          />
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3">
        <div className="px-3 pb-2 text-meta font-medium text-ink-faint">Status</div>
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

        <div className="mt-5 px-3 pb-2 text-meta font-medium text-ink-faint">
          Category
        </div>
        {(Object.keys(byCategory) as Category[]).map((c) => (
          <NavItem
            key={c}
            active={filter.category === c}
            onClick={() => onSetFilter({ category: filter.category === c ? null : c })}
            count={byCategory[c]}
          >
            <CategoryIcon category={c} className="size-3.5 text-ink-faint" />
            {categoryLabel[c]}
          </NavItem>
        ))}

        {counts.byBucket.closed > 0 && (
          <label className="liquid-row mt-4 flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-meta text-ink-muted hover:bg-white/55 hover:text-ink">
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

      <div className="space-y-3 border-t border-white/60 bg-white/12 px-4 py-4 backdrop-blur-2xl">
        <Button variant="ghost" className="w-full" onClick={onNewRequest}>
          <Plus className="size-4" />
          New request
        </Button>
      </div>
    </aside>
  );
}
