"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { CONTENT_TAGS } from "@/lib/content-tags";

// The homepage gallery and the /portfolio pages read projects (and their
// images) from a tagged cache; expire it on every change so the edit shows on
// the next load.
function revalidatePublic() {
  updateTag(CONTENT_TAGS.portfolio);
}

const BUCKET = "portfolio-images";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type PortfolioItemState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "blurb", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(160),
  blurb: z
    .string()
    .trim()
    .max(400, "Please keep the blurb under 400 characters.")
    .optional(),
  client: z.string().trim().max(160).optional(),
  year: z.string().trim().max(20).optional(),
  status: z.string().trim().max(60).optional(),
  href: z.string().trim().max(500).optional(),
  disciplines: z.string().trim().max(400).optional(),
  isPublished: z.boolean(),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    blurb: formData.get("blurb") || undefined,
    client: formData.get("client") || undefined,
    year: formData.get("year") || undefined,
    status: formData.get("status") || undefined,
    href: formData.get("href") || undefined,
    disciplines: formData.get("disciplines") || undefined,
    isPublished: formData.get("isPublished") === "on",
  });
}

function fieldErrors(error: z.ZodError) {
  const errors: NonNullable<PortfolioItemState["errors"]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof typeof errors;
    errors[key] ??= issue.message;
  }
  return errors;
}

function toRow(parsed: z.infer<typeof schema>) {
  const { isPublished, disciplines, ...rest } = parsed;
  return {
    ...rest,
    is_published: isPublished,
    disciplines: disciplines
      ? disciplines
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : [],
  };
}

export async function createPortfolioItem(
  _prev: PortfolioItemState,
  formData: FormData,
): Promise<PortfolioItemState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const slug = slugify(parsed.data.name);

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({ ...toRow(parsed.data), slug })
    .select("id")
    .single();

  if (error || !data) {
    const message =
      error?.code === "23505"
        ? "An item with that name (slug) already exists. Please use a different name."
        : `Couldn't create item: ${error?.message}`;
    return { status: "error", message };
  }

  revalidatePath("/admin/portfolio");
  revalidatePublic();
  redirect(`/admin/portfolio/${data.id}`);
}

export async function updatePortfolioItem(
  id: string,
  _prev: PortfolioItemState,
  formData: FormData,
): Promise<PortfolioItemState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { error } = await supabase
    .from("portfolio_items")
    .update(toRow(parsed.data))
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: `Couldn't update item: ${error.message}`,
    };
  }

  revalidatePath("/admin/portfolio");
  revalidatePublic();
  revalidatePath(`/admin/portfolio/${id}`);
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const { data: images } = await supabase
    .from("portfolio_images")
    .select("image_path")
    .eq("portfolio_item_id", id);

  for (const image of images ?? []) {
    await deleteImage(supabase, BUCKET, image.image_path);
  }

  // Deleting the item cascades the `portfolio_images` rows.
  await supabase.from("portfolio_items").delete().eq("id", id);

  revalidatePath("/admin/portfolio");
  revalidatePublic();
}

export async function addPortfolioImages(itemId: string, formData: FormData) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return;

  const { data: existing } = await supabase
    .from("portfolio_images")
    .select("position")
    .eq("portfolio_item_id", itemId)
    .order("position", { ascending: false })
    .limit(1);

  let nextPosition = (existing?.[0]?.position ?? -1) + 1;

  for (const file of files) {
    const uploaded = await uploadImage(supabase, BUCKET, file);
    await supabase.from("portfolio_images").insert({
      portfolio_item_id: itemId,
      image_url: uploaded.url,
      image_path: uploaded.path,
      alt: "",
      position: nextPosition++,
    });
  }

  revalidatePath(`/admin/portfolio/${itemId}`);
  revalidatePublic();
}

export async function deletePortfolioImage(itemId: string, imageId: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const { data: existing } = await supabase
    .from("portfolio_images")
    .select("image_path")
    .eq("id", imageId)
    .maybeSingle();

  await deleteImage(supabase, BUCKET, existing?.image_path);
  await supabase.from("portfolio_images").delete().eq("id", imageId);

  revalidatePath(`/admin/portfolio/${itemId}`);
  revalidatePublic();
}

export async function movePortfolioImage(
  itemId: string,
  imageId: string,
  direction: "up" | "down",
) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const { data: images } = await supabase
    .from("portfolio_images")
    .select("id, position")
    .eq("portfolio_item_id", itemId)
    .order("position", { ascending: true });

  if (!images) return;

  const index = images.findIndex((image) => image.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= images.length) return;

  const current = images[index];
  const other = images[swapWith];

  await supabase
    .from("portfolio_images")
    .update({ position: other.position })
    .eq("id", current.id);
  await supabase
    .from("portfolio_images")
    .update({ position: current.position })
    .eq("id", other.id);

  revalidatePath(`/admin/portfolio/${itemId}`);
  revalidatePublic();
}

export async function updatePortfolioImageAlt(
  itemId: string,
  imageId: string,
  formData: FormData,
) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const alt = String(formData.get("alt") ?? "");
  await supabase.from("portfolio_images").update({ alt }).eq("id", imageId);

  revalidatePath(`/admin/portfolio/${itemId}`);
  revalidatePublic();
}
