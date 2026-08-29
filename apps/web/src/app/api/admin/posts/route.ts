import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { excerptFromMarkdown, renderMarkdown } from "@/lib/markdown";
import { uniqueSlug } from "@/lib/slug";
import { normalizeRule } from "@/lib/audience";

export async function GET() {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

interface PostInput {
  title?: string;
  bodyMarkdown?: string;
  coverImageUrl?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  audienceRule?: unknown;
}

export async function POST(request: NextRequest) {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as PostInput | null;
  const title = body?.title?.trim();
  const bodyMarkdown = body?.bodyMarkdown ?? "";
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const slug = await uniqueSlug(title, async (candidate) => {
    const found = await prisma.post.findUnique({ where: { slug: candidate } });
    return found !== null;
  });

  const status = body?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const post = await prisma.post.create({
    data: {
      title,
      slug,
      bodyMarkdown,
      bodyHtml: renderMarkdown(bodyMarkdown),
      excerpt: excerptFromMarkdown(bodyMarkdown),
      coverImageUrl: body?.coverImageUrl || null,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      audienceRule: normalizeRule(body?.audienceRule) as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
