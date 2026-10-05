import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SECTIONS = [
  {
    href: "/admin/messages",
    label: "Messages",
    blurb: "Contact form submissions.",
  },
  { href: "/admin/blog", label: "Blog", blurb: "Write and publish posts." },
  {
    href: "/admin/portfolio",
    label: "Portfolio",
    blurb: "Projects and their galleries.",
  },
  { href: "/admin/team", label: "Team", blurb: "Team member profiles." },
  { href: "/admin/admins", label: "Admins", blurb: "Who can sign in here." },
] as const;

async function counts() {
  const supabase = await createServerSupabaseClient();
  const head = { count: "exact" as const, head: true };

  const [messages, unread, blog, portfolio, team] = await Promise.all([
    supabase.from("messages").select("id", head),
    supabase.from("messages").select("id", head).eq("is_read", false),
    supabase.from("blog_posts").select("id", head),
    supabase.from("portfolio_items").select("id", head),
    supabase.from("team_members").select("id", head),
  ]);

  return {
    "/admin/messages":
      unread.count && unread.count > 0
        ? `${unread.count} unread`
        : `${messages.count ?? 0} total`,
    "/admin/blog": `${blog.count ?? 0} posts`,
    "/admin/portfolio": `${portfolio.count ?? 0} projects`,
    "/admin/team": `${team.count ?? 0} members`,
    "/admin/admins": "",
  } as Record<string, string>;
}

export default async function AdminDashboard() {
  const meta = await counts();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Dashboard</h1>
      <p className="text-text-muted mt-3 max-w-[60ch]">
        Manage everything that goes on the site from here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            prefetch={false}
            className="border-line bg-surface-2 hover:border-text group relative border p-5 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-heading text-lg">
                {section.label}
              </h2>
              {meta[section.href] && (
                <span className="text-accent text-xs font-semibold">
                  {meta[section.href]}
                </span>
              )}
            </div>
            <p className="text-text-muted mt-2 text-sm">{section.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
