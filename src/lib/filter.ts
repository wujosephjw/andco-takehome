import type { Bucket } from "./types";
import type { FilterSpec } from "./selectors";

export function bucketFilter(bucket: Bucket | null): Pick<FilterSpec, "bucket" | "includeCanceled"> {
  return {
    bucket,
    includeCanceled: bucket === "closed",
  };
}
