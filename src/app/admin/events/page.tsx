import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteEvent } from "@/app/admin/events/actions";

export default async function AdminEvents() {
  const supabase = await createServerSupabaseClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, event_date, is_published, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-heading text-2xl">Events</h1>
        <Link href="/admin/events/new" className="btn btn-strong w-fit">
          New event
        </Link>
      </div>

      <p className="text-text-muted mt-2 max-w-[60ch]">
        These appear in the “What’s on” band on the homepage.
      </p>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load events: {error.message}
        </p>
      )}

      {!error && events?.length === 0 && (
        <p className="text-text-muted mt-4">No events yet.</p>
      )}

      {!error && events && events.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-5"
            >
              <div>
                <p className="text-text font-semibold">{event.name}</p>
                <p className="text-text-muted text-sm">
                  {event.event_date ?? "TBA"}
                  {event.is_published ? "" : " · Draft"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
                <form action={deleteEvent.bind(null, event.id)}>
                  <button
                    type="submit"
                    className="text-text-muted hover:text-text text-sm font-medium"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
