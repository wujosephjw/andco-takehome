import raw from "@/data/case-documents.json";
import { loadCaseFile } from "./reshape";
import type { RawCaseFile } from "./types";

/**
 * The single realistic motor-vehicle case, reshaped once at module load.
 * Treated as a fixed local fixture (the brief's framing); in a real app this
 * import becomes a fetch and the loading state below becomes a Suspense boundary.
 */
export const caseFile = loadCaseFile(raw as unknown as RawCaseFile);
