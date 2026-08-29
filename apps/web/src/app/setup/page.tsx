import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthForm } from "@/components/AuthForm";

// Depends on live DB state and must not require a DB connection at build time.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-xl font-bold">Welcome to Changeflare</h1>
        <p className="mt-1 text-sm text-neutral-600">Create the admin account for this instance.</p>
      </div>
      <AuthForm mode="setup" />
    </main>
  );
}
