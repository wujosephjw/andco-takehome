import { TODAY, iso } from "@/lib/clock";
import { DEFAULT_FILTER, type FilterSpec, type SortKey } from "@/lib/selectors";
import type { Request, Case, ActivityEntry } from "@/lib/types";
import type { Action } from "./actions";

export interface UndoEntry {
  label: string;
  /** Prior value of just the touched request(s), keyed by id — a precise, cheap snapshot. */
  before: Record<string, Request>;
}

export interface AppState {
  phase: "loading" | "ready" | "empty";
  case: Case | null;
  requests: Request[];
  filter: FilterSpec;
  sort: SortKey;
  selectedId: string | null;
  history: UndoEntry[];
}

export const initialState: AppState = {
  phase: "loading",
  case: null,
  requests: [],
  filter: DEFAULT_FILTER,
  sort: "urgency",
  selectedId: null,
  history: [],
};

const HISTORY_CAP = 10;

function snapshot(state: AppState, label: string, ids: string[]): UndoEntry[] {
  const before: Record<string, Request> = {};
  for (const id of ids) {
    const r = state.requests.find((x) => x.id === id);
    if (r) before[id] = r; // requests are immutable-by-convention → safe to alias
  }
  return [...state.history, { label, before }].slice(-HISTORY_CAP);
}

function patch(requests: Request[], id: string, fn: (r: Request) => Request): Request[] {
  return requests.map((r) => (r.id === id ? fn(r) : r)); // new array + new object
}

function appendActivity(r: Request, text: string): ActivityEntry[] {
  return [...r.activity, { at: TODAY, atRaw: iso(TODAY), text, channel: null }];
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
        history: snapshot(state, "Marked resolved", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          status: "in_progress",
          attentionReason: null,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, "Marked resolved — re-submitted to source"),
        })),
      };

    case "MARK_RECEIVED":
      return {
        ...state,
        history: snapshot(state, "Marked received", [action.id]),
        requests: patch(state.requests, action.id, (r) => ({
          ...r,
          status: "received",
          pagesReceived: r.pagesExpected ?? r.pagesReceived,
          updatedAt: TODAY,
          updatedAtRaw: iso(TODAY),
          activity: appendActivity(r, "Marked received"),
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
      return {
        ...state,
        requests: state.requests.map((r) => last.before[r.id] ?? r),
        history: state.history.slice(0, -1),
      };
    }

    // UI actions never touch history — undo reverts data, not drawer/filter state.
    case "SET_FILTER":
      return { ...state, filter: { ...state.filter, ...action.filter } };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "OPEN_DRAWER":
      return { ...state, selectedId: action.id };
    case "CLOSE_DRAWER":
      return { ...state, selectedId: null };

    default:
      return assertNever(action);
  }
}

/** Latest undo label, for the toast ("Marked received — Undo"). */
export function latestUndoLabel(state: AppState): string | null {
  return state.history.length ? state.history[state.history.length - 1].label : null;
}
