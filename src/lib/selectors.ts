import { TODAY } from "./clock";
import { bucketForStatus, BUCKET_ORDER } from "./bucket";
import { isBlockedOnUs, isOverdue, daysOverdue, isStale } from "./derive";
import type { Request, Bucket, Category } from "./types";

function urgencyRank(r: Request, now: Date): number {
  let score = 0;
  if (isBlockedOnUs(r)) score += 10_000; // our move beats their delay
  score += daysOverdue(r, now); // then by how overdue
  if (isStale(r, now)) score += 50; // nudge stale-but-not-blocked up
  return score;
}

/* ───────────────── Overview counts (the light strip) ───────────────── */

export interface OverviewCounts {
  total: number; // excludes canceled (dead noise)
  byBucket: Record<Bucket, number>;
  needsYou: number;
  inFlight: number;
  done: number;
  overdue: number; // open + past due
  pagesReceived: number;
  pagesExpected: number;
}

export function selectOverview(requests: Request[], now: Date = TODAY): OverviewCounts {
  const byBucket: Record<Bucket, number> = {
    needs_you: 0,
    in_flight: 0,
    done: 0,
    draft: 0,
    closed: 0,
  };
  let overdue = 0;
  let pagesReceived = 0;
  let pagesExpected = 0;

  for (const r of requests) {
    byBucket[bucketForStatus(r.status)]++;
    if (r.status === "canceled") continue;
    if (isOverdue(r, now)) overdue++;
    pagesReceived += r.pagesReceived ?? 0;
    pagesExpected += r.pagesExpected ?? 0;
  }

  return {
    total: requests.filter((r) => r.status !== "canceled").length,
    byBucket,
    needsYou: byBucket.needs_you,
    inFlight: byBucket.in_flight,
    done: byBucket.done,
    overdue,
    pagesReceived,
    pagesExpected,
  };
}

/* ───────────────── Filter + sort (the calm list) ───────────────── */

export type SortKey = "urgency" | "due" | "updated" | "category";

export interface FilterSpec {
  bucket: Bucket | null;
  category: Category | null;
  includeCanceled: boolean;
}

export const DEFAULT_FILTER: FilterSpec = {
  bucket: null,
  category: null,
  includeCanceled: false,
};

const dueRank = (r: Request) =>
  r.dueAt ? r.dueAt.getTime() : Number.POSITIVE_INFINITY; // nulls last
const bucketRank = (r: Request) =>
  BUCKET_ORDER.indexOf(bucketForStatus(r.status));

function comparator(sort: SortKey, now: Date): (a: Request, b: Request) => number {
  switch (sort) {
    case "urgency":
      return (a, b) =>
        urgencyRank(b, now) - urgencyRank(a, now) || bucketRank(a) - bucketRank(b);
    case "due":
      return (a, b) => dueRank(a) - dueRank(b);
    case "updated":
      return (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime();
    case "category":
      return (a, b) =>
        a.category.localeCompare(b.category) ||
        a.documentType.localeCompare(b.documentType);
    default:
      return () => 0;
  }
}

export function selectFiltered(
  requests: Request[],
  filter: FilterSpec,
  sort: SortKey,
  now: Date = TODAY,
): Request[] {
  const filtered = requests.filter((r) => {
    if (!filter.includeCanceled && r.status === "canceled") return false;
    if (filter.bucket && bucketForStatus(r.status) !== filter.bucket) return false;
    if (filter.category && r.category !== filter.category) return false;
    return true;
  });
  return [...filtered].sort(comparator(sort, now)); // copy → never mutate input
}
