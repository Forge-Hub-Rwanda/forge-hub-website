"use client";

import { useActionState } from "react";
import { removeAdmin, type RemoveAdminState } from "@/app/admin/admins/actions";

const initial: RemoveAdminState = { status: "idle" };

export function RemoveAdminButton({ email }: { email: string }) {
  const [state, action, pending] = useActionState(removeAdmin, initial);

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending}
        className="text-text-muted hover:text-text text-sm font-medium"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-accent text-xs">
          {state.message}
        </p>
      )}
    </form>
  );
}
