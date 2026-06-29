/* ───────────────── Raw JSON (snake_case mirror of the fixture) ─────────────────
   These are the ONLY place raw shapes/strings appear. `reshape.ts` parses them
   into the domain types below exactly once, at the boundary. */

export type Category = "police" | "medical" | "insurance";

export type Status =
  | "draft"
  | "requested"
  | "in_progress"
  | "needs_action"
  | "partially_received"
  | "received"
  | "rejected"
  | "on_hold"
  | "canceled";

export interface RawActivityEntry {
  at: string; // ISO "YYYY-MM-DD"
  text: string;
}

export interface RawRequest {
  id: string;
  category: Category;
  document_type: string;
  source: string;
  status: Status;
  assignee: string;
  requested_at: string | null;
  due_at: string | null;
  updated_at: string;
  pages_received?: number;
  pages_expected?: number;
  action_required?: string;
  reason?: string;
  activity?: RawActivityEntry[];
}

export interface RawCase {
  id: string;
  matter_name: string;
  client_name: string;
  matter_type: string;
  date_of_incident: string;
  assigned_paralegal: string;
  opened_at: string;
}

export interface RawCaseFile {
  case: RawCase;
  requests: RawRequest[];
}

/* ───────────────── Domain (camelCase, parsed) ───────────────── */

/** The triage abstraction: 9 raw statuses collapse to 5 action-buckets. */
export type Bucket = "needs_you" | "in_flight" | "done" | "draft" | "closed";

export type Channel = "web" | "email" | "fax" | "voice" | "sms" | "mail";

export interface ActivityEntry {
  at: Date;
  atRaw: string;
  text: string;
  channel: Channel | null; // inferred only when the text clearly implies it
}

export interface Progress {
  received: number;
  expected: number;
  pct: number;
  tracked: boolean; // false when the request has no page counts at all
}

export interface Request {
  id: string;
  category: Category;
  documentType: string;
  source: string;
  status: Status; // raw status is canonical; bucket is derived, never stored
  assignee: string;

  requestedAt: Date | null;
  dueAt: Date | null;
  updatedAt: Date;
  requestedAtRaw: string | null;
  dueAtRaw: string | null;
  updatedAtRaw: string;

  pagesReceived: number | null;
  pagesExpected: number | null;

  /** action_required ?? reason — one string, so the UI never branches on which key. */
  attentionReason: string | null;

  activity: ActivityEntry[]; // normalized to [] when absent, never undefined
}

export interface DraftRequestPayload {
  category: Category;
  documentType: string;
  source: string;
  assignee: string;
  dueAtRaw: string | null;
  pagesExpected: number | null;
}

export interface Case {
  id: string;
  matterName: string;
  clientName: string;
  matterType: string;
  dateOfIncident: Date;
  dateOfIncidentRaw: string;
  assignedParalegal: string;
  openedAt: Date;
  openedAtRaw: string;
}
