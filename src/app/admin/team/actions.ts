"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { CONTENT_TAGS } from "@/lib/content-tags";

// The public /team page reads the team from a tagged cache; expire it on every
// change so the edit shows on the next load.
function revalidatePublic() {
  updateTag(CONTENT_TAGS.team);
}

const BUCKET = "team-images";

export type TeamMemberState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "role" | "bio", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(120),
  role: z.string().trim().min(1, "Please enter a role.").max(120),
  bio: z
    .string()
    .trim()
    .max(2000, "Please keep the bio under 2,000 characters.")
    .optional(),
});

export async function createTeamMember(
  _prev: TeamMemberState,
  formData: FormData,
): Promise<TeamMemberState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    const errors: NonNullable<TeamMemberState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  let photo_url: string | null = null;
  let photo_path: string | null = null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(supabase, BUCKET, file);
    photo_url = uploaded.url;
    photo_path = uploaded.path;
  }

  // A new member joins the end of the list: one past the current last.
  const { data: last } = await supabase
    .from("team_members")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  const position = (last?.[0]?.position ?? -1) + 1;

  const { error } = await supabase.from("team_members").insert({
    ...parsed.data,
    photo_url,
    photo_path,
    position,
  });

  if (error) {
    return {
      status: "error",
      message: `Couldn't create team member: ${error.message}`,
    };
  }

  revalidatePath("/admin/team");
  revalidatePublic();
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prev: TeamMemberState,
  formData: FormData,
): Promise<TeamMemberState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    const errors: NonNullable<TeamMemberState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const update: Record<string, unknown> = { ...parsed.data };

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const { data: existing } = await supabase
      .from("team_members")
      .select("photo_path")
      .eq("id", id)
      .maybeSingle();

    const uploaded = await uploadImage(supabase, BUCKET, file);
    update.photo_url = uploaded.url;
    update.photo_path = uploaded.path;

    await deleteImage(supabase, BUCKET, existing?.photo_path);
  }

  const { error } = await supabase
    .from("team_members")
    .update(update)
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: `Couldn't update team member: ${error.message}`,
    };
  }

  revalidatePath("/admin/team");
  revalidatePublic();
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  const { data: existing } = await supabase
    .from("team_members")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  await deleteImage(supabase, BUCKET, existing?.photo_path);
  await supabase.from("team_members").delete().eq("id", id);

  revalidatePath("/admin/team");
  revalidatePublic();
}
