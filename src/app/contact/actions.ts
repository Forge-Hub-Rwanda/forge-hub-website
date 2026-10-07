"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.email("Please enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .max(5000, "Please keep your message under 5,000 characters."),
});

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: a hidden field real visitors never fill in. Pretend success so
  // bots get no signal to adapt to.
  if (String(formData.get("website") ?? "").length > 0) {
    return { status: "success" };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: NonNullable<ContactState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }

  const { error } = await createPublicClient()
    .from("messages")
    .insert(parsed.data);

  if (error) {
    console.error("contact insert failed:", error.message);
    return {
      status: "error",
      message:
        "Something went wrong on our side. Please try again, or email us directly.",
    };
  }

  return { status: "success" };
}
