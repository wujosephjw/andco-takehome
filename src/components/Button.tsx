import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "liquid-primary border border-transparent text-brand-onfill",
  secondary:
    "border border-ink/15 bg-glass-strong text-ink shadow-rest hover:border-ink/30 hover:bg-white/70",
  ghost:
    "border border-white/60 bg-glass text-ink-muted shadow-rest hover:border-white/80 hover:bg-white/62 hover:text-ink",
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
