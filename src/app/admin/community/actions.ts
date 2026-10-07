"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { CONTENT_TAGS } from "@/lib/content-tags";

export type TestimonialState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"quote" | "name" | "position", string>>;
};

const schema = z.object({
  quote: z.string().trim().min(1, "Please enter a quote.").max(1000),
  name: z.string().trim().min(1, "Please enter a name.").max(160),
  role: z.string().trim().max(160).optional(),
  position: z.coerce.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    quote: formData.get("quote"),
    name: formData.get("name"),
    role: formData.get("role") || undefined,
    position: formData.get("position") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
}

function fieldErrors(error: z.ZodError) {
  const errors: NonNullable<TestimonialState["errors"]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof typeof errors;
    errors[key] ??= issue.message;
  }
  return errors;
}

function toRow(parsed: z.infer<typeof schema>) {
  const { isPublished, role, ...rest } = parsed;
  return { ...rest, role: role ?? null, is_published: isPublished };
}

// The Community band is on the homepage; refresh it whenever quotes change.
// The public read is cached under its tag, so expiring the tag is what makes
// the edit show on the next load.
function revalidatePublic() {
  updateTag(CONTENT_TAGS.testimonials);
  revalidatePath("/");
}

export async function createTestimonial(
  _prev: TestimonialState,
  formData: FormData,
): Promise<TestimonialState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { error } = await supabase
    .from("testimonials")
    .insert(toRow(parsed.data));

  if (error) {
    return {
      status: "error",
      message: `Couldn't create quote: ${error.message}`,
    };
  }

  revalidatePath("/admin/community");
  revalidatePublic();
  redirect("/admin/community");
}

export async function updateTestimonial(
  id: string,
  _prev: TestimonialState,
  formData: FormData,
): Promise<TestimonialState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { error } = await supabase
    .from("testimonials")
    .update(toRow(parsed.data))
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: `Couldn't update quote: ${error.message}`,
    };
  }

  revalidatePath("/admin/community");
  revalidatePath(`/admin/community/${id}`);
  revalidatePublic();
  redirect("/admin/community");
}

export async function deleteTestimonial(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  await supabase.from("testimonials").delete().eq("id", id);

  revalidatePath("/admin/community");
  revalidatePublic();
}
