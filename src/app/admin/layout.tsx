import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin — ForgeHub Rwanda",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
];

/**
 * Shell for every `/admin/*` page. `proxy.ts` already redirects a
 * signed-out visitor to `/login`; this re-checks against the `admins`
 * allowlist on the server, since Proxy coverage isn't guaranteed for every
 * Server Function and a session alone doesn't mean the account is an admin.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/login");
  }

  return (
    <div className="bg-surface text-text min-h-screen">
      <header className="border-line flex h-16 items-center justify-between border-b px-6 lg:px-10">
        <nav className="flex items-center gap-6">
          <span className="text-label text-text-muted">Admin</span>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            className="text-text-muted hover:text-text text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="px-6 py-10 lg:px-10">{children}</main>
    </div>
  );
}
