import type { Bucket } from "@/lib/types";
import { Check } from "./icons";

/**
 * Lifecycle marker — status is encoded by SHAPE (filled · ring · check · dash),
 * mirroring StatusBadge, so the board stays calm. The one chromatic spark is the
 * orange "needs you" core (warm = your move), ringed in soft grey; a deeper amber
 * is reserved for overdue (see DueLabel). Everything else stays greyscale.
 */
export function StatusDot({ bucket, className }: { bucket: Bucket; className?: string }) {
  const wrap = `inline-grid size-3.5 shrink-0 place-items-center ${className ?? ""}`;
  switch (bucket) {
    case "needs_you":
      return (
        <span className={wrap} aria-hidden>
          <span className="size-2 rounded-full bg-needs-accent ring-2 ring-ink/10" />
        </span>
      );
    case "in_flight":
      return (
        <span className={wrap} aria-hidden>
          <span className="size-2 rounded-full border-[1.5px] border-ink/45" />
        </span>
      );
    case "done":
      return (
        <span className={`${wrap} text-ink-muted`} aria-hidden>
          <Check className="size-3" />
        </span>
      );
    case "draft":
      return (
        <span className={wrap} aria-hidden>
          <span className="h-[1.5px] w-2 rounded-full bg-ink/30" />
        </span>
      );
    case "closed":
      return (
        <span className={wrap} aria-hidden>
          <span className="h-[1.5px] w-2 rounded-full bg-ink/15" />
        </span>
      );
  }
}
