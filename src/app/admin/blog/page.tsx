import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteBlogPost } from "@/app/admin/blog/actions";

export default async function AdminBlog() {
  const supabase = await createServerSupabaseClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, is_published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-heading text-2xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn btn-strong w-fit">
          New post
        </Link>
      </div>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load posts: {error.message}
        </p>
      )}

      {!error && posts?.length === 0 && (
        <p className="text-text-muted mt-4">No posts yet.</p>
      )}

      {!error && posts && posts.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-5"
            >
              <div>
                <p className="text-text font-semibold">{post.title}</p>
                <p className="text-text-muted text-sm">
                  {post.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
                <form action={deleteBlogPost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="text-text-muted hover:text-text text-sm font-medium"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
