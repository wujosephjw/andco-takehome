import type { Case, Request } from "@/lib/types";
import { DraftRequestForm } from "./DraftRequestForm";
import { RequestDetail, type DetailHandlers } from "./RequestDetail";

/** Persistent right-hand detail column (desktop). Replaces the slide-in drawer. */
export function DetailPane({
  caseData,
  request,
  composingDraft,
  onClose,
  ...handlers
}: {
  caseData: Case;
  request: Request | null;
  composingDraft: boolean;
  onClose: () => void;
} & DetailHandlers) {
  const draftRequest = request?.status === "draft" ? request : null;
  const showDraft = composingDraft || draftRequest !== null;

  return (
    <aside className="hidden min-h-0 flex-col border-l border-white/60 bg-white/18 backdrop-blur-3xl lg:flex">
      {showDraft ? (
        <DraftRequestForm
          key={draftRequest?.id ?? "new-draft"}
          request={draftRequest}
          caseData={caseData}
          onCancel={onClose}
          onSaveDraft={handlers.onSaveDraft}
          onSubmitDraft={handlers.onSubmitDraft}
        />
      ) : request ? (
        <RequestDetail request={request} onClose={onClose} {...handlers} />
      ) : (
        <div className="h-full" aria-hidden="true" />
      )}
    </aside>
  );
}
