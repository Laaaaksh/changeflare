import { describe, expect, it } from "vitest";
import { excerptFromMarkdown, renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders basic formatting", () => {
    const html = renderMarkdown("**bold** and _italic_ and a [link](https://example.com)");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain('href="https://example.com"');
  });

  it("strips raw <script> tags — this HTML is embedded on third-party sites", () => {
    const html = renderMarkdown('Hello <script>alert(document.cookie)</script> world');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(");
  });

  it("strips inline event handler attributes", () => {
    const html = renderMarkdown('<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("strips javascript: URLs from links", () => {
    const html = renderMarkdown("[click me](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("adds target=_blank and rel=noopener to links", () => {
    const html = renderMarkdown("[docs](https://example.com/docs)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("removes disallowed tags like <iframe> and <style> while keeping their safe siblings", () => {
    const html = renderMarkdown('<iframe src="https://evil.example"></iframe>\n\nSafe paragraph.');
    expect(html).not.toContain("<iframe");
    expect(html).toContain("Safe paragraph.");
  });

  it("allows images with a plain src attribute", () => {
    const html = renderMarkdown("![alt text](https://example.com/cover.png)");
    expect(html).toContain('src="https://example.com/cover.png"');
    expect(html).toContain('alt="alt text"');
  });
});

describe("excerptFromMarkdown", () => {
  it("strips markdown/HTML formatting down to plain text", () => {
    expect(excerptFromMarkdown("**Bold** and a [link](https://example.com)")).toBe("Bold and a link");
  });

  it("truncates long content with an ellipsis", () => {
    const long = "word ".repeat(60).trim();
    const excerpt = excerptFromMarkdown(long, 20);
    expect(excerpt.length).toBeLessThanOrEqual(21);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("leaves short content untouched", () => {
    expect(excerptFromMarkdown("Short update.")).toBe("Short update.");
  });
});
