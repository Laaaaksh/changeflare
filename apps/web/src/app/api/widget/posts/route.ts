import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchesAudience, parseAttributesParam } from "@/lib/audience";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const attributes = parseAttributesParam(request.nextUrl.searchParams.get("attributes"));

  const published = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      audienceRule: true,
    },
    take: 50,
  });

  const posts = published
    .filter((post) => matchesAudience(post.audienceRule, attributes))
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }));

  return withCors(NextResponse.json({ posts }));
}
