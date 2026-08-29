"use client";

import { useState } from "react";

export function InstallSnippet({ origin }: { origin: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${origin}/widget.js" async></script>`;

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-bold">Install the widget</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Paste this before <code className="rounded bg-neutral-100 px-1">&lt;/body&gt;</code> on any page. It adds a
        bell icon in the bottom-right corner.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <pre className="flex-1 overflow-x-auto rounded-md bg-neutral-900 px-3 py-2 text-xs text-neutral-100">
          <code>{snippet}</code>
        </pre>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Pass <code className="rounded bg-neutral-100 px-1">data-changeflare-user-id</code> and{" "}
        <code className="rounded bg-neutral-100 px-1">data-changeflare-attributes</code> (a JSON object) on the
        script tag for read-state sync and audience targeting, or call{" "}
        <code className="rounded bg-neutral-100 px-1">window.Changeflare.identify(userId, attributes)</code> after a
        user logs in.
      </p>
    </section>
  );
}
