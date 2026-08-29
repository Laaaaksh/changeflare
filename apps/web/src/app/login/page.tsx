import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthForm } from "@/components/AuthForm";

// Depends on live DB state and must not require a DB connection at build time.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect("/setup");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-xl font-bold">Log in to Changeflare</h1>
      </div>
      <AuthForm mode="login" />
    </main>
  );
}
