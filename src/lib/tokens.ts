import type { Bucket, Category, Channel, Status } from "./types";

/**
 * UI lookup maps. These hold class-name strings that reference the utilities
 * generated from the @theme tokens in globals.css — never raw hex. Tokens live
 * in exactly one place (globals.css); this is just the typed binding to them.
 * `Record<Bucket, …>` etc. keep every map exhaustive at compile time.
 */

export const bucketBadgeClasses: Record<Bucket, string> = {
  needs_you: "bg-needs-bg text-needs-text border-needs-border",
  in_flight: "bg-flight-bg text-flight-text border-flight-border",
  done: "bg-done-bg text-done-text border-done-border",
  draft: "bg-draft-bg text-draft-text border-draft-border",
  closed: "bg-closed-bg text-closed-text border-closed-border",
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
  police: "text-cat-police",
  medical: "text-cat-medical",
  insurance: "text-cat-insurance",
};

export const channelLabel: Record<Channel, string> = {
  web: "Web",
  email: "Email",
  fax: "Fax",
  voice: "Voice",
  sms: "SMS",
  mail: "Mail",
};
