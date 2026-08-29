import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function GET() {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const publishedCount = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const draftCount = await prisma.post.count({ where: { status: "DRAFT" } });

  return NextResponse.json({
    widgetOpens: settings?.widgetOpens ?? 0,
    publishedCount,
    draftCount,
  });
}
