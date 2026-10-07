"use client";

import { useActionState } from "react";
import {
  createEvent,
  updateEvent,
  type EventState,
} from "@/app/admin/events/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";
import {
  DraftNotice,
  FormError,
  useFormDraft,
} from "@/components/admin/form-draft";

const initial: EventState = { status: "idle" };

type EventRecord = {
  id: string;
  name: string;
  kind: string | null;
  event_date: string | null;
  time_text: string | null;
  location: string | null;
  position: number;
  is_published: boolean;
};

export function EventForm({ event }: { event?: EventRecord }) {
  const action = event ? updateEvent.bind(null, event.id) : createEvent;
  const [state, formAction, pending] = useActionState(action, initial);
  const errors = state.errors ?? {};
  // Unsaved edits survive a reload, a closed tab or a sign-out.
  const { formRef, restored, discard } = useFormDraft(
    `event:${event?.id ?? "new"}`,
    state,
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex max-w-2xl flex-col gap-5"
      noValidate
    >
      <DraftNotice restored={restored} onDiscard={discard} />

      <Field id="name" label="Name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={event?.name}
          placeholder="Community meetup"
          className={FIELD_CLASS}
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field id="kind" label="Kind (optional)">
          <input
            id="kind"
            name="kind"
            type="text"
            placeholder="Meetup, Demo day, Coming soon…"
            defaultValue={event?.kind ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="eventDate" label="Date (optional)" error={errors.eventDate}>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={event?.event_date ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <p className="text-text-muted -mt-2 text-sm">
        Leave the date blank for an event that is still being planned — the site
        shows “TBA” in its place.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <Field id="timeText" label="Time (optional)">
          <input
            id="timeText"
            name="timeText"
            type="text"
            placeholder="6pm, or Dates to be announced"
            defaultValue={event?.time_text ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="location" label="Location (optional)">
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Kigali and online"
            defaultValue={event?.location ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field
        id="position"
        label="Order (lower shows first)"
        error={errors.position}
      >
        <input
          id="position"
          name="position"
          type="number"
          min={0}
          defaultValue={event?.position ?? 0}
          className={FIELD_CLASS}
        />
      </Field>

      <div className="field flex items-center gap-3">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          defaultChecked={event?.is_published ?? true}
          className="h-4 w-4"
        />
        <label htmlFor="isPublished" className="text-text text-sm">
          Published
        </label>
      </div>

      <div className="mt-1 flex flex-col gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-strong w-fit"
        >
          {pending ? "Saving…" : event ? "Save changes" : "Create event"}
        </button>
        {state.status === "error" && <FormError message={state.message} />}
      </div>
    </form>
  );
}
