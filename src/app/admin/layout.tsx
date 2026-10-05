import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ImigongoRule } from "@/components/imigongo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Admin — ForgeHub Rwanda",
  robots: { index: false, follow: false },
};

/**
 * Shell for every `/admin/*` page. `proxy.ts` already redirects a
 * signed-out visitor to `/login`; this re-checks against the `admins`
 * allowlist on the server, since Proxy coverage isn't guaranteed for every
 * Server Function and a session alone doesn't mean the account is an admin.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin) {
    redirect("/login");
  }

  return (
    <div className="bg-surface text-text min-h-screen">
      <header className="border-line bg-surface-2 border-b">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <ImigongoRule className="text-accent" />
            <span className="font-display text-heading text-lg leading-none">
              ForgeHub
            </span>
            <span className="text-label text-text-muted">Admin</span>
          </div>

          <div className="flex items-center gap-5">
            <AdminNav />
            <div className="bg-line h-5 w-px" aria-hidden />
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="text-text-muted hover:text-text text-sm font-medium"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-6 py-10 lg:px-10">
        {user?.email && (
          <p className="text-text-muted mb-8 text-sm">
            Signed in as <span className="text-text">{user.email}</span>
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
