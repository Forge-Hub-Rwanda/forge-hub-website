"use client";

import { useActionState } from "react";
import { addAdmin, type AdminsState } from "@/app/admin/admins/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";

const initial: AdminsState = { status: "idle" };

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addAdmin, initial);

  return (
    <form
      action={action}
      className="border-line bg-surface-2 mt-6 flex max-w-md flex-col gap-4 border p-5"
    >
      <Field id="email" label="Add admin by email">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="someone@forgehubrwanda.com"
          className={FIELD_CLASS}
        />
      </Field>
      <button type="submit" disabled={pending} className="btn btn-strong w-fit">
        {pending ? "Adding…" : "Add admin"}
      </button>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-accent text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}
