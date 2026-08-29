export interface AudienceCondition {
  attribute: string;
  value: string;
}

/** null/empty means "show to everyone". Every condition must match (AND). */
export type AudienceRule = AudienceCondition[] | null;

export interface WidgetPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: string;
}

export interface WidgetPostsResponse {
  posts: WidgetPost[];
}

export interface ChangeflareOptions {
  /** Base URL of the Changeflare instance. Defaults to the origin the widget script was loaded from. */
  apiUrl?: string;
  /** CSS selector of an element to mount the trigger button inside. Defaults to a floating button. */
  selector?: string;
  /** Corner to float the trigger button in when no selector is given. */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Stable external id for the visitor, used to sync read state across devices/browsers. */
  userId?: string;
  /** Arbitrary key/value attributes used for audience targeting (e.g. { plan: "pro" }). */
  attributes?: Record<string, string>;
}
