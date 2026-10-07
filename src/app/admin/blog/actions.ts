"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";

const BUCKET = "blog-images";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type BlogPostState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"title" | "excerpt" | "body", string>>;
};

const schema = z.object({
  title: z.string().trim().min(1, "Please enter a title.").max(200),
  excerpt: z
    .string()
    .trim()
    .max(400, "Please keep the excerpt under 400 characters.")
    .optional(),
  body: z.string().trim().min(1, "Please write the post body.").max(50000),
  isPublished: z.boolean(),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    body: formData.get("body"),
    isPublished: formData.get("isPublished") === "on",
  });
}

function fieldErrors(error: z.ZodError) {
  const errors: NonNullable<BlogPostState["errors"]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof typeof errors;
    errors[key] ??= issue.message;
  }
  return errors;
}

export async function createBlogPost(
  _prev: BlogPostState,
  formData: FormData,
): Promise<BlogPostState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  let cover_image_url: string | null = null;
  let cover_image_path: string | null = null;
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(supabase, BUCKET, file);
    cover_image_url = uploaded.url;
    cover_image_path = uploaded.path;
  }

  const slug = slugify(parsed.data.title);
  const { isPublished, ...rest } = parsed.data;

  const { error } = await supabase.from("blog_posts").insert({
    ...rest,
    slug,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
    cover_image_url,
    cover_image_path,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "A post with that title (slug) already exists. Please use a different title."
        : `Couldn't create post: ${error.message}`;
    return { status: "error", message };
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(
  id: string,
  _prev: BlogPostState,
  formData: FormData,
): Promise<BlogPostState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("cover_image_path, is_published")
    .eq("id", id)
    .maybeSingle();

  const { isPublished, ...rest } = parsed.data;
  const update: Record<string, unknown> = {
    ...rest,
    is_published: isPublished,
  };

  if (isPublished && !existing?.is_published) {
    update.published_at = new Date().toISOString();
  } else if (!isPublished) {
    update.published_at = null;
  }

  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(supabase, BUCKET, file);
    update.cover_image_url = uploaded.url;
    update.cover_image_path = uploaded.path;
    await deleteImage(supabase, BUCKET, existing?.cover_image_path);
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: `Couldn't update post: ${error.message}`,
    };
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();

  await deleteImage(supabase, BUCKET, existing?.cover_image_path);
  await supabase.from("blog_posts").delete().eq("id", id);

  revalidatePath("/admin/blog");
}
