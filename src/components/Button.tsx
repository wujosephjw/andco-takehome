import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-brand-onfill shadow-rest hover:bg-brand-hover",
  ghost:
    "border border-white/70 bg-glass-strong text-ink-muted shadow-rest backdrop-blur-xl hover:bg-surface-hover hover:text-ink",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-meta font-medium transition-colors disabled:opacity-50 ${VARIANT[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
