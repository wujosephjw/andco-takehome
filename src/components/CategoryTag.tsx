import type { Category } from "@/lib/types";
import { categoryLabel, categoryTextClass } from "@/lib/tokens";
import { CategoryIcon } from "./icons";

/** Icon-led category marker. `showLabel` off in the dense row, on in the drawer. */
export function CategoryTag({
  category,
  showLabel = false,
  className,
}: {
  category: Category;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-ink-muted ${categoryTextClass[category]} ${className ?? ""}`}
      title={categoryLabel[category]}
    >
      <CategoryIcon category={category} className="size-4" />
      {showLabel && (
        <span className="text-meta font-medium text-ink-muted">
          {categoryLabel[category]}
        </span>
      )}
    </span>
  );
}
