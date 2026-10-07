import { redirect } from "next/navigation";
import { AdminCreateForm } from "@/components/admin-create-form";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export default async function AdminsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/login");
  }

  // The admins table only shows a user their own row under RLS, so the full
  // list is read with the service-role key, after the check above.
  const { data: admins, error } = await createServiceRoleClient()
    .from("admins")
    .select("email, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="font-display text-heading text-2xl">Admins</h1>
        <p className="text-text-muted mt-3 max-w-[60ch]">
          Anyone listed here can sign in at the login page and edit the site.
          Share the email and password with them yourself.
        </p>
      </div>

      <section>
        <h2 className="text-label text-text-muted mb-4">Add an admin</h2>
        <AdminCreateForm />
      </section>

      <section>
        <h2 className="text-label text-text-muted mb-4">Current admins</h2>
        {error ? (
          <p className="text-text text-sm">Could not load the admin list.</p>
        ) : (
          <ul className="border-line max-w-md divide-y border">
            {(admins ?? []).map((admin) => (
              <li
                key={admin.email}
                className="border-line flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="text-text">{admin.email}</span>
                <span className="text-text-muted">
                  {new Date(admin.created_at).toLocaleDateString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
