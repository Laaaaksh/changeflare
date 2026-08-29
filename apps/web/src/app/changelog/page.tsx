import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function ChangelogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 flex items-center gap-2 text-xl font-bold">
        <span aria-hidden>🔥</span> Changelog
      </div>
      {posts.length === 0 ? (
        <p className="text-neutral-500">No updates published yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {posts.map((post) => (
            <article key={post.id}>
              <p className="text-xs text-neutral-500">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
              </p>
              <Link href={`/changelog/${post.slug}`} className="mt-1 block text-lg font-bold hover:underline">
                {post.title}
              </Link>
              {post.coverImageUrl && (
                <img src={post.coverImageUrl} alt="" className="mt-3 w-full rounded-md" />
              )}
              <p className="mt-2 text-sm text-neutral-600">{post.excerpt}</p>
              <Link href={`/changelog/${post.slug}`} className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
