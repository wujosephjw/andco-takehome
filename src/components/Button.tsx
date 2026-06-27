import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "border border-black/80 bg-brand text-brand-onfill shadow-rest hover:bg-brand-hover",
  secondary:
    "border border-ink/20 bg-glass-strong text-ink shadow-rest hover:border-ink/35 hover:bg-white/82",
  ghost:
    "border border-white/75 bg-glass-strong text-ink-muted shadow-rest hover:border-white/90 hover:bg-white/78 hover:text-ink",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`liquid-control inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-meta font-medium disabled:opacity-50 ${VARIANT[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
