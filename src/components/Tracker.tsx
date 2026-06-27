"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { caseFile } from "@/lib/fixture";
import { TODAY } from "@/lib/clock";
import { bucketForStatus } from "@/lib/bucket";
import {
  selectOverview,
  selectNeedsYou,
  selectFiltered,
  type FilterSpec,
} from "@/lib/selectors";
import type { Bucket, Category } from "@/lib/types";
import { reducer, initialState, latestUndoLabel } from "@/state/reducer";
import type { Action } from "@/state/actions";
import { CaseRail } from "./CaseRail";
import { Checklist, type Group } from "./Checklist";
import { DetailPane } from "./DetailPane";
import { DetailDrawer } from "./DetailDrawer";
import { UndoToast, type ToastState } from "./UndoToast";
import type { PreviewMode } from "./StatePreviewSwitcher";

/** Group order + framing — section labels are action-framed, rail labels are bucket names. */
const GROUP_DEF: { bucket: Bucket; label: string; hint?: string }[] = [
  { bucket: "needs_you", label: "Action needed", hint: "Resolve to unblock the case" },
  { bucket: "in_flight", label: "In progress", hint: "Your team is handling these" },
  { bucket: "done", label: "Collected" },
  { bucket: "draft", label: "Draft" },
  { bucket: "closed", label: "Canceled" },
];

export function Tracker() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [preview, setPreview] = useState<PreviewMode>("live");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastSeq = useRef(0);

  useEffect(() => {
    const t = setTimeout(
      () => dispatch({ type: "LOADED", case: caseFile.case, requests: caseFile.requests }),
      350,
    );
    return () => clearTimeout(t);
  }, []);

  function mutate(action: Action, label: string) {
    dispatch(action);
    toastSeq.current += 1;
    setToast({ id: toastSeq.current, label });
  }

  const undo = () => {
    if (!latestUndoLabel(state)) return;
    dispatch({ type: "UNDO" });
    setToast(null);
  };

  const setFilter = (patch: Partial<FilterSpec>) => dispatch({ type: "SET_FILTER", filter: patch });
  const setSort = (sort: typeof state.sort) => dispatch({ type: "SET_SORT", sort });
  const open = (id: string) => dispatch({ type: "OPEN_DRAWER", id });
  const close = () => dispatch({ type: "CLOSE_DRAWER" });

  const showLoading = preview === "loading" || (preview === "live" && state.phase === "loading");
  const requests = useMemo(
    () => (preview === "empty" ? [] : state.requests),
    [preview, state.requests],
  );
  const caseData = state.case;

  const counts = useMemo(() => selectOverview(requests, TODAY), [requests]);
  const byCategory = useMemo(() => {
    const c: Record<Category, number> = { medical: 0, insurance: 0, police: 0 };
    for (const r of requests) if (r.status !== "canceled") c[r.category]++;
    return c;
  }, [requests]);

  // Filter (category + canceled + free-text) and sort, ignoring bucket — we group by bucket.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? requests.filter(
          (r) =>
            r.documentType.toLowerCase().includes(q) || r.source.toLowerCase().includes(q),
        )
      : requests;
    return selectFiltered(matched, { ...state.filter, bucket: null }, state.sort, TODAY);
  }, [requests, query, state.filter, state.sort]);

  const groups: Group[] = useMemo(() => {
    const wanted = state.filter.bucket;
    return GROUP_DEF.filter((g) => !wanted || g.bucket === wanted)
      .map((g) => ({ ...g, items: visible.filter((r) => bucketForStatus(r.status) === g.bucket) }))
      .filter((g) => g.items.length > 0);
  }, [visible, state.filter.bucket]);

  const selected = requests.find((r) => r.id === state.selectedId) ?? null;
  // The pane always shows something useful: the explicit selection, else the most urgent item.
  const paneRequest = selected ?? selectNeedsYou(requests, TODAY)[0] ?? requests[0] ?? null;
  const highlightId = selected?.id ?? paneRequest?.id ?? null;

  const noData = !showLoading && requests.length === 0;
  const filteredEmpty = !showLoading && requests.length > 0 && groups.length === 0;

  const detailHandlers = {
    onResolve: (id: string) => mutate({ type: "RESOLVE_NEEDS_ACTION", id }, "Marked resolved"),
    onMarkReceived: (id: string) => mutate({ type: "MARK_RECEIVED", id }, "Marked received"),
    onFollowUp: (id: string) => mutate({ type: "FOLLOW_UP", id }, "Follow-up logged"),
    onAddNote: (id: string, text: string) => mutate({ type: "ADD_NOTE", id, text }, "Note added"),
  };

  // Initial fetch (case not yet loaded): a brief neutral skeleton, no chrome to flash.
  if (!caseData) {
    return (
      <main className="grid h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3" aria-busy="true" aria-label="Loading case">
          <span className="size-7 animate-pulse rounded-full bg-sunk" />
          <span className="text-meta text-ink-faint">Loading case…</span>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="grid h-dvh grid-cols-1 overflow-hidden lg:grid-cols-[244px_minmax(0,1fr)_400px]">
        <CaseRail
          caseData={caseData}
          counts={counts}
          byCategory={byCategory}
          filter={state.filter}
          query={query}
          onQuery={setQuery}
          onSetFilter={setFilter}
          preview={preview}
          onPreview={setPreview}
        />

        {showLoading ? (
          <MiddleLoading />
        ) : (
          <Checklist
            caseData={caseData}
            groups={groups}
            filter={state.filter}
            counts={counts}
            sort={state.sort}
            onSetSort={setSort}
            onSetFilter={setFilter}
            noData={noData}
            filteredEmpty={filteredEmpty}
            selectedId={highlightId}
            onOpen={open}
            onResolve={detailHandlers.onResolve}
            onFollowUp={detailHandlers.onFollowUp}
          />
        )}

        <DetailPane request={showLoading ? null : paneRequest} {...detailHandlers} />
      </main>

      {/* Mobile/tablet detail overlay — driven by the real selection only */}
      <DetailDrawer request={selected} onClose={close} {...detailHandlers} />

      <UndoToast toast={toast} onUndo={undo} onDismiss={() => setToast(null)} />
    </>
  );
}

function MiddleLoading() {
  return (
    <section className="flex min-h-0 flex-col" aria-busy="true" aria-label="Loading requests">
      <div className="border-b border-hairline px-6 py-4">
        <span className="block h-5 w-44 animate-pulse rounded bg-sunk" />
      </div>
      <div className="space-y-6 px-6 py-6">
        <span className="block h-4 w-28 animate-pulse rounded bg-sunk" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border border-hairline bg-surface" />
          ))}
        </div>
        <span className="block h-4 w-24 animate-pulse rounded bg-sunk" />
        <div className="h-44 animate-pulse rounded-lg border border-hairline bg-surface" />
      </div>
    </section>
  );
}
