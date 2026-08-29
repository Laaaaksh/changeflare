import { PostEditor } from "@/components/PostEditor";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">New post</h1>
      <PostEditor />
    </div>
  );
}
