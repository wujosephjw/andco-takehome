import { TODAY, MS_PER_DAY } from "./clock";
import type { Request, Status, Progress } from "./types";

/**
 * Statuses that represent live, incomplete work where a deadline is meaningful.
 * Excludes received (complete), canceled (dead), draft (not real yet).
 * `partially_received`, `rejected`, `on_hold` ARE open — they're stuck, not done.
 */
const OPEN_STATUSES: ReadonlySet<Status> = new Set<Status>([
  "requested",
  "in_progress",
  "needs_action",
  "partially_received",
  "rejected",
  "on_hold",
]);

export function isOpen(r: Request): boolean {
  return OPEN_STATUSES.has(r.status);
}

/** The next move is ours — drives the pinned "Needs you" zone. */
export function isBlockedOnUs(r: Request): boolean {
  return (
    r.status === "needs_action" ||
    r.status === "rejected" ||
    r.status === "on_hold"
  );
}

export function daysOverdue(r: Request, now: Date = TODAY): number {
  if (!isOpen(r) || r.dueAt === null) return 0;
  const days = Math.floor((now.getTime() - r.dueAt.getTime()) / MS_PER_DAY);
  return days > 0 ? days : 0;
}

export function isOverdue(r: Request, now: Date = TODAY): boolean {
  return daysOverdue(r, now) > 0;
}

/** Open + untouched for >30 days — catches items that look healthy but are rotting. */
const STALE_DAYS = 30;
export function isStale(r: Request, now: Date = TODAY): boolean {
  if (!isOpen(r)) return false;
  const idle = Math.floor((now.getTime() - r.updatedAt.getTime()) / MS_PER_DAY);
  return idle > STALE_DAYS;
}

export function progress(r: Request): Progress {
  const received = r.pagesReceived ?? 0;
  const expected = r.pagesExpected ?? 0;
  const tracked = r.pagesReceived !== null || r.pagesExpected !== null;
  const pct = expected > 0 ? Math.round((received / expected) * 100) : 0;
  return { received, expected, pct, tracked };
}
