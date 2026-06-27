import { Inbox } from "./icons";
import { Button } from "./Button";

/**
 * `no-data` = the case has zero requests (the copy explains the sort order, so it
 * reads as intentional, not a dead end). `filtered` = filters hid everything.
 */
export function EmptyState({
  variant,
  onClearFilters,
}: {
  variant: "no-data" | "filtered";
  onClearFilters?: () => void;
}) {
  if (variant === "filtered") {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="liquid-control grid size-12 place-items-center rounded-full border border-white/70 bg-glass-strong shadow-rest">
          <Inbox className="size-6 text-ink-faint" />
        </span>
        <p className="text-body text-ink-muted">No requests match these filters.</p>
        {onClearFilters && (
          <Button variant="ghost" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="liquid-control grid size-14 place-items-center rounded-full border border-white/70 bg-glass-strong shadow-rest">
        <Inbox className="size-7 text-ink-faint" />
      </span>
      <h3 className="text-section font-medium text-ink">No document requests yet</h3>
      <p className="max-w-xs text-body text-ink-muted">
        When you request records, they&rsquo;ll appear here, sorted by what needs
        you first.
      </p>
      <Button className="mt-1">New request</Button>
    </div>
  );
}
