import type { Status, Bucket } from "./types";

/**
 * The taxonomy spine. A triaging paralegal thinks in action-states, not system
 * states, so 9 raw statuses collapse to 5 buckets. Every component branches on
 * the bucket; the raw status survives only as a human label.
 *
 * `on_hold` lands in `needs_you` deliberately: the brief's three "blocked on us"
 * examples are a missing signature (needs_action), an unpaid fee (on_hold), and
 * a rejection (rejected). The $35 prepayment is on us.
 *
 * Using `Record<Status, Bucket>` makes this exhaustive at compile time — add a
 * status and TypeScript forces a mapping here.
 */
const STATUS_TO_BUCKET: Record<Status, Bucket> = {
  needs_action: "needs_you",
  rejected: "needs_you",
  on_hold: "needs_you",
  requested: "in_flight",
  in_progress: "in_flight",
  partially_received: "in_flight",
  received: "done",
  draft: "draft",
  canceled: "closed",
};

export function bucketForStatus(status: Status): Bucket {
  return STATUS_TO_BUCKET[status];
}

export const BUCKET_ORDER: Bucket[] = [
  "needs_you",
  "in_flight",
  "done",
  "draft",
  "closed",
];

export const BUCKET_LABEL: Record<Bucket, string> = {
  needs_you: "Action needed",
  in_flight: "In progress",
  done: "Collected",
  draft: "Draft",
  closed: "Canceled",
};
