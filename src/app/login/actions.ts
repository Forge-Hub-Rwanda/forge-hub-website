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

export type SignUpState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"email" | "password" | "confirmPassword", string>>;
};

const signUpSchema = z
  .object({
    email: z.email("Please enter a valid email address.").max(254),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

/**
 * Creates a Supabase Auth account only — it does not grant admin access.
 * A brand-new account can't reach `/admin` until an existing admin adds its
 * email on `/admin/admins`.
 */
export async function signUp(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors: NonNullable<SignUpState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message:
      "Account created. Ask an existing admin to grant you access from Admin → Admins.",
  };
}
