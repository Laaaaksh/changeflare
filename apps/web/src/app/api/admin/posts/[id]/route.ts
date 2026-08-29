import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { excerptFromMarkdown, renderMarkdown } from "@/lib/markdown";
import { uniqueSlug } from "@/lib/slug";
import { normalizeRule } from "@/lib/audience";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post });
}

interface PostInput {
  title?: string;
  bodyMarkdown?: string;
  coverImageUrl?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  audienceRule?: unknown;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as PostInput | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const title = body.title?.trim() ?? existing.title;
  const bodyMarkdown = body.bodyMarkdown ?? existing.bodyMarkdown;
  const status = body.status === "PUBLISHED" || body.status === "DRAFT" ? body.status : existing.status;

  let slug = existing.slug;
  if (title !== existing.title) {
    slug = await uniqueSlug(title, async (candidate) => {
      if (candidate === existing.slug) return false;
      const found = await prisma.post.findUnique({ where: { slug: candidate } });
      return found !== null;
    });
  }

  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = status === "PUBLISHED";

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      bodyMarkdown,
      bodyHtml: renderMarkdown(bodyMarkdown),
      excerpt: excerptFromMarkdown(bodyMarkdown),
      coverImageUrl: body.coverImageUrl === undefined ? existing.coverImageUrl : body.coverImageUrl || null,
      status,
      publishedAt: !wasPublished && willBePublished ? new Date() : existing.publishedAt,
      audienceRule:
        body.audienceRule === undefined
          ? ((existing.audienceRule ?? undefined) as unknown as Prisma.InputJsonValue | undefined)
          : (normalizeRule(body.audienceRule) as unknown as Prisma.InputJsonValue),
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { unauthorized } = await requireApiUser();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.post.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
