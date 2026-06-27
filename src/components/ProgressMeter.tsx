import type { Request } from "@/lib/types";
import { progress } from "@/lib/derive";

/** Pages-received bar + n/m fraction. Renders nothing when the request is untracked. */
export function ProgressMeter({
  request,
  width = "w-14",
}: {
  request: Request;
  width?: string;
}) {
  const p = progress(request);
  if (!p.tracked) return null;
  const complete = p.expected > 0 && p.received >= p.expected;
  return (
    <div className="flex items-center gap-2" title={`${p.received} of ${p.expected} pages`}>
      <span className={`h-1 ${width} overflow-hidden rounded-full bg-sunk/80`}>
        <span
          className={`block h-full rounded-full ${complete ? "bg-ink-muted" : "bg-ink/30"}`}
          style={{ width: `${Math.max(p.pct, 4)}%` }}
        />
      </span>
      <span className="text-meta tnum font-mono text-ink-muted">
        {p.received}/{p.expected}
      </span>
    </div>
  );
}
