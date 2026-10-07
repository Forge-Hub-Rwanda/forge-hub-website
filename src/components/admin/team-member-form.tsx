"use client";

import { useActionState } from "react";
import {
  createTeamMember,
  updateTeamMember,
  type TeamMemberState,
} from "@/app/admin/team/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";
import {
  DraftNotice,
  FormError,
  useFormDraft,
} from "@/components/admin/form-draft";

const initial: TeamMemberState = { status: "idle" };

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
};

export function TeamMemberForm({ member }: { member?: TeamMember }) {
  const action = member
    ? updateTeamMember.bind(null, member.id)
    : createTeamMember;
  const [state, formAction, pending] = useActionState(action, initial);
  const errors = state.errors ?? {};
  // Unsaved edits survive a reload, a closed tab or a sign-out.
  const { formRef, restored, discard } = useFormDraft(
    `team:${member?.id ?? "new"}`,
    state,
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex max-w-xl flex-col gap-5"
      noValidate
    >
      <DraftNotice restored={restored} onDiscard={discard} />

      <Field id="name" label="Name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={member?.name}
          className={FIELD_CLASS}
        />
      </Field>

      <Field id="role" label="Role" error={errors.role}>
        <input
          id="role"
          name="role"
          type="text"
          required
          defaultValue={member?.role}
          className={FIELD_CLASS}
        />
      </Field>

      <Field id="bio" label="Bio (optional)" error={errors.bio}>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={member?.bio ?? ""}
          className={`${FIELD_CLASS} resize-y`}
        />
      </Field>

      <Field id="photo" label="Photo">
        {member?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt=""
            className="mt-2 mb-3 h-24 w-24 object-cover"
          />
        )}
        <input id="photo" name="photo" type="file" accept="image/*" />
      </Field>

      <div className="mt-1 flex flex-col gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-strong w-fit"
        >
          {pending ? "Saving…" : member ? "Save changes" : "Create member"}
        </button>
        {state.status === "error" && <FormError message={state.message} />}
      </div>
    </form>
  );
}
