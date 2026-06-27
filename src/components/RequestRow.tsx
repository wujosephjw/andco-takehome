import type { Request } from "@/lib/types";
import { rawStatusLabel } from "@/lib/tokens";
import { StatusBadge } from "./StatusBadge";
import { ProgressMeter } from "./ProgressMeter";
import { DueLabel } from "./DueLabel";
import { AssigneeChip } from "./Avatar";
import { CategoryIcon, ChevronRight } from "./icons";

export function RequestRow({
  request,
  onOpen,
}: {
  request: Request;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(request.id)}
      aria-label={`${request.documentType} from ${request.source} — ${rawStatusLabel[request.status]}`}
      className="group grid w-full grid-cols-[18px_minmax(0,1fr)_auto_14px] items-center gap-x-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-hover sm:grid-cols-[18px_minmax(0,1fr)_112px_104px_104px_120px_14px]"
    >
      <CategoryIcon category={request.category} className="size-[18px] text-ink-faint" />

      <div className="min-w-0">
        <div className="truncate text-row font-medium text-ink">{request.documentType}</div>
        <div className="truncate text-meta text-ink-muted">{request.source}</div>
        {/* mobile-only meta line (the dedicated columns are hidden < sm) */}
        <div className="mt-1 flex items-center gap-3 sm:hidden">
          <DueLabel request={request} />
          <ProgressMeter request={request} />
        </div>
      </div>

      <div className="justify-self-start">
        <StatusBadge status={request.status} />
      </div>
      <div className="hidden sm:block">
        <ProgressMeter request={request} />
      </div>
      <div className="hidden sm:block">
        <DueLabel request={request} />
      </div>
      <div className="hidden justify-self-start sm:block">
        <AssigneeChip name={request.assignee} />
      </div>

      <ChevronRight className="size-3.5 justify-self-end text-ink-faint transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
