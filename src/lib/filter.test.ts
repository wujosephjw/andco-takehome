import { describe, expect, it } from "vitest";
import { bucketFilter, categoryFilter } from "./filter";

describe("bucketFilter", () => {
  it("keeps canceled requests hidden except for the closed bucket", () => {
    expect(bucketFilter(null)).toEqual({ bucket: null, includeCanceled: false });
    expect(bucketFilter("needs_you")).toEqual({ bucket: "needs_you", includeCanceled: false });
    expect(bucketFilter("closed")).toEqual({ bucket: "closed", includeCanceled: true });
  });

  it("makes category filters exclusive with status filters", () => {
    expect(categoryFilter("medical")).toEqual({
      bucket: null,
      category: "medical",
      includeCanceled: false,
    });
    expect(categoryFilter(null)).toEqual({
      bucket: null,
      category: null,
      includeCanceled: false,
    });
  });
});
