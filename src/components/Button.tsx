import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-brand-onfill hover:bg-brand-hover",
  ghost:
    "border border-hairline-strong bg-surface text-ink-muted hover:bg-surface-hover",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3.5 text-badge font-medium transition-colors disabled:opacity-50 ${VARIANT[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
