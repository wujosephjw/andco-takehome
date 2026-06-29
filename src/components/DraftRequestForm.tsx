"use client";

import { useEffect, useRef, useState } from "react";
import type { Case, Category, DraftRequestPayload, Request } from "@/lib/types";
import { categoryLabel } from "@/lib/tokens";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Check, ChevronDown, Close } from "./icons";

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

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-meta font-medium text-ink-muted">{label}</span>
      {children}
    </div>
  );
}

function CategoryMenu({
  value,
  onChange,
}: {
  value: Category;
  onChange: (category: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeFromOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative z-50">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="liquid-control glass-focus inline-flex h-10 w-full items-center justify-between gap-3 rounded-full border border-white/70 bg-glass-strong px-4 text-left text-body text-ink shadow-rest hover:bg-white/62 focus-visible:outline-none"
      >
        <span>{categoryLabel[value]}</span>
        <ChevronDown className={`size-3.5 text-ink-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Category"
          className="liquid-popover absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-lift"
        >
          {CATEGORIES.map((category) => {
            const active = category === value;
            return (
              <button
                key={category}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(category);
                  setOpen(false);
                }}
                className={`liquid-row flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-body ${
                  active
                    ? "bg-white/64 font-medium text-ink shadow-rest ring-1 ring-white/60 focus-visible:outline-none"
                    : "text-ink-muted hover:bg-white/55 hover:text-ink focus-visible:outline-none"
                }`}
              >
                {categoryLabel[category]}
                {active && <Check className="size-3.5 text-ink-muted" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
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
  const canSubmit =
    form.documentType.trim().length > 0 &&
    form.source.trim().length > 0 &&
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
            Save it as a draft or submit it to move it into progress.
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
        <FieldBlock label="Category">
          <CategoryMenu
            value={form.category}
            onChange={(category) => setForm((value) => ({ ...value, category }))}
          />
        </FieldBlock>

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
          disabled={!canSubmit}
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
