/**
 * The fixture is a fixed point in time. All relative-time and overdue math
 * anchors to this single constant — never call `new Date()` in domain logic,
 * or the demo would rot and every item would drift to "overdue".
 */
export const TODAY = new Date("2026-06-26T00:00:00Z");

export const MS_PER_DAY = 86_400_000;

/** Date -> "YYYY-MM-DD" (UTC), to keep synthesized activity consistent with the fixture. */
export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
