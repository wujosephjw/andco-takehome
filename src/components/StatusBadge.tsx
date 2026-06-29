import type { Bucket, Status } from "@/lib/types";
import { bucketForStatus } from "@/lib/bucket";
import { bucketBadgeClasses, rawStatusLabel } from "@/lib/tokens";
import { Check } from "./icons";

/** Shape-coded glyph so status is never conveyed by color alone (greyscale-legible). */
function StatusGlyph({ bucket }: { bucket: Bucket }) {
  switch (bucket) {
    case "needs_you":
      return <span className="size-1.5 rounded-full bg-current" aria-hidden />;
    case "in_flight":
      return <span className="size-1.5 rounded-full border-[1.5px] border-current" aria-hidden />;
    case "done":
      return <Check className="size-3" />;
    case "draft":
    case "closed":
      return <span className="h-px w-2 bg-current" aria-hidden />;
  }
}

export function StatusBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const bucket = bucketForStatus(status);
  const pad = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";
  return (
    <span className={`liquid-control inline-flex items-center gap-1.5 rounded-full border text-badge font-medium shadow-rest ${pad} ${bucketBadgeClasses[bucket]}`}>
      <StatusGlyph bucket={bucket} />
      <span className="italic">{rawStatusLabel[status]}</span>
    </span>
  );
}
