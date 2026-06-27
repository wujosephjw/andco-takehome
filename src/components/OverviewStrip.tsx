import type { OverviewCounts } from "@/lib/selectors";

type Accent = "default" | "needs" | "overdue";

const NUMERAL: Record<Accent, string> = {
  default: "text-ink",
  needs: "text-needs-accent",
  overdue: "text-overdue",
};

function Chip({
  value,
  label,
  suffix,
  accent = "default",
}: {
  value: number | string;
  label: string;
  suffix?: string;
  accent?: Accent;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`font-display text-count font-light tracking-tight tnum ${NUMERAL[accent]}`}>
        {value}
      </span>
      <span className="text-label font-medium uppercase tracking-wide text-ink-muted">
        {label}
        {suffix && (
          <span className="ml-1 normal-case tracking-normal text-ink-faint">· {suffix}</span>
        )}
      </span>
    </div>
  );
}

/** The light at-a-glance band — one chip per triage question, echoing Andco's "3/8". */
export function OverviewStrip({ counts }: { counts: OverviewCounts }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl border border-hairline bg-surface px-6 py-5 shadow-rest sm:grid-cols-4"
      aria-label={`Case health: ${counts.needsYou} need you, ${counts.overdue} overdue, ${counts.inFlight} in flight, ${counts.done} of ${counts.total} done`}
    >
      <Chip
        value={counts.needsYou}
        label="Needs you"
        accent={counts.needsYou > 0 ? "needs" : "default"}
        suffix={counts.needsYou === 0 ? "clear" : undefined}
      />
      <Chip
        value={counts.overdue}
        label="Overdue"
        accent={counts.overdue > 0 ? "overdue" : "default"}
      />
      <Chip value={counts.inFlight} label="In flight" />
      <Chip value={counts.done} label="Done" suffix={`of ${counts.total}`} />
    </div>
  );
}
