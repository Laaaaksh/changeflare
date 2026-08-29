"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";

interface AudienceCondition {
  attribute: string;
  value: string;
}

interface InitialPost {
  id: string;
  title: string;
  bodyMarkdown: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  audienceRule: unknown;
}

function toConditions(rule: unknown): AudienceCondition[] {
  if (!Array.isArray(rule)) return [];
  return rule.filter(
    (item): item is AudienceCondition =>
      typeof item === "object" && item !== null && typeof item.attribute === "string" && typeof item.value === "string",
  );
}

export function PostEditor({ initialPost }: { initialPost?: InitialPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [bodyMarkdown, setBodyMarkdown] = useState(initialPost?.bodyMarkdown ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialPost?.status ?? "DRAFT");
  const [conditions, setConditions] = useState<AudienceCondition[]>(toConditions(initialPost?.audienceRule));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewHtml = useMemo(() => {
    try {
      return marked.parse(bodyMarkdown || "*Nothing to preview yet.*", { async: false, gfm: true, breaks: true });
    } catch {
      return "";
    }
  }, [bodyMarkdown]);

  async function save(nextStatus: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        bodyMarkdown,
        coverImageUrl: coverImageUrl || null,
        status: nextStatus,
        audienceRule: conditions.filter((c) => c.attribute.trim() && c.value.trim()),
      };
      const res = await fetch(initialPost ? `/api/admin/posts/${initialPost.id}` : "/api/admin/posts", {
        method: initialPost ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Failed to save.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New: dark mode is here"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cover" className="text-sm font-medium">
          Cover image URL <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="cover"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="text-sm font-medium">
            Body <span className="font-normal text-neutral-400">(Markdown)</span>
          </label>
          <textarea
            id="body"
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={16}
            className="rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Preview</span>
          <div
            className="prose-body flex-1 overflow-y-auto rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            style={{ minHeight: "24rem" }}
            dangerouslySetInnerHTML={{ __html: previewHtml as string }}
          />
        </div>
      </div>

      <div className="rounded-md border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Audience targeting</h3>
          <button
            type="button"
            onClick={() => setConditions([...conditions, { attribute: "", value: "" }])}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            + Add condition
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Leave empty to show this post to everyone. Otherwise it only shows to visitors whose widget attributes
          match every condition below (e.g. <code className="rounded bg-neutral-100 px-1">plan = pro</code>).
        </p>
        {conditions.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={condition.attribute}
                  onChange={(e) => {
                    const next = [...conditions];
                    next[index] = { ...next[index]!, attribute: e.target.value };
                    setConditions(next);
                  }}
                  placeholder="attribute (e.g. plan)"
                  className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                />
                <span className="text-neutral-400">=</span>
                <input
                  value={condition.value}
                  onChange={(e) => {
                    const next = [...conditions];
                    next[index] = { ...next[index]!, value: e.target.value };
                    setConditions(next);
                  }}
                  placeholder="value (e.g. pro)"
                  className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving || !title.trim()}
          onClick={() => save("PUBLISHED")}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {status === "PUBLISHED" ? "Save" : "Publish"}
        </button>
        <button
          type="button"
          disabled={saving || !title.trim()}
          onClick={() => save("DRAFT")}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          Save as draft
        </button>
      </div>
    </div>
  );
}
