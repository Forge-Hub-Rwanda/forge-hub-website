"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SignInState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"email" | "password", string>>;
};

const schema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
  password: z.string().min(1, "Please enter your password."),
});

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: NonNullable<SignInState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      status: "error",
      message: "That email and password don't match an account.",
    };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("email")
    .eq("email", data.user.email)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "That account is not set up as an admin.",
    };
  }

  redirect("/admin");
}
