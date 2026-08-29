import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return withCors(NextResponse.json({ lastReadAt: null }));

  const state = await prisma.readState.findUnique({ where: { externalUserId: userId } });
  return withCors(NextResponse.json({ lastReadAt: state?.lastReadAt.toISOString() ?? null }));
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { userId?: string; lastReadAt?: string } | null;
  const userId = body?.userId;
  const lastReadAt = body?.lastReadAt ? new Date(body.lastReadAt) : null;
  if (!userId || !lastReadAt || Number.isNaN(lastReadAt.getTime())) {
    return withCors(NextResponse.json({ error: "userId and a valid lastReadAt are required." }, { status: 400 }));
  }

  const existing = await prisma.readState.findUnique({ where: { externalUserId: userId } });
  if (!existing || lastReadAt > existing.lastReadAt) {
    await prisma.readState.upsert({
      where: { externalUserId: userId },
      create: { externalUserId: userId, lastReadAt },
      update: { lastReadAt },
    });
  }

  return withCors(NextResponse.json({ ok: true }));
}
