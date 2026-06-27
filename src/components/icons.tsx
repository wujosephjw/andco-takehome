import type { Category } from "@/lib/types";

type IconProps = { className?: string };

const base = (className?: string) => ({
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

/** police = shield · medical = cross · insurance = umbrella */
export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  switch (category) {
    case "police":
      return (
        <svg {...base(className)}>
          <path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
        </svg>
      );
    case "medical":
      return (
        <svg {...base(className)}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M12 8.5v7M8.5 12h7" />
        </svg>
      );
    case "insurance":
      return (
        <svg {...base(className)}>
          <path d="M3.5 12a8.5 8.5 0 0 1 17 0z" />
          <path d="M12 12v6a2 2 0 0 0 4 0" />
        </svg>
      );
  }
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Check({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Plus({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Search({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l3.5 3.5" />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Undo({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 7L4 12l5 5" />
      <path d="M4 12h11a5 5 0 0 1 0 10h-1" />
    </svg>
  );
}

export function Inbox({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13" />
      <path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-5a3 3 0 0 1-6 0H4z" />
    </svg>
  );
}
