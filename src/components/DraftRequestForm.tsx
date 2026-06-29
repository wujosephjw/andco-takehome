"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Case, Category, DraftRequestPayload, Request } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Close } from "./icons";

const CATEGORIES: Category[] = ["medical", "insurance", "police"];
const AUTOSAVE_DELAY_MS = 400;

function fieldClass(extra = "") {
  return `liquid-control glass-focus h-10 w-full rounded-full border border-white/70 bg-glass-strong px-4 text-body text-ink shadow-rest placeholder:text-ink-faint focus-visible:outline-none ${extra}`;
}

function initialForm(request: Request | null, caseData: Case) {
  return {
    category: request?.category ?? ("medical" as Category),
    documentType: request?.documentType ?? "",
    source: request?.source ?? "",
    assignee: request?.assignee ?? caseData.assignedParalegal,
    dueAtRaw: request?.dueAtRaw ?? "",
    pagesExpected: request?.pagesExpected?.toString() ?? "",
  };
}

type DraftFormState = ReturnType<typeof initialForm>;

function pagesNumberFrom(raw: string): number | null {
  return raw.trim() ? Number(raw) : null;
}

function pagesAreValid(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value > 0);
}

function payloadFromForm(
  form: DraftFormState,
  caseData: Case,
  pagesExpected: number | null,
): DraftRequestPayload {
  return {
    category: form.category,
    documentType: form.documentType.trim(),
    source: form.source.trim(),
    assignee: form.assignee.trim() || caseData.assignedParalegal,
    dueAtRaw: form.dueAtRaw || null,
    pagesExpected,
  };
}

function payloadSignature(payload: DraftRequestPayload): string {
  return JSON.stringify(payload);
}

function hasMeaningfulEdit(form: DraftFormState, initial: DraftFormState): boolean {
  return (
    form.category !== initial.category ||
    form.documentType.trim().length > 0 ||
    form.source.trim().length > 0 ||
    form.assignee.trim() !== initial.assignee.trim() ||
    form.dueAtRaw.length > 0 ||
    form.pagesExpected.trim().length > 0
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-meta font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

export function DraftRequestForm({
  request,
  caseData,
  onCancel,
  onAutosaveDraft,
  onDeleteDraft,
  onSubmitDraft,
}: {
  request: Request | null;
  caseData: Case;
  onCancel: () => void;
  onAutosaveDraft: (id: string | null, payload: DraftRequestPayload) => string;
  onDeleteDraft: (id: string) => void;
  onSubmitDraft: (id: string | null, payload: DraftRequestPayload) => void;
}) {
  const [initial] = useState(() => initialForm(request, caseData));
  const [form, setForm] = useState(initial);
  const [draftId, setDraftId] = useState<string | null>(request?.id ?? null);
  const [lastSavedSignature, setLastSavedSignature] = useState(() => {
    const pagesNumber = pagesNumberFrom(initial.pagesExpected);
    return pagesAreValid(pagesNumber)
      ? payloadSignature(payloadFromForm(initial, caseData, pagesNumber))
      : "";
  });
  const autosaveRef = useRef(onAutosaveDraft);

  useEffect(() => {
    autosaveRef.current = onAutosaveDraft;
  }, [onAutosaveDraft]);

  const pagesNumber = pagesNumberFrom(form.pagesExpected);
  const pagesValid = pagesAreValid(pagesNumber);
  const currentPayload = useMemo(
    () => payloadFromForm(form, caseData, pagesNumber),
    [caseData, form, pagesNumber],
  );
  const currentSignature = useMemo(
    () => (pagesValid ? payloadSignature(currentPayload) : ""),
    [currentPayload, pagesValid],
  );
  const hasDraftEdits = hasMeaningfulEdit(form, initial);
  const shouldAutosave =
    pagesValid &&
    currentSignature !== lastSavedSignature &&
    (request !== null || hasDraftEdits);
  const canSubmit =
    form.documentType.trim().length > 0 &&
    form.source.trim().length > 0 &&
    pagesValid;

  useEffect(() => {
    if (!pagesValid || !shouldAutosave) return;

    const timeout = window.setTimeout(() => {
      const id = autosaveRef.current(draftId, currentPayload);
      setDraftId(id);
      setLastSavedSignature(currentSignature);
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [currentPayload, currentSignature, draftId, pagesValid, shouldAutosave]);

  const title = request ? "Edit draft request" : "New document request";
  const saveLabel =
    !pagesValid
      ? "Unsaved changes"
      : shouldAutosave
      ? "Saving..."
      : draftId
        ? "Saved"
        : "Not saved yet";
  const closeDraft = () => {
    if (shouldAutosave) {
      const id = autosaveRef.current(draftId, currentPayload);
      setDraftId(id);
      setLastSavedSignature(currentSignature);
    }
    onCancel();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-white/60 bg-white/14 px-5 py-5 backdrop-blur-2xl">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="draft" />
          </div>
          <h2 className="text-subhead font-medium leading-snug text-ink">{title}</h2>
          <p className="mt-0.5 text-meta text-ink-muted">
            Draft changes save automatically. Submit when the request is ready to send.
          </p>
        </div>
        <button
          type="button"
          onClick={closeDraft}
          aria-label="Close draft"
          className="liquid-control -mr-1 rounded-full border border-transparent p-1 text-ink-muted hover:border-white/70 hover:bg-glass-strong hover:text-ink"
        >
          <Close className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) =>
              setForm((value) => ({ ...value, category: e.target.value as Category }))
            }
            className={fieldClass("appearance-none")}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel[category]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Document type">
          <input
            value={form.documentType}
            onChange={(e) =>
              setForm((value) => ({ ...value, documentType: e.target.value }))
            }
            placeholder="Medical Records - Neurology"
            className={fieldClass()}
          />
        </Field>

        <Field label="Source">
          <input
            value={form.source}
            onChange={(e) => setForm((value) => ({ ...value, source: e.target.value }))}
            placeholder="Provider, agency, or carrier"
            className={fieldClass()}
          />
        </Field>

        <Field label="Assignee">
          <input
            value={form.assignee}
            onChange={(e) =>
              setForm((value) => ({ ...value, assignee: e.target.value }))
            }
            className={fieldClass()}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Due date">
            <input
              type="date"
              value={form.dueAtRaw}
              onChange={(e) =>
                setForm((value) => ({ ...value, dueAtRaw: e.target.value }))
              }
              className={fieldClass("px-3")}
            />
          </Field>

          <Field label="Expected pages">
            <input
              type="number"
              min={1}
              value={form.pagesExpected}
              onChange={(e) =>
                setForm((value) => ({ ...value, pagesExpected: e.target.value }))
              }
              placeholder="Optional"
              className={fieldClass()}
            />
          </Field>
        </div>

        {!pagesValid && (
          <p className="text-meta text-overdue">Expected pages must be a positive whole number.</p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/60 bg-white/14 px-5 py-4 backdrop-blur-2xl">
        {draftId ? (
          <Button variant="danger" onClick={() => onDeleteDraft(draftId)}>
            Delete draft
          </Button>
        ) : (
          <Button variant="ghost" onClick={closeDraft}>
            {hasDraftEdits ? "Close" : "Discard"}
          </Button>
        )}
        <span className="ml-auto text-meta text-ink-faint" aria-live="polite">
          {saveLabel}
        </span>
        <Button
          disabled={!canSubmit}
          onClick={() => onSubmitDraft(draftId, currentPayload)}
        >
          Submit request
        </Button>
      </div>
    </div>
  );
}
