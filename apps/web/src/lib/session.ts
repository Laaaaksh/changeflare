import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

/** For API route handlers: returns the user, or a ready-to-return 401 response. */
export async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  return { user, unauthorized: null };
}
