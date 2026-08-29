import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugify("New: Dark Mode is Here!")).toBe("new-dark-mode-is-here");
  });

  it("collapses runs of non-alphanumeric characters", () => {
    expect(slugify("v2.0 --- Release   Notes")).toBe("v2-0-release-notes");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  ...leading and trailing...  ")).toBe("leading-and-trailing");
  });

  it("falls back to 'post' for a title with no usable characters", () => {
    expect(slugify("💥💥💥")).toBe("post");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it's free", async () => {
    const slug = await uniqueSlug("Hello World", async () => false);
    expect(slug).toBe("hello-world");
  });

  it("appends an incrementing suffix until a free slug is found", async () => {
    const taken = new Set(["hello-world", "hello-world-2", "hello-world-3"]);
    const slug = await uniqueSlug("Hello World", async (candidate) => taken.has(candidate));
    expect(slug).toBe("hello-world-4");
  });
});
