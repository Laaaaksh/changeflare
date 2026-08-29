import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span aria-hidden>🔥</span> Changeflare
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-neutral-600 hover:text-neutral-900">
              Dashboard
            </Link>
            <Link href="/admin/posts/new" className="text-neutral-600 hover:text-neutral-900">
              New post
            </Link>
            <Link href="/changelog" className="text-neutral-600 hover:text-neutral-900">
              Public page
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-500">{user.email}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
    </div>
  );
}
