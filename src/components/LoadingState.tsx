function Bar({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded bg-sunk ${className ?? ""}`} />;
}

/** Skeleton that mirrors the real layout so there is no shift when data arrives. */
export function LoadingState() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading case">
      {/* overview strip */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-lg bg-sunk/50 px-5 py-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bar className="h-6 w-10" />
            <Bar className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* needs-you card */}
      <div className="space-y-2">
        <Bar className="h-4 w-28" />
        <div className="space-y-3 rounded-lg border border-hairline bg-surface p-4">
          <Bar className="h-3.5 w-1/3" />
          <Bar className="h-3 w-3/4" />
          <Bar className="h-8 w-40 rounded-md" />
        </div>
      </div>

      {/* list */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[18px_minmax(0,1fr)_112px] items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
          >
            <Bar className="size-[18px] rounded-full" />
            <div className="space-y-1.5">
              <Bar className="h-3 w-1/2" />
              <Bar className="h-2.5 w-1/3" />
            </div>
            <Bar className="h-5 w-20 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
