import type { Case, Request } from "@/lib/types";
import type { FilterSpec, SortKey } from "@/lib/selectors";

export type Action =
  // lifecycle
  | { type: "LOADED"; case: Case; requests: Request[] }
  // data mutations (each pushes an undo snapshot)
  | { type: "RESOLVE_NEEDS_ACTION"; id: string }
  | { type: "MARK_RECEIVED"; id: string }
  | { type: "ADD_NOTE"; id: string; text: string }
  | { type: "FOLLOW_UP"; id: string }
  | { type: "UNDO" }
  // pure UI (never pushes undo history)
  | { type: "SET_FILTER"; filter: Partial<FilterSpec> }
  | { type: "SET_SORT"; sort: SortKey }
  | { type: "OPEN_DRAWER"; id: string }
  | { type: "CLOSE_DRAWER" };
