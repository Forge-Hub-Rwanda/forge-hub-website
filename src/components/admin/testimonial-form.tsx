"use client";

import { useActionState } from "react";
import {
  createTestimonial,
  updateTestimonial,
  type TestimonialState,
} from "@/app/admin/community/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";
import {
  DraftNotice,
  FormError,
  useFormDraft,
} from "@/components/admin/form-draft";

const initial: TestimonialState = { status: "idle" };

type TestimonialRecord = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  position: number;
  is_published: boolean;
};

export function TestimonialForm({
  testimonial,
}: {
  testimonial?: TestimonialRecord;
}) {
  const action = testimonial
    ? updateTestimonial.bind(null, testimonial.id)
    : createTestimonial;
  const [state, formAction, pending] = useActionState(action, initial);
  const errors = state.errors ?? {};
  // Unsaved edits survive a reload, a closed tab or a sign-out.
  const { formRef, restored, discard } = useFormDraft(
    `testimonial:${testimonial?.id ?? "new"}`,
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

      <Field id="quote" label="Quote" error={errors.quote}>
        <textarea
          id="quote"
          name="quote"
          rows={4}
          required
          defaultValue={testimonial?.quote}
          className={`${FIELD_CLASS} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={testimonial?.name}
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="role" label="Role (optional)">
          <input
            id="role"
            name="role"
            type="text"
            placeholder="Cohort member, Partner…"
            defaultValue={testimonial?.role ?? ""}
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
          defaultValue={testimonial?.position ?? 0}
          className={FIELD_CLASS}
        />
      </Field>

      <div className="field flex items-center gap-3">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          defaultChecked={testimonial?.is_published ?? true}
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
          {pending ? "Saving…" : testimonial ? "Save changes" : "Create quote"}
        </button>
        {state.status === "error" && <FormError message={state.message} />}
      </div>
    </form>
  );
}
