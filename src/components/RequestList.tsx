import type { Request } from "@/lib/types";
import { RequestRow } from "./RequestRow";
import { EmptyState } from "./EmptyState";

export function RequestList({
  requests,
  onOpen,
  filteredToZero,
  onClearFilters,
}: {
  requests: Request[];
  onOpen: (id: string) => void;
  filteredToZero: boolean;
  onClearFilters: () => void;
}) {
  return (
    <section
      aria-label="All requests"
      className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-rest"
    >
      {requests.length === 0 ? (
        <EmptyState
          variant={filteredToZero ? "filtered" : "no-data"}
          onClearFilters={onClearFilters}
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {requests.map((r) => (
            <li key={r.id}>
              <RequestRow request={r} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
