import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Edit post</h1>
      <PostEditor
        initialPost={{
          id: post.id,
          title: post.title,
          bodyMarkdown: post.bodyMarkdown,
          coverImageUrl: post.coverImageUrl,
          status: post.status,
          audienceRule: post.audienceRule,
        }}
      />
    </div>
  );
}
