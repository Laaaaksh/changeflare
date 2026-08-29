import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.post
    .updateMany({ where: { id, status: "PUBLISHED" }, data: { views: { increment: 1 } } })
    .catch(() => null);
  return withCors(new NextResponse(null, { status: 204 }));
}
