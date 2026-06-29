import { describe, expect, it } from "vitest";
import { bucketFilter, categoryFilter } from "./filter";

describe("bucketFilter", () => {
  it("keeps category clear and hides canceled requests except for the closed bucket", () => {
    expect(bucketFilter(null)).toEqual({
      bucket: null,
      category: null,
      includeCanceled: false,
    });
    expect(bucketFilter("needs_you")).toEqual({
      bucket: "needs_you",
      category: null,
      includeCanceled: false,
    });
    expect(bucketFilter("closed")).toEqual({
      bucket: "closed",
      category: null,
      includeCanceled: true,
    });
  });
});

describe("categoryFilter", () => {
  it("clears status filters when selecting a category", () => {
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
