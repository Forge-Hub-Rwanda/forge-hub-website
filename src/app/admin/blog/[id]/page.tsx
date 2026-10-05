import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPost(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createServerSupabaseClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, body, cover_image_url, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Edit post</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
