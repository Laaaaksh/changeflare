import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DeletePostButton } from "@/components/DeletePostButton";
import { InstallSnippet } from "@/components/InstallSnippet";

export default async function AdminDashboardPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = posts.length - publishedCount;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-lg font-bold">Dashboard</h1>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat label="Published" value={publishedCount} />
          <Stat label="Drafts" value={draftCount} />
          <Stat label="Widget opens" value={settings?.widgetOpens ?? 0} />
        </div>
      </section>

      <InstallSnippet origin={origin} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Posts</h2>
          <Link href="/admin/posts/new" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
            New post
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
            No posts yet. Create your first one to see it here.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Views</th>
                  <th className="px-4 py-2 font-medium">Clicks</th>
                  <th className="px-4 py-2 font-medium">Published</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-neutral-100">
                    <td className="px-4 py-2 font-medium">{post.title}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-2 tabular-nums">{post.views}</td>
                    <td className="px-4 py-2 tabular-nums">{post.clicks}</td>
                    <td className="px-4 py-2 text-neutral-500">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/posts/${post.id}`} className="text-neutral-600 hover:text-neutral-900">
                          Edit
                        </Link>
                        <DeletePostButton postId={post.id} title={post.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
