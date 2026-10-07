"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export type CreateAdminState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"email" | "password", string>>;
};

const schema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
  password: z.string().min(6, "Use at least 6 characters.").max(72),
});

export async function createAdmin(
  _prev: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  // Server Functions are reachable on their own, so re-check here rather than
  // trusting the layout or the proxy.
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "You are not allowed to do that." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: NonNullable<CreateAdminState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const service = createServiceRoleClient();

  const { error: createError } = await service.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
  });

  // An existing login is fine: it just gets added to the allowlist and keeps
  // its current password.
  const alreadyExists =
    createError?.code === "email_exists" ||
    /already.*(registered|exists)/i.test(createError?.message ?? "");

  if (createError && !alreadyExists) {
    console.error("create admin user failed:", createError.message);
    return {
      status: "error",
      message: "Could not create that login. Please try again.",
    };
  }

  const { error: insertError } = await service
    .from("admins")
    .upsert({ email }, { onConflict: "email" });

  if (insertError) {
    console.error("add to admins failed:", insertError.message);
    return {
      status: "error",
      message: "The login was created but could not be made an admin.",
    };
  }

  revalidatePath("/admin/admins");
  return {
    status: "success",
    message: alreadyExists
      ? `${email} already had a login and is now an admin. Their password is unchanged.`
      : `${email} can now sign in as an admin.`,
  };
}
