import type { Category } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";

/** Quiet category tag that rides next to the date — same text size as the date
 *  label and no heavy chrome, so it reads as supporting metadata rather than a
 *  loud badge competing with the document title. */
export function CategoryPill({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-white/45 bg-white/35 px-2 py-0.5 text-meta text-ink-muted ${className ?? ""}`}
    >
      {categoryLabel[category]}
    </span>
  );
}
