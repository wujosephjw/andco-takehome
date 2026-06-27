import type { Category } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";

/** Colored category tag — text on a low-chroma tint (Legora-style pill). */
const PILL: Record<Category, string> = {
  medical: "text-cat-medical bg-cat-medical-bg",
  police: "text-cat-police bg-cat-police-bg",
  insurance: "text-cat-insurance bg-cat-insurance-bg",
};

export function CategoryPill({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PILL[category]} ${className ?? ""}`}
    >
      {categoryLabel[category]}
    </span>
  );
}
