import type { Bucket } from "@/lib/types";

/** Saturated traffic-light dot per action-bucket (Legora Monitors-style marker). */
const DOT: Record<Bucket, string> = {
  needs_you: "bg-dot-needs",
  in_flight: "bg-dot-flight",
  done: "bg-dot-done",
  draft: "bg-dot-draft",
  closed: "bg-dot-closed",
};

export function StatusDot({ bucket, className }: { bucket: Bucket; className?: string }) {
  return (
    <span className={`inline-block size-2 shrink-0 rounded-full ${DOT[bucket]} ${className ?? ""}`} aria-hidden />
  );
}
