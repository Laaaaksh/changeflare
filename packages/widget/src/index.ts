import { ChangeflareApi } from "./api.js";
import { getLocalLastReadAt, setLocalLastReadAt } from "./storage.js";
import { computeUnreadCount, latestPublishedAt } from "./unread.js";
import type { ChangeflareOptions, WidgetPost } from "./types.js";
import { WidgetUI } from "./ui.js";

class ChangeflareWidget {
  private api: ChangeflareApi | null = null;
  private ui: WidgetUI | null = null;
  private options: ChangeflareOptions = {};
  private posts: WidgetPost[] = [];

  init(options: ChangeflareOptions = {}): void {
    this.options = { position: "bottom-right", ...options };
    const apiUrl = this.options.apiUrl ?? detectScriptOrigin();
    if (!apiUrl) {
      console.error("changeflare: could not determine apiUrl — pass { apiUrl } explicitly to init()");
      return;
    }
    this.api = new ChangeflareApi(apiUrl);

    const mount = this.options.selector ? document.querySelector<HTMLElement>(this.options.selector) : document.body;
    if (!mount) {
      console.error(`changeflare: selector "${this.options.selector}" did not match an element`);
      return;
    }

    this.ui = new WidgetUI(mount, this.options.selector ? "inline" : (this.options.position ?? "bottom-right"), {
      onOpen: () => this.handleOpen(),
      onSelectPost: (post) => this.handleSelectPost(post),
      onLinkClick: (post) => this.api?.trackPostClick(post.id),
    });

    void this.load();
  }

  /** Update visitor identity/attributes after init (e.g. once a host app knows who the user is). */
  identify(userId: string | undefined, attributes: Record<string, string> | undefined): void {
    this.options.userId = userId;
    this.options.attributes = attributes;
    void this.load();
  }

  private async load(): Promise<void> {
    if (!this.api || !this.ui) return;
    try {
      this.posts = await this.api.fetchPosts(this.options.attributes);
    } catch (error) {
      console.error("changeflare: failed to load posts", error);
      return;
    }
    this.ui.setPosts(this.posts);

    const local = getLocalLastReadAt();
    let lastReadAt = local;
    if (this.options.userId) {
      const server = await this.api.fetchServerLastReadAt(this.options.userId);
      if (server && (!local || Date.parse(server) > Date.parse(local))) lastReadAt = server;
    }
    this.ui.setUnreadCount(computeUnreadCount(this.posts, lastReadAt));
  }

  private handleOpen(): void {
    this.api?.trackWidgetOpen();
    const cursor = latestPublishedAt(this.posts) ?? new Date().toISOString();
    setLocalLastReadAt(cursor);
    if (this.options.userId) this.api?.syncReadState(this.options.userId, cursor);
    this.ui?.setUnreadCount(0);
  }

  private async handleSelectPost(post: WidgetPost): Promise<void> {
    this.api?.trackPostView(post.id);
    const detail = await this.api?.fetchPostDetail(post.id);
    if (detail) this.ui?.showDetailBody(post, detail.bodyHtml);
  }
}

function detectScriptOrigin(): string | null {
  const current = document.currentScript as HTMLScriptElement | null;
  if (current?.src) {
    try {
      return new URL(current.src).origin;
    } catch {
      return null;
    }
  }
  return null;
}

function parseDataAttributes(script: HTMLScriptElement): ChangeflareOptions {
  const options: ChangeflareOptions = {};
  const apiUrl = script.dataset["changeflareApiUrl"];
  const selector = script.dataset["changeflareSelector"];
  const position = script.dataset["changeflarePosition"] as ChangeflareOptions["position"] | undefined;
  const userId = script.dataset["changeflareUserId"];
  const attributesRaw = script.dataset["changeflareAttributes"];
  if (apiUrl) options.apiUrl = apiUrl;
  if (selector) options.selector = selector;
  if (position) options.position = position;
  if (userId) options.userId = userId;
  if (attributesRaw) {
    try {
      options.attributes = JSON.parse(attributesRaw);
    } catch {
      console.error("changeflare: data-changeflare-attributes is not valid JSON");
    }
  }
  return options;
}

const widget = new ChangeflareWidget();
const globalApi = { init: (options?: ChangeflareOptions) => widget.init(options), identify: (userId?: string, attributes?: Record<string, string>) => widget.identify(userId, attributes) };

declare global {
  interface Window {
    Changeflare: typeof globalApi;
  }
}

window.Changeflare = globalApi;

// Zero-config autoload: a bare <script src=".../widget.js"> tag just works.
const selfScript = document.currentScript as HTMLScriptElement | null;
if (selfScript && selfScript.dataset["changeflareManual"] === undefined) {
  widget.init(parseDataAttributes(selfScript));
}

export { widget };
