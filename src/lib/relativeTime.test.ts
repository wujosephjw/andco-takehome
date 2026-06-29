import { describe, expect, it } from "vitest";
import { activityNow } from "./clock";
import { activityTime, relativeTime, shortTime } from "./relativeTime";

describe("activity time labels", () => {
  it("keeps new activity on fixture today while preserving time-of-day", () => {
    const at = activityNow(new Date(2026, 5, 28, 14, 15, 30));

    expect(at.toISOString()).toBe("2026-06-26T14:15:30.000Z");
    expect(shortTime(at)).toBe("2:15 PM");
  });

  it("shows time for same-day activity with an explicit timestamp", () => {
    const at = new Date("2026-06-26T09:05:00.000Z");

    expect(activityTime(at, at.toISOString())).toBe("9:05 AM");
  });

  it("still treats later same-day timestamps as today", () => {
    expect(relativeTime(new Date("2026-06-26T23:59:00.000Z"))).toBe("today");
  });
});
