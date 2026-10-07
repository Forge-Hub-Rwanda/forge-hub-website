"use client";

import { useActionState } from "react";
import {
  createPortfolioItem,
  updatePortfolioItem,
  type PortfolioItemState,
} from "@/app/admin/portfolio/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";
import {
  DraftNotice,
  FormError,
  useFormDraft,
} from "@/components/admin/form-draft";

const initial: PortfolioItemState = { status: "idle" };

type PortfolioItem = {
  id: string;
  name: string;
  blurb: string | null;
  client: string | null;
  year: string | null;
  status: string | null;
  href: string | null;
  disciplines: string[];
  is_published: boolean;
};

export function PortfolioItemForm({ item }: { item?: PortfolioItem }) {
  const action = item
    ? updatePortfolioItem.bind(null, item.id)
    : createPortfolioItem;
  const [state, formAction, pending] = useActionState(action, initial);
  const errors = state.errors ?? {};
  // Unsaved edits survive a reload, a closed tab or a sign-out.
  const { formRef, restored, discard } = useFormDraft(
    `portfolio:${item?.id ?? "new"}`,
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
          defaultValue={item?.name}
          className={FIELD_CLASS}
        />
      </Field>

      <Field id="blurb" label="Blurb (optional)" error={errors.blurb}>
        <textarea
          id="blurb"
          name="blurb"
          rows={2}
          defaultValue={item?.blurb ?? ""}
          className={`${FIELD_CLASS} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field id="client" label="Client (optional)">
          <input
            id="client"
            name="client"
            type="text"
            defaultValue={item?.client ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="year" label="Year (optional)">
          <input
            id="year"
            name="year"
            type="text"
            defaultValue={item?.year ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field id="status" label="Status (optional)">
          <input
            id="status"
            name="status"
            type="text"
            placeholder="Live, In build…"
            defaultValue={item?.status ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
        <Field id="href" label="Link (optional)">
          <input
            id="href"
            name="href"
            type="url"
            placeholder="https://…"
            defaultValue={item?.href ?? ""}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field id="disciplines" label="Disciplines (comma-separated, optional)">
        <input
          id="disciplines"
          name="disciplines"
          type="text"
          placeholder="Software development, Design"
          defaultValue={item?.disciplines?.join(", ") ?? ""}
          className={FIELD_CLASS}
        />
      </Field>

      <div className="field flex items-center gap-3">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          defaultChecked={item?.is_published}
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
          {pending ? "Saving…" : item ? "Save changes" : "Create item"}
        </button>
        {state.status === "error" && <FormError message={state.message} />}
      </div>
    </form>
  );
}
