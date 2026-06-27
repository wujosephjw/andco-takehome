import type { Bucket, Category, Channel, Status } from "./types";

/**
 * UI lookup maps. These hold class-name strings that reference the utilities
 * generated from the @theme tokens in globals.css — never raw hex. Tokens live
 * in exactly one place (globals.css); this is just the typed binding to them.
 * `Record<Bucket, …>` etc. keep every map exhaustive at compile time.
 */

export const bucketBadgeClasses: Record<Bucket, string> = {
  needs_you: "bg-glass-strong text-ink border-white/70",
  in_flight: "bg-glass-strong text-ink-muted border-white/70",
  done: "bg-glass-strong text-ink-muted border-white/70",
  draft: "bg-glass text-ink-faint border-white/60",
  closed: "bg-glass text-ink-faint border-white/50",
};

export const rawStatusLabel: Record<Status, string> = {
  draft: "Draft",
  requested: "Requested",
  in_progress: "In progress",
  needs_action: "Needs action",
  partially_received: "Partial",
  received: "Received",
  rejected: "Rejected",
  on_hold: "On hold",
  canceled: "Canceled",
};

export const categoryLabel: Record<Category, string> = {
  police: "Police",
  medical: "Medical",
  insurance: "Insurance",
};

export const categoryTextClass: Record<Category, string> = {
  police: "text-ink-muted",
  medical: "text-ink-muted",
  insurance: "text-ink-muted",
};

export const channelLabel: Record<Channel, string> = {
  web: "Web",
  email: "Email",
  fax: "Fax",
  voice: "Voice",
  sms: "SMS",
  mail: "Mail",
};
