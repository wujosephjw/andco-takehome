import { TODAY, MS_PER_DAY } from "./clock";

/** Human "3 days ago" / "in 5 days" / "—", anchored to the frozen clock. */
export function relativeTime(date: Date | null, now: Date = TODAY): string {
  if (date === null) return "—";
  const days = utcDay(date) - utcDay(now);
  if (days === 0) return "today";
  if (days === -1) return "yesterday";
  if (days === 1) return "tomorrow";

  const abs = Math.abs(days);
  const mag =
    abs < 7
      ? `${abs} days`
      : abs < 30
        ? `${Math.round(abs / 7)} wk`
        : abs < 365
          ? `${Math.round(abs / 30)} mo`
          : `${Math.round(abs / 365)} yr`;

  return days < 0 ? `${mag} ago` : `in ${mag}`;
}

function utcDay(date: Date): number {
  return (
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
    MS_PER_DAY
  );
}

function hasExplicitTime(raw: string): boolean {
  return raw.includes("T");
}

function sameUtcDay(a: Date, b: Date): boolean {
  return utcDay(a) === utcDay(b);
}

export function shortTime(date: Date): string {
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

export function activityTime(date: Date, raw: string, now: Date = TODAY): string {
  if (sameUtcDay(date, now) && hasExplicitTime(raw)) return shortTime(date);
  return relativeTime(date, now);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Absolute short date, e.g. "Jun 26". UTC to match how the fixture is parsed. */
export function shortDate(date: Date | null): string {
  if (date === null) return "—";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
