import type {
  RawCaseFile,
  RawRequest,
  RawCase,
  RawActivityEntry,
  Request,
  Case,
  ActivityEntry,
  Channel,
} from "./types";

function parseDate(s: string | null): Date | null {
  return s ? new Date(`${s}T00:00:00Z`) : null;
}

/**
 * Light, honest channel inference — only when the activity text clearly implies
 * a channel (Andco's product surfaces these prominently). Returns null otherwise;
 * we never invent a channel the data doesn't support.
 */
function inferChannel(text: string): Channel | null {
  const t = text.toLowerCase();
  if (t.includes("portal") || t.includes("online") || t.includes("website")) return "web";
  if (t.includes("fax")) return "fax";
  if (t.includes("email") || t.includes("e-mail")) return "email";
  if (t.includes("call") || t.includes("phone") || t.includes("voicemail")) return "voice";
  if (t.includes("sms") || t.includes("text message")) return "sms";
  if (t.includes("mailed") || t.includes("postal") || t.includes("usps")) return "mail";
  return null;
}

function reshapeActivity(raw: RawActivityEntry): ActivityEntry {
  return {
    at: new Date(`${raw.at}T00:00:00Z`),
    atRaw: raw.at,
    text: raw.text,
    channel: inferChannel(raw.text),
  };
}

export function reshapeRequest(raw: RawRequest): Request {
  return {
    id: raw.id,
    category: raw.category,
    documentType: raw.document_type,
    source: raw.source,
    status: raw.status,
    assignee: raw.assignee,

    requestedAt: parseDate(raw.requested_at),
    dueAt: parseDate(raw.due_at),
    updatedAt: new Date(`${raw.updated_at}T00:00:00Z`),
    requestedAtRaw: raw.requested_at,
    dueAtRaw: raw.due_at,
    updatedAtRaw: raw.updated_at,

    pagesReceived: raw.pages_received ?? null,
    pagesExpected: raw.pages_expected ?? null,

    attentionReason: raw.action_required ?? raw.reason ?? null,
    activity: (raw.activity ?? []).map(reshapeActivity),
  };
}

export function reshapeCase(raw: RawCase): Case {
  return {
    id: raw.id,
    matterName: raw.matter_name,
    clientName: raw.client_name,
    matterType: raw.matter_type,
    dateOfIncident: new Date(`${raw.date_of_incident}T00:00:00Z`),
    dateOfIncidentRaw: raw.date_of_incident,
    assignedParalegal: raw.assigned_paralegal,
    openedAt: new Date(`${raw.opened_at}T00:00:00Z`),
    openedAtRaw: raw.opened_at,
  };
}

export function loadCaseFile(file: RawCaseFile): { case: Case; requests: Request[] } {
  return {
    case: reshapeCase(file.case),
    requests: file.requests.map(reshapeRequest),
  };
}
