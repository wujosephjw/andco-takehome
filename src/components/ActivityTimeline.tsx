import type { ActivityEntry, Channel } from "@/lib/types";
import { channelLabel } from "@/lib/tokens";
import { relativeTime, shortDate } from "@/lib/relativeTime";

function ChannelTag({ channel }: { channel: Channel }) {
  return (
    <span className="rounded-full bg-draft-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-draft-text">
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

  const sorted = [...entries].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <ol>
      {sorted.map((e, i) => {
        const isLast = i === sorted.length - 1;
        return (
          <li key={i} className="grid grid-cols-[14px_minmax(0,1fr)] gap-3">
            <div className="relative flex justify-center">
              {!isLast && (
                <span className="absolute left-1/2 top-3 bottom-0 w-px -translate-x-1/2 bg-hairline" />
              )}
              <span
                className={`z-10 mt-1.5 size-2.5 rounded-full border-2 ${
                  i === 0
                    ? "border-green bg-green"
                    : "border-hairline-strong bg-surface"
                }`}
                aria-hidden
              />
            </div>
            <div className={isLast ? "" : "pb-4"}>
              <div className="flex flex-wrap items-center gap-2">
                {e.channel && <ChannelTag channel={e.channel} />}
                <span className="text-meta text-ink-faint">{relativeTime(e.at)}</span>
              </div>
              <p className="mt-0.5 text-body text-ink">{e.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
