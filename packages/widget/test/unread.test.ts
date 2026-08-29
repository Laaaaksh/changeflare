import { describe, expect, it } from "vitest";
import { computeUnreadCount, latestPublishedAt } from "../src/unread.js";
import type { WidgetPost } from "../src/types.js";

function post(id: string, publishedAt: string): WidgetPost {
  return { id, slug: id, title: id, excerpt: "", coverImageUrl: null, publishedAt };
}

describe("computeUnreadCount", () => {
  it("treats everything as unread when nothing has ever been read", () => {
    const posts = [post("a", "2026-01-01T00:00:00Z"), post("b", "2026-02-01T00:00:00Z")];
    expect(computeUnreadCount(posts, null)).toBe(2);
  });

  it("only counts posts published after lastReadAt", () => {
    const posts = [post("a", "2026-01-01T00:00:00Z"), post("b", "2026-02-01T00:00:00Z"), post("c", "2026-03-01T00:00:00Z")];
    expect(computeUnreadCount(posts, "2026-02-15T00:00:00Z")).toBe(1);
  });

  it("returns zero once the visitor has read past the newest post", () => {
    const posts = [post("a", "2026-01-01T00:00:00Z")];
    expect(computeUnreadCount(posts, "2026-06-01T00:00:00Z")).toBe(0);
  });

  it("falls back to treating all posts unread on a corrupt lastReadAt value", () => {
    const posts = [post("a", "2026-01-01T00:00:00Z")];
    expect(computeUnreadCount(posts, "not-a-date")).toBe(1);
  });

  it("handles an empty post list", () => {
    expect(computeUnreadCount([], null)).toBe(0);
  });
});

describe("latestPublishedAt", () => {
  it("returns null for an empty list", () => {
    expect(latestPublishedAt([])).toBeNull();
  });

  it("finds the most recently published post regardless of input order", () => {
    const posts = [post("a", "2026-03-01T00:00:00Z"), post("b", "2026-01-01T00:00:00Z"), post("c", "2026-02-01T00:00:00Z")];
    expect(latestPublishedAt(posts)).toBe("2026-03-01T00:00:00Z");
  });
});
