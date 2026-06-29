import type { ActivityEntry, Channel } from "@/lib/types";
import { channelLabel } from "@/lib/tokens";
import { activityTime, shortDate } from "@/lib/relativeTime";

function ChannelTag({ channel }: { channel: Channel }) {
  return (
    <span className="rounded-full border border-white/70 bg-glass-strong px-1.5 py-0.5 text-[10px] font-medium text-ink-faint shadow-rest">
      {channelLabel[channel]}
    </span>
  );
}

/** Degrades gracefully: no activity → one honest faint line built from updated_at. */
export function ActivityTimeline({
  entries,
  fallbackUpdatedAt,
}: {
  entries: ActivityEntry[];
  fallbackUpdatedAt: Date;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-meta text-ink-faint">
        No activity logged. Last updated {shortDate(fallbackUpdatedAt)}.
      </p>
    );
  }

  const sorted = entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.at.getTime() - a.entry.at.getTime() || b.index - a.index);

  return (
    <ol>
      {sorted.map(({ entry: e, index }, i) => {
        const isLast = i === sorted.length - 1;
        return (
          <li key={`${e.atRaw}-${index}`} className="grid grid-cols-[14px_minmax(0,1fr)] gap-3">
            <div className="relative flex justify-center">
              {!isLast && (
                <span className="absolute left-1/2 top-3 bottom-0 w-px -translate-x-1/2 bg-hairline" />
              )}
              <span
                className={`z-10 mt-1.5 size-2.5 rounded-full border ${
                  i === 0
                    ? "border-white/70 bg-ink"
                    : "border-white/70 bg-glass-strong"
                }`}
                aria-hidden
              />
            </div>
            <div className={isLast ? "" : "pb-4"}>
              <div className="flex flex-wrap items-center gap-2">
                {e.channel && <ChannelTag channel={e.channel} />}
                <span className="text-meta text-ink-faint">{activityTime(e.at, e.atRaw)}</span>
              </div>
              <p className="mt-0.5 text-body text-ink">{e.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
