"use client";

import { useState } from "react";
import type { Case, Category, DraftRequestPayload, Request } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Close } from "./icons";

const CATEGORIES: Category[] = ["medical", "insurance", "police"];

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
  onSaveDraft,
  onSubmitDraft,
}: {
  request: Request | null;
  caseData: Case;
  onCancel: () => void;
  onSaveDraft: (id: string | null, payload: DraftRequestPayload) => void;
  onSubmitDraft: (id: string | null, payload: DraftRequestPayload) => void;
}) {
  const [form, setForm] = useState(() => initialForm(request, caseData));

  const pagesNumber = form.pagesExpected.trim() ? Number(form.pagesExpected) : null;
  const pagesValid =
    pagesNumber === null || (Number.isInteger(pagesNumber) && pagesNumber > 0);
  const hasDocumentType = form.documentType.trim().length > 0;
  const hasSource = form.source.trim().length > 0;
  const canSaveDraft = hasDocumentType && pagesValid;
  const canSubmit =
    hasDocumentType &&
    hasSource &&
    pagesValid;

  const payload = (): DraftRequestPayload => ({
    category: form.category,
    documentType: form.documentType.trim(),
    source: form.source.trim(),
    assignee: form.assignee.trim() || caseData.assignedParalegal,
    dueAtRaw: form.dueAtRaw || null,
    pagesExpected: pagesNumber,
  });

  const title = request ? "Edit draft request" : "New document request";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-white/60 bg-white/14 px-5 py-5 backdrop-blur-2xl">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="draft" />
          </div>
          <h2 className="text-subhead font-medium leading-snug text-ink">{title}</h2>
          <p className="mt-0.5 text-meta text-ink-muted">
            Save a draft, or submit when ready to start the request.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
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
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          className="ml-auto"
          disabled={!canSaveDraft}
          onClick={() => onSaveDraft(request?.id ?? null, payload())}
        >
          Save draft
        </Button>
        <Button
          disabled={!canSubmit}
          onClick={() => onSubmitDraft(request?.id ?? null, payload())}
        >
          Submit request
        </Button>
      </div>
    </div>
  );
}
