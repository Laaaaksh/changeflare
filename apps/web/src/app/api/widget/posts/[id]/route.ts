import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true, title: true, bodyHtml: true, coverImageUrl: true, publishedAt: true },
  });
  if (!post) return withCors(NextResponse.json({ error: "Not found." }, { status: 404 }));
  return withCors(NextResponse.json(post));
}
