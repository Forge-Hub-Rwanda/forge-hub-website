import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPost() {
  return (
    <div>
      <h1 className="font-display text-heading text-2xl">New post</h1>
      <BlogPostForm />
    </div>
  );
}
