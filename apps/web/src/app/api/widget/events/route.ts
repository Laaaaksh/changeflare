import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { type?: string } | null;
  if (body?.type === "widget_open") {
    await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", widgetOpens: 1 },
      update: { widgetOpens: { increment: 1 } },
    });
  }
  return withCors(new NextResponse(null, { status: 204 }));
}
