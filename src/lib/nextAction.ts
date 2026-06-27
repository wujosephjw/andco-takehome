import type { Request } from "./types";

/** The contextual primary CTA for a blocked-on-us item (echoes Andco's "next best action"). */
export function resolveLabelFor(r: Request): string {
  switch (r.status) {
    case "needs_action":
      return "Re-send form";
    case "rejected":
      return "Confirm claim #";
    case "on_hold":
      return "Approve fee";
    default:
      return "Mark resolved";
  }
}
