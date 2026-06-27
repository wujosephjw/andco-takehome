import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-green text-green-onfill hover:bg-green-hover active:bg-green-active",
  ghost:
    "border border-hairline-strong bg-transparent text-ink-muted hover:bg-surface-hover",
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
