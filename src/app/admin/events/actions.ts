"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/server";

export type EventState = {
  status: "idle" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "eventDate" | "position", string>>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(160),
  kind: z.string().trim().max(60).optional(),
  // A date input gives `YYYY-MM-DD`, or "" when left blank (a "TBA" event).
  eventDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date.")
    .optional(),
  timeText: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  position: z.coerce.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

function parseForm(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind") || undefined,
    eventDate: formData.get("eventDate") || undefined,
    timeText: formData.get("timeText") || undefined,
    location: formData.get("location") || undefined,
    position: formData.get("position") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
}

function fieldErrors(error: z.ZodError) {
  const errors: NonNullable<EventState["errors"]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof typeof errors;
    errors[key] ??= issue.message;
  }
  return errors;
}

function toRow(parsed: z.infer<typeof schema>) {
  const { isPublished, eventDate, timeText, ...rest } = parsed;
  return {
    ...rest,
    event_date: eventDate ?? null,
    time_text: timeText ?? null,
    is_published: isPublished,
  };
}

// The "What's on" band is on the homepage; refresh it whenever events change.
function revalidatePublic() {
  revalidatePath("/");
}

export async function createEvent(
  _prev: EventState,
  formData: FormData,
): Promise<EventState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { error } = await supabase.from("events").insert(toRow(parsed.data));

  if (error) {
    return {
      status: "error",
      message: `Couldn't create event: ${error.message}`,
    };
  }

  revalidatePath("/admin/events");
  revalidatePublic();
  redirect("/admin/events");
}

export async function updateEvent(
  id: string,
  _prev: EventState,
  formData: FormData,
): Promise<EventState> {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const { error } = await supabase
    .from("events")
    .update(toRow(parsed.data))
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: `Couldn't update event: ${error.message}`,
    };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePublic();
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  await supabase.from("events").delete().eq("id", id);

  revalidatePath("/admin/events");
  revalidatePublic();
}
