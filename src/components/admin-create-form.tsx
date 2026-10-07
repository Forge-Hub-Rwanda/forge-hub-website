"use client";

import { useActionState } from "react";
import { createAdmin, type CreateAdminState } from "@/app/admin/admins/actions";

const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-2 w-full border px-4 py-2.5 text-base transition-colors hover:border-text focus:border-text";

const initial: CreateAdminState = { status: "idle" };

export function AdminCreateForm() {
  const [state, action, pending] = useActionState(createAdmin, initial);
  const errors = state.errors ?? {};

  return (
    <form
      action={action}
      noValidate
      className="flex max-w-md flex-col gap-5"
      key={state.status === "success" ? state.message : "form"}
    >
      <div className="field">
        <label htmlFor="admin-email" className="text-label text-text-muted">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="off"
          placeholder="name@example.com"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "admin-email-error" : undefined}
          className={FIELD_CLASS}
        />
        {errors.email && (
          <p id="admin-email-error" className="text-text mt-2 text-sm">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="admin-password" className="text-label text-text-muted">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          required
          minLength={6}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? "admin-password-error" : undefined
          }
          className={FIELD_CLASS}
        />
        {errors.password && (
          <p id="admin-password-error" className="text-text mt-2 text-sm">
            {errors.password}
          </p>
        )}
      </div>

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="text-text text-sm"
        >
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-strong w-fit">
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
