import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/event-form";

export default async function EditEvent(
  props: PageProps<"/admin/events/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, name, kind, event_date, time_text, location, position, is_published",
    )
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Edit event</h1>
      <EventForm event={event} />
    </div>
  );
}
