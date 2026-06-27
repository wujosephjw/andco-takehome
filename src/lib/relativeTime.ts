import { TODAY, MS_PER_DAY } from "./clock";

/** Human "3 days ago" / "in 5 days" / "—", anchored to the frozen clock. */
export function relativeTime(date: Date | null, now: Date = TODAY): string {
  if (date === null) return "—";
  const days = Math.round((date.getTime() - now.getTime()) / MS_PER_DAY);
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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Absolute short date, e.g. "Jun 26". UTC to match how the fixture is parsed. */
export function shortDate(date: Date | null): string {
  if (date === null) return "—";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
