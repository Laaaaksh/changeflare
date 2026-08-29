import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function ChangelogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!post) notFound();

  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => null);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/changelog" className="text-sm text-neutral-500 hover:underline">
        ← All updates
      </Link>
      <article className="mt-4">
        <p className="text-xs text-neutral-500">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
            : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>
        {post.coverImageUrl && <img src={post.coverImageUrl} alt="" className="mt-4 w-full rounded-md" />}
        <div className="prose-body mt-6" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      </article>
    </main>
  );
}
