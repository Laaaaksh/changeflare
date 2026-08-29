import type { WidgetPost } from "./types.js";

/** Number of posts published after lastReadAt. lastReadAt of null means nothing has ever been read. */
export function computeUnreadCount(posts: WidgetPost[], lastReadAt: string | null): number {
  if (!lastReadAt) return posts.length;
  const lastReadTime = Date.parse(lastReadAt);
  if (Number.isNaN(lastReadTime)) return posts.length;
  return posts.filter((post) => Date.parse(post.publishedAt) > lastReadTime).length;
}

/** The read-state cursor to persist after the visitor has seen the current post list. */
export function latestPublishedAt(posts: WidgetPost[]): string | null {
  if (posts.length === 0) return null;
  return posts.reduce(
    (latest, post) => (Date.parse(post.publishedAt) > Date.parse(latest) ? post.publishedAt : latest),
    posts[0]!.publishedAt,
  );
}
