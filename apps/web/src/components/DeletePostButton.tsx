"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
        setPending(true);
        await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
        router.refresh();
      }}
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
