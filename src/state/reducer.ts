import { TODAY, iso } from "@/lib/clock";
import { resolvedActivityFor } from "@/lib/nextAction";
import { DEFAULT_FILTER, type FilterSpec, type SortKey } from "@/lib/selectors";
import type { Request, Case, ActivityEntry, DraftRequestPayload, Status } from "@/lib/types";
import type { Action } from "./actions";

export interface UndoEntry {
  label: string;
  /** Prior value of just the touched request(s); null means the request was created locally. */
  before: Record<string, Request | null>;
}

export interface AppState {
  phase: "loading" | "ready" | "empty";
  case: Case | null;
  requests: Request[];
  filter: FilterSpec;
  sort: SortKey;
  selectedId: string | null;
  composingDraft: boolean;
  history: UndoEntry[];
}

export const initialState: AppState = {
  phase: "loading",
  case: null,
  requests: [],
  filter: DEFAULT_FILTER,
  sort: "urgency",
  selectedId: null,
  composingDraft: false,
  history: [],
};

const HISTORY_CAP = 10;

function snapshot(
  state: AppState,
  label: string,
  ids: string[],
  { includeMissing = false }: { includeMissing?: boolean } = {},
): UndoEntry[] {
  const before: Record<string, Request | null> = {};
  for (const id of ids) {
    const r = state.requests.find((x) => x.id === id);
    if (r) before[id] = r; // requests are immutable-by-convention → safe to alias
    else if (includeMissing) before[id] = null;
  }
  return [...state.history, { label, before }].slice(-HISTORY_CAP);
}

function patch(requests: Request[], id: string, fn: (r: Request) => Request): Request[] {
  return requests.map((r) => (r.id === id ? fn(r) : r)); // new array + new object
}

function appendActivity(r: Request, text: string): ActivityEntry[] {
  return [...r.activity, { at: TODAY, atRaw: iso(TODAY), text, channel: null }];
}

function parseDate(raw: string | null): Date | null {
  return raw ? new Date(`${raw}T00:00:00Z`) : null;
}

function requestFromDraftPayload(
  id: string,
  payload: DraftRequestPayload,
  status: Extract<Status, "draft" | "in_progress">,
  existing?: Request,
): Request {
  const submitted = status === "in_progress";
  const baseActivity = existing?.activity ?? [];
  return {
    id,
    category: payload.category,
    documentType: payload.documentType,
    source: payload.source,
    status,
    assignee: payload.assignee,
    requestedAt: submitted ? TODAY : null,
    requestedAtRaw: submitted ? iso(TODAY) : null,
    dueAt: parseDate(payload.dueAtRaw),
    dueAtRaw: payload.dueAtRaw,
    updatedAt: TODAY,
    updatedAtRaw: iso(TODAY),
    pagesReceived: existing?.pagesReceived ?? null,
    pagesExpected: payload.pagesExpected,
    attentionReason: null,
    activity: submitted
      ? [
          ...baseActivity,
          {
            at: TODAY,
            atRaw: iso(TODAY),
            text: "Submitted draft request - moved to In progress",
            channel: null,
          },
        ]
      : baseActivity,
  };
}

function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(x)}`);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOADED":
      return {
        ...state,
        phase: action.requests.length ? "ready" : "empty",
        case: action.case,
        requests: action.requests,
      };

    case "RESOLVE_NEEDS_ACTION":
      return {
        ...state,
        composingDraft: false,
        history: snapshot(state, "Moved to In progress", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          status: "in_progress",
          attentionReason: null,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, `${resolvedActivityFor(r)} - moved to In progress`),
        })),
      };

    case "AUTOSAVE_DRAFT":
      return {
        ...state,
        phase: "ready",
        requests: state.requests.some((r) => r.id === action.id)
          ? patch(state.requests, action.id, (r) =>
              r.status === "draft"
                ? requestFromDraftPayload(action.id, action.payload, "draft", r)
                : r,
            )
          : [
              ...state.requests,
              requestFromDraftPayload(action.id, action.payload, "draft"),
            ],
      };

    case "DELETE_DRAFT": {
      const draft = state.requests.find((r) => r.id === action.id);
      if (draft?.status !== "draft") return state;
      const requests = state.requests.filter((r) => r.id !== action.id);
      return {
        ...state,
        phase: requests.length ? "ready" : "empty",
        composingDraft: false,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        history: snapshot(state, "Draft deleted", [action.id]),
        requests,
      };
    }

    case "SUBMIT_DRAFT":
      return {
        ...state,
        phase: "ready",
        composingDraft: false,
        selectedId: action.id,
        history: snapshot(state, "Submitted request", [action.id], { includeMissing: true }),
        requests: state.requests.some((r) => r.id === action.id)
          ? patch(state.requests, action.id, (r) =>
              requestFromDraftPayload(action.id, action.payload, "in_progress", r),
            )
          : [
              ...state.requests,
              requestFromDraftPayload(action.id, action.payload, "in_progress"),
            ],
      };

    case "MARK_RECEIVED":
      return {
        ...state,
        composingDraft: false,
        history: snapshot(state, "Moved to Collected", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          status: "received",
          pagesReceived: r.pagesExpected ?? r.pagesReceived,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, "Marked received - moved to Collected"),
        })),
      };

    case "ADD_NOTE":
      return {
        ...state,
        history: snapshot(state, "Note added", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, action.text),
        })),
      };

    case "FOLLOW_UP":
      return {
        ...state,
        history: snapshot(state, "Follow-up logged", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, "Followed up with source"),
        })),
      };

    case "UNDO": {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const patched = state.requests.flatMap((r) => {
        if (!(r.id in last.before)) return [r];
        const before = last.before[r.id];
        return before ? [before] : [];
      });
      const requests = [
        ...patched,
        ...Object.entries(last.before).flatMap(([id, before]) =>
          before && !patched.some((r) => r.id === id) ? [before] : [],
        ),
      ];
      return {
        ...state,
        phase: requests.length ? "ready" : "empty",
        requests,
        selectedId:
          state.selectedId && requests.some((r) => r.id === state.selectedId)
            ? state.selectedId
            : null,
        composingDraft: false,
        history: state.history.slice(0, -1),
      };
    }

    // UI actions never touch history — undo reverts data, not drawer/filter state.
    case "OPEN_NEW_DRAFT":
      return { ...state, selectedId: null, composingDraft: true };
    case "SET_FILTER":
      return { ...state, filter: { ...state.filter, ...action.filter } };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "OPEN_DRAWER":
      return { ...state, selectedId: action.id, composingDraft: false };
    case "CLOSE_DRAWER":
      return { ...state, selectedId: null, composingDraft: false };

    default:
      return assertNever(action);
  }
}

/** Latest undo label, for the toast ("Moved to Collected - Undo"). */
export function latestUndoLabel(state: AppState): string | null {
  return state.history.length ? state.history[state.history.length - 1].label : null;
}
