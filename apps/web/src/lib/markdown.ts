import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Post bodies are rendered as raw HTML inside the embeddable widget, which runs
 * on someone else's site. Sanitizing once here — at write time, not read time —
 * means every reader (widget, public page) gets the same safe HTML without
 * re-implementing this allowlist in the tiny client bundle.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "b", "i", "u", "s", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "img", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: true });
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
  const plain = sanitizeHtml(marked.parse(markdown, { async: false, gfm: true }), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
