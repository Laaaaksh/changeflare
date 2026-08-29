import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Depends on live DB state (whether an admin exists yet) — must never be
// statically cached, and must not require a DB connection at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userCount = await prisma.user.count();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span aria-hidden>🔥</span> Changeflare
      </div>
      <p className="max-w-md text-neutral-600">
        A self-hosted, embeddable changelog widget. This instance is running — head to the admin
        dashboard to write your first post, or view the public changelog page.
      </p>
      <div className="flex gap-3">
        <Link
          href={userCount === 0 ? "/setup" : "/admin"}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {userCount === 0 ? "Create admin account" : "Go to dashboard"}
        </Link>
        <Link
          href="/changelog"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          View public changelog
        </Link>
      </div>
    </main>
  );
}
