"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/admins", label: "Admins" },
];

/**
 * Admin nav links. `prefetch={false}` matters here: Next.js otherwise
 * prefetches every target, firing concurrent requests through `proxy.ts` that
 * can race on Supabase token refresh and bounce the session. See the proxy for
 * the rest of that story.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-1 text-sm font-medium transition-colors ${
              active
                ? "border-accent text-text"
                : "text-text-muted hover:text-text border-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
