import { describe, expect, it } from "vitest";
import { TODAY, iso } from "@/lib/clock";
import type { DraftRequestPayload, Request } from "@/lib/types";
import { initialState, reducer, type AppState } from "./reducer";

const partialPayload: DraftRequestPayload = {
  category: "medical",
  documentType: "",
  source: "",
  assignee: "Jordan Reyes",
  dueAtRaw: null,
  pagesExpected: null,
};

function makeRequest(overrides: Partial<Request> = {}): Request {
  return {
    id: "req_001",
    category: "medical",
    documentType: "Medical Records",
    source: "Kaiser Permanente",
    status: "draft",
    assignee: "Jordan Reyes",
    requestedAt: null,
    dueAt: null,
    updatedAt: TODAY,
    requestedAtRaw: null,
    dueAtRaw: null,
    updatedAtRaw: iso(TODAY),
    pagesReceived: null,
    pagesExpected: null,
    attentionReason: null,
    activity: [],
    ...overrides,
  };
}

function readyState(requests: Request[]): AppState {
  return {
    ...initialState,
    phase: requests.length ? "ready" : "empty",
    requests,
  };
}

describe("reducer draft experience", () => {
  it("autosaves a partial draft without adding undo history", () => {
    const state = { ...readyState([]), composingDraft: true };

    const next = reducer(state, {
      type: "AUTOSAVE_DRAFT",
      id: "req_new_001",
      payload: partialPayload,
    });

    expect(next.requests).toHaveLength(1);
    expect(next.requests[0]).toMatchObject({
      id: "req_new_001",
      status: "draft",
      documentType: "",
      source: "",
    });
    expect(next.composingDraft).toBe(true);
    expect(next.history).toHaveLength(0);
  });

  it("autosaves an existing draft without appending activity or undo history", () => {
    const activity = [{ at: TODAY, atRaw: iso(TODAY), text: "Draft started", channel: null }];
    const state = readyState([makeRequest({ activity })]);

    const next = reducer(state, {
      type: "AUTOSAVE_DRAFT",
      id: "req_001",
      payload: { ...partialPayload, documentType: "Updated draft" },
    });

    expect(next.requests[0].documentType).toBe("Updated draft");
    expect(next.requests[0].activity).toEqual(activity);
    expect(next.history).toHaveLength(0);
  });

  it("deletes a draft and records one undo snapshot", () => {
    const state = { ...readyState([makeRequest()]), selectedId: "req_001", composingDraft: true };

    const next = reducer(state, { type: "DELETE_DRAFT", id: "req_001" });

    expect(next.requests).toHaveLength(0);
    expect(next.selectedId).toBeNull();
    expect(next.composingDraft).toBe(false);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].label).toBe("Draft deleted");
  });

  it("undo restores a deleted draft", () => {
    const state = { ...readyState([makeRequest()]), selectedId: "req_001" };
    const deleted = reducer(state, { type: "DELETE_DRAFT", id: "req_001" });

    const restored = reducer(deleted, { type: "UNDO" });

    expect(restored.requests).toHaveLength(1);
    expect(restored.requests[0].id).toBe("req_001");
    expect(restored.requests[0].status).toBe("draft");
    expect(restored.history).toHaveLength(0);
  });

  it("replaces the previous undo snapshot when another undoable action happens", () => {
    const request = makeRequest({ status: "in_progress", pagesExpected: 3 });
    const state = readyState([request]);
    const noted = reducer(state, { type: "ADD_NOTE", id: "req_001", text: "Called source" });

    const received = reducer(noted, { type: "MARK_RECEIVED", id: "req_001" });
    const undone = reducer(received, { type: "UNDO" });

    expect(received.history).toHaveLength(1);
    expect(received.history[0].label).toBe("Moved to Collected");
    expect(undone.requests[0].status).toBe("in_progress");
    expect(undone.requests[0].activity).toHaveLength(1);
    expect(undone.history).toHaveLength(0);
  });

  it("ignores delete for non-draft requests", () => {
    const state = readyState([makeRequest({ status: "in_progress" })]);

    const next = reducer(state, { type: "DELETE_DRAFT", id: "req_001" });

    expect(next).toBe(state);
  });

  it("submits a draft to in progress and appends one submit activity", () => {
    const activity = [{ at: TODAY, atRaw: iso(TODAY), text: "Draft started", channel: null }];
    const state = readyState([makeRequest({ activity })]);

    const next = reducer(state, {
      type: "SUBMIT_DRAFT",
      id: "req_001",
      payload: {
        ...partialPayload,
        documentType: "Medical Records",
        source: "Kaiser Permanente",
      },
    });

    expect(next.requests[0].status).toBe("in_progress");
    expect(next.requests[0].requestedAtRaw).toBe(iso(TODAY));
    expect(next.requests[0].activity).toHaveLength(2);
    expect(next.requests[0].activity[1].text).toBe(
      "Submitted draft request - moved to In progress",
    );
  });
});

describe("reducer filter state", () => {
  it("clears category when selecting a status bucket", () => {
    const state = {
      ...readyState([makeRequest()]),
      filter: { bucket: null, category: "medical", includeCanceled: false },
    } satisfies AppState;

    const next = reducer(state, {
      type: "SET_FILTER",
      filter: { bucket: "needs_you", includeCanceled: false },
    });

    expect(next.filter).toEqual({
      bucket: "needs_you",
      category: null,
      includeCanceled: false,
    });
  });

  it("clears status and canceled visibility when selecting a category", () => {
    const state = {
      ...readyState([makeRequest()]),
      filter: { bucket: "closed", category: null, includeCanceled: true },
    } satisfies AppState;

    const next = reducer(state, {
      type: "SET_FILTER",
      filter: { category: "insurance" },
    });

    expect(next.filter).toEqual({
      bucket: null,
      category: "insurance",
      includeCanceled: false,
    });
  });
});
