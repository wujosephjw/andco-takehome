import type { Category } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";

/** Colored category tag — text on a low-chroma tint (Legora-style pill). */
const PILL: Record<Category, string> = {
  medical: "text-ink-muted bg-glass-strong border-white/70",
  police: "text-ink-muted bg-glass-strong border-white/70",
  insurance: "text-ink-muted bg-glass-strong border-white/70",
};

export function CategoryPill({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={`liquid-control inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-rest ${PILL[category]} ${className ?? ""}`}
    >
      {categoryLabel[category]}
    </span>
  );
}
