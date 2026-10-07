import { EventForm } from "@/components/admin/event-form";

export default function NewEvent() {
  return (
    <div>
      <h1 className="font-display text-heading text-2xl">New event</h1>
      <p className="text-text-muted mt-2 max-w-[60ch]">
        Add a meetup, demo day or other event. It shows in the “What’s on” band
        on the homepage.
      </p>
      <EventForm />
    </div>
  );
}
