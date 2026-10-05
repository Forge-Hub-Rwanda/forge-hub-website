import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { AddAdminForm } from "@/components/admin/add-admin-form";
import { RemoveAdminButton } from "@/components/admin/remove-admin-button";

/**
 * Lists and manages the `admins` allowlist, replacing manual SQL in the
 * Supabase dashboard. Reads/writes go through the service-role client, since
 * `admins` carries no insert/update/delete RLS policy for anyone — see
 * `0002_admins.sql`.
 */
export default async function AdminAdmins() {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin) {
    redirect("/login");
  }

  const admin = createAdminSupabaseClient();
  const { data: admins, error } = await admin
    .from("admins")
    .select("email, created_at")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Admins</h1>
      <p className="text-text-muted mt-2 max-w-[60ch]">
        Anyone signed in here can reach every admin page. Only add people you
        trust with that.
      </p>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load admins: {error.message}
        </p>
      )}

      {!error && admins && (
        <ul className="mt-6 flex flex-col gap-3">
          {admins.map((row) => (
            <li
              key={row.email}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-4"
            >
              <span className="text-text">
                {row.email}
                {row.email === user?.email && (
                  <span className="text-text-muted ml-2 text-xs">(you)</span>
                )}
              </span>
              <RemoveAdminButton email={row.email} />
            </li>
          ))}
        </ul>
      )}

      <AddAdminForm />
    </div>
  );
}
