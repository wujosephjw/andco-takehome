"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { caseFile } from "@/lib/fixture";
import { TODAY } from "@/lib/clock";
import {
  selectOverview,
  selectNeedsYou,
  selectFiltered,
  countByBucket,
  DEFAULT_FILTER,
  type SortKey,
  type FilterSpec,
} from "@/lib/selectors";
import { reducer, initialState, latestUndoLabel } from "@/state/reducer";
import type { Action } from "@/state/actions";
import { OverviewStrip } from "./OverviewStrip";
import { NeedsYouSection } from "./NeedsYouSection";
import { FilterSortBar } from "./FilterSortBar";
import { RequestList } from "./RequestList";
import { DetailDrawer } from "./DetailDrawer";
import { LoadingState } from "./LoadingState";
import { UndoToast, type ToastState } from "./UndoToast";
import { StatePreviewSwitcher, type PreviewMode } from "./StatePreviewSwitcher";

export function Tracker() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [preview, setPreview] = useState<PreviewMode>("live");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastSeq = useRef(0);

  // Load the fixture behind a short delay so the loading skeleton is real, not
  // just a preview. In a backend-backed app this becomes a fetch + Suspense.
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
  const setSort = (sort: SortKey) => dispatch({ type: "SET_SORT", sort });
  const open = (id: string) => dispatch({ type: "OPEN_DRAWER", id });
  const close = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);

  // Preview switcher overrides what we render without touching real state.
  const showLoading = preview === "loading" || (preview === "live" && state.phase === "loading");
  const requests = useMemo(
    () => (preview === "empty" ? [] : state.requests),
    [preview, state.requests],
  );
  const caseData = state.case;

  const counts = useMemo(() => selectOverview(requests, TODAY), [requests]);
  const needsYou = useMemo(() => selectNeedsYou(requests, TODAY), [requests]);
  const byBucket = useMemo(() => countByBucket(requests), [requests]);
  const filtered = useMemo(
    () => selectFiltered(requests, state.filter, state.sort, TODAY),
    [requests, state.filter, state.sort],
  );
  const hasCanceled = requests.some((r) => r.status === "canceled");
  const selected = requests.find((r) => r.id === state.selectedId) ?? null;

  return (
    <main className="mx-auto w-full max-w-[960px] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-7 flex items-start justify-between gap-4">
        {caseData ? (
          <div>
            <p className="text-label font-medium uppercase tracking-wide text-ink-faint">
              Document requests
            </p>
            <h1 className="mt-1 font-display text-display text-ink">{caseData.matterName}</h1>
            <p className="mt-1.5 text-meta text-ink-muted">
              {caseData.clientName} · {caseData.matterType} · Paralegal{" "}
              {caseData.assignedParalegal}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="block h-3 w-24 animate-pulse rounded bg-sunk" />
            <span className="block h-7 w-64 animate-pulse rounded bg-sunk" />
          </div>
        )}
        <StatePreviewSwitcher mode={preview} onChange={setPreview} />
      </div>

      {showLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-7">
          <OverviewStrip counts={counts} />

          <NeedsYouSection
            requests={needsYou}
            onResolve={(id) => mutate({ type: "RESOLVE_NEEDS_ACTION", id }, "Marked resolved")}
            onFollowUp={(id) => mutate({ type: "FOLLOW_UP", id }, "Follow-up logged")}
            onOpen={open}
          />

          <section className="space-y-3">
            <h2 className="font-display text-section text-ink">All requests</h2>
            <FilterSortBar
              filter={state.filter}
              sort={state.sort}
              byBucket={byBucket}
              total={counts.total}
              hasCanceled={hasCanceled}
              onSetFilter={setFilter}
              onSetSort={setSort}
            />
            <RequestList
              requests={filtered}
              onOpen={open}
              filteredToZero={requests.length > 0 && filtered.length === 0}
              onClearFilters={() => setFilter(DEFAULT_FILTER)}
            />
          </section>
        </div>
      )}

      <DetailDrawer
        request={selected}
        onClose={close}
        onResolve={(id) => mutate({ type: "RESOLVE_NEEDS_ACTION", id }, "Marked resolved")}
        onMarkReceived={(id) => mutate({ type: "MARK_RECEIVED", id }, "Marked received")}
        onFollowUp={(id) => mutate({ type: "FOLLOW_UP", id }, "Follow-up logged")}
        onAddNote={(id, text) => mutate({ type: "ADD_NOTE", id, text }, "Note added")}
      />

      <UndoToast toast={toast} onUndo={undo} onDismiss={() => setToast(null)} />
    </main>
  );
}
