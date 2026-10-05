"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AdminsState = {
  status: "idle" | "error";
  message?: string;
};

const schema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
});

export async function addAdmin(
  _prev: AdminsState,
  formData: FormData,
): Promise<AdminsState> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("admins")
    .insert({ email: parsed.data.email })
    .select()
    .maybeSingle();

  if (error && error.code !== "23505") {
    return { status: "error", message: `Couldn't add admin: ${error.message}` };
  }

  revalidatePath("/admin/admins");
  return { status: "idle" };
}

export type RemoveAdminState = {
  status: "idle" | "error";
  message?: string;
};

export async function removeAdmin(
  _prev: RemoveAdminState,
  formData: FormData,
): Promise<RemoveAdminState> {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin || !user?.email) {
    return { status: "error", message: "Not authorized." };
  }

  const email = String(formData.get("email") ?? "");

  if (email === user.email) {
    return { status: "error", message: "You can't remove yourself." };
  }

  const admin = createAdminSupabaseClient();

  const { count } = await admin
    .from("admins")
    .select("email", { count: "exact", head: true });

  if ((count ?? 0) <= 1) {
    return { status: "error", message: "At least one admin must remain." };
  }

  const { error } = await admin.from("admins").delete().eq("email", email);
  if (error) {
    return {
      status: "error",
      message: `Couldn't remove admin: ${error.message}`,
    };
  }

  revalidatePath("/admin/admins");
  return { status: "idle" };
}
