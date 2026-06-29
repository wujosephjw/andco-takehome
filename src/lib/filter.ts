import type { Bucket, Category } from "./types";
import type { FilterSpec } from "./selectors";

export function bucketFilter(bucket: Bucket | null): Pick<FilterSpec, "bucket" | "includeCanceled"> {
  return {
    bucket,
    includeCanceled: bucket === "closed",
  };
}

export function categoryFilter(category: Category | null): FilterSpec {
  return {
    bucket: null,
    category,
    includeCanceled: false,
  };
}
