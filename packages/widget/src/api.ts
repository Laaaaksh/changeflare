import type { WidgetPost, WidgetPostsResponse } from "./types.js";

export class ChangeflareApi {
  constructor(private readonly baseUrl: string) {}

  async fetchPosts(attributes: Record<string, string> | undefined): Promise<WidgetPost[]> {
    const url = new URL("/api/widget/posts", this.baseUrl);
    if (attributes && Object.keys(attributes).length > 0) {
      url.searchParams.set("attributes", JSON.stringify(attributes));
    }
    const res = await fetch(url.toString(), { credentials: "omit" });
    if (!res.ok) throw new Error(`changeflare: failed to load posts (${res.status})`);
    const data = (await res.json()) as WidgetPostsResponse;
    return data.posts;
  }

  async fetchPostDetail(postId: string): Promise<{ bodyHtml: string } | null> {
    const url = new URL(`/api/widget/posts/${postId}`, this.baseUrl);
    const res = await fetch(url.toString(), { credentials: "omit" });
    if (!res.ok) return null;
    return (await res.json()) as { bodyHtml: string };
  }

  async fetchServerLastReadAt(userId: string): Promise<string | null> {
    const url = new URL("/api/widget/read-state", this.baseUrl);
    url.searchParams.set("userId", userId);
    const res = await fetch(url.toString(), { credentials: "omit" });
    if (!res.ok) return null;
    const data = (await res.json()) as { lastReadAt: string | null };
    return data.lastReadAt;
  }

  /** Best-effort — a failed analytics call must never break the widget UI. */
  syncReadState(userId: string, lastReadAt: string): void {
    void fetch(new URL("/api/widget/read-state", this.baseUrl).toString(), {
      method: "PUT",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, lastReadAt }),
      keepalive: true,
    }).catch(() => {});
  }

  trackWidgetOpen(): void {
    void fetch(new URL("/api/widget/events", this.baseUrl).toString(), {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "widget_open" }),
      keepalive: true,
    }).catch(() => {});
  }

  trackPostView(postId: string): void {
    void fetch(new URL(`/api/widget/posts/${postId}/view`, this.baseUrl).toString(), {
      method: "POST",
      credentials: "omit",
      keepalive: true,
    }).catch(() => {});
  }

  trackPostClick(postId: string): void {
    void fetch(new URL(`/api/widget/posts/${postId}/click`, this.baseUrl).toString(), {
      method: "POST",
      credentials: "omit",
      keepalive: true,
    }).catch(() => {});
  }
}
