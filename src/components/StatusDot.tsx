import type { Bucket } from "@/lib/types";

/** Small workspace marker: mostly neutral, with amber reserved for action-needed. */
const DOT: Record<Bucket, string> = {
  needs_you: "bg-dot-needs",
  in_flight: "bg-dot-flight",
  done: "bg-dot-done",
  draft: "bg-dot-draft",
  closed: "bg-dot-closed",
};

export function StatusDot({ bucket, className }: { bucket: Bucket; className?: string }) {
  return (
    <span className={`inline-block size-2.5 shrink-0 rounded-full border border-white/70 shadow-rest ${DOT[bucket]} ${className ?? ""}`} aria-hidden />
  );
}
