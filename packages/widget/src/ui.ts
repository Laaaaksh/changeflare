import type { WidgetPost } from "./types.js";

const BELL_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

const STYLES = `
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.cf-root { position: fixed; z-index: 2147483000; }
.cf-root.bottom-right { bottom: 20px; right: 20px; }
.cf-root.bottom-left { bottom: 20px; left: 20px; }
.cf-root.top-right { top: 20px; right: 20px; }
.cf-root.top-left { top: 20px; left: 20px; }
.cf-root.inline { position: relative; display: inline-block; }
.cf-root.inline .cf-panel { top: 56px; bottom: auto; right: 0; }
.cf-trigger {
  position: relative; width: 44px; height: 44px; border-radius: 999px; border: none;
  background: #171717; color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.25); transition: transform 0.15s ease;
}
.cf-trigger:hover { transform: scale(1.05); }
.cf-badge {
  position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 4px;
  border-radius: 999px; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; border: 2px solid #fff;
}
.cf-panel {
  position: absolute; bottom: 56px; right: 0; width: 360px; max-width: calc(100vw - 40px);
  max-height: 70vh; background: #fff; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; overflow: hidden; opacity: 0; transform: translateY(8px) scale(0.98);
  pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease; color: #171717;
}
.cf-root.top-right .cf-panel, .cf-root.top-left .cf-panel { bottom: auto; top: 56px; }
.cf-root.bottom-left .cf-panel, .cf-root.top-left .cf-panel { right: auto; left: 0; }
.cf-panel.cf-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.cf-header {
  display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
  border-bottom: 1px solid #eee; font-weight: 700; font-size: 14px;
}
.cf-close, .cf-back { background: none; border: none; cursor: pointer; color: #666; font-size: 13px; padding: 4px; }
.cf-list { overflow-y: auto; padding: 4px 0; }
.cf-item { display: block; width: 100%; text-align: left; padding: 12px 16px; border: none; background: none; cursor: pointer; border-bottom: 1px solid #f3f3f3; }
.cf-item:hover { background: #fafafa; }
.cf-item img { width: 100%; border-radius: 8px; margin-bottom: 8px; display: block; }
.cf-item-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
.cf-item-excerpt { font-size: 13px; color: #666; margin: 0; line-height: 1.4; }
.cf-item-date { font-size: 11px; color: #999; margin-top: 6px; }
.cf-empty { padding: 32px 16px; text-align: center; color: #888; font-size: 13px; }
.cf-detail { padding: 16px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
.cf-detail img { max-width: 100%; border-radius: 8px; }
.cf-detail h1 { font-size: 17px; margin: 0 0 4px; }
.cf-detail .cf-item-date { margin-bottom: 12px; }
`;

export interface WidgetHandlers {
  onOpen: () => void;
  onSelectPost: (post: WidgetPost) => void;
  onLinkClick: (post: WidgetPost) => void;
}

export class WidgetUI {
  private readonly host: HTMLElement;
  private readonly shadow: ShadowRoot;
  private readonly triggerEl: HTMLButtonElement;
  private readonly badgeEl: HTMLSpanElement;
  private readonly panelEl: HTMLDivElement;
  private readonly bodyEl: HTMLDivElement;
  private open = false;
  private posts: WidgetPost[] = [];

  constructor(
    mountPoint: HTMLElement,
    position: string,
    private readonly handlers: WidgetHandlers,
  ) {
    this.host = document.createElement("div");
    mountPoint.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    this.shadow.appendChild(style);

    const root = document.createElement("div");
    root.className = `cf-root ${position}`;

    this.triggerEl = document.createElement("button");
    this.triggerEl.className = "cf-trigger";
    this.triggerEl.setAttribute("aria-label", "Changelog");
    this.triggerEl.innerHTML = BELL_SVG;
    this.badgeEl = document.createElement("span");
    this.badgeEl.className = "cf-badge";
    this.badgeEl.style.display = "none";
    this.triggerEl.appendChild(this.badgeEl);
    this.triggerEl.addEventListener("click", () => this.toggle());

    this.panelEl = document.createElement("div");
    this.panelEl.className = "cf-panel";
    this.bodyEl = document.createElement("div");
    this.panelEl.appendChild(this.bodyEl);

    root.appendChild(this.panelEl);
    root.appendChild(this.triggerEl);
    this.shadow.appendChild(root);

    this.renderList();
  }

  setPosts(posts: WidgetPost[]): void {
    this.posts = posts;
    if (!this.bodyEl.querySelector(".cf-detail")) this.renderList();
  }

  setUnreadCount(count: number): void {
    if (count <= 0) {
      this.badgeEl.style.display = "none";
      return;
    }
    this.badgeEl.style.display = "flex";
    this.badgeEl.textContent = count > 9 ? "9+" : String(count);
  }

  private toggle(): void {
    this.open = !this.open;
    this.panelEl.classList.toggle("cf-open", this.open);
    if (this.open) this.handlers.onOpen();
  }

  private renderList(): void {
    this.bodyEl.innerHTML = "";
    const header = document.createElement("div");
    header.className = "cf-header";
    header.innerHTML = `<span>What's new</span>`;
    const close = document.createElement("button");
    close.className = "cf-close";
    close.textContent = "Close";
    close.addEventListener("click", () => this.toggle());
    header.appendChild(close);
    this.bodyEl.appendChild(header);

    if (this.posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cf-empty";
      empty.textContent = "No updates yet.";
      this.bodyEl.appendChild(empty);
      return;
    }

    const list = document.createElement("div");
    list.className = "cf-list";
    for (const post of this.posts) {
      const item = document.createElement("button");
      item.className = "cf-item";
      const img = post.coverImageUrl ? `<img src="${escapeAttr(post.coverImageUrl)}" alt="" />` : "";
      item.innerHTML = `${img}<p class="cf-item-title">${escapeHtml(post.title)}</p><p class="cf-item-excerpt">${escapeHtml(post.excerpt)}</p><p class="cf-item-date">${formatDate(post.publishedAt)}</p>`;
      item.addEventListener("click", () => {
        this.handlers.onSelectPost(post);
        this.renderDetail(post);
      });
      list.appendChild(item);
    }
    this.bodyEl.appendChild(list);
  }

  private renderDetail(post: WidgetPost, bodyHtml?: string): void {
    this.bodyEl.innerHTML = "";
    const header = document.createElement("div");
    header.className = "cf-header";
    const back = document.createElement("button");
    back.className = "cf-back";
    back.textContent = "← Back";
    back.addEventListener("click", () => this.renderList());
    header.appendChild(back);
    const close = document.createElement("button");
    close.className = "cf-close";
    close.textContent = "Close";
    close.addEventListener("click", () => this.toggle());
    header.appendChild(close);
    this.bodyEl.appendChild(header);

    const detail = document.createElement("div");
    detail.className = "cf-detail";
    const img = post.coverImageUrl ? `<img src="${escapeAttr(post.coverImageUrl)}" alt="" />` : "";
    detail.innerHTML = `${img}<h1>${escapeHtml(post.title)}</h1><p class="cf-item-date">${formatDate(post.publishedAt)}</p><div class="cf-detail-body">${bodyHtml ?? escapeHtml(post.excerpt)}</div>`;
    this.bodyEl.appendChild(detail);

    detail.addEventListener("click", (event) => {
      const target = (event.target as HTMLElement).closest("a");
      if (target) this.handlers.onLinkClick(post);
    });
  }

  showDetailBody(post: WidgetPost, bodyHtml: string): void {
    this.renderDetail(post, bodyHtml);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
