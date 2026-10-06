import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Same order as the admin nav, so the two never disagree. */
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
  {
    href: "/admin/events",
    label: "Events",
    blurb: "The “What’s on” band on the homepage.",
  },
  {
    href: "/admin/community",
    label: "Community",
    blurb: "Member quotes on the homepage.",
  },
  { href: "/admin/team", label: "Team", blurb: "Team member profiles." },
  { href: "/admin/admins", label: "Admins", blurb: "Who can sign in here." },
] as const;

type Count = { count: number | null; error: unknown };

/** "1 project" / "3 projects". */
const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/**
 * A total, plus how many of them are drafts when there are any. A failed
 * count (most often a table whose migration has not been run yet) says so
 * rather than reading as a real zero.
 */
function summary(total: Count, drafts: Count, one: string, many: string) {
  if (total.error || total.count === null) return "Not set up";
  const line = plural(total.count, one, many);
  return drafts.count
    ? `${line} · ${plural(drafts.count, "draft", "drafts")}`
    : line;
}

async function adminCount(): Promise<Count> {
  try {
    return await createAdminSupabaseClient()
      .from("admins")
      .select("email", { count: "exact", head: true });
  } catch (error) {
    // The service role key is not configured.
    return { count: null, error };
  }
}

async function counts() {
  const { supabase, isAdmin } = await requireAdmin();
  // The layout already redirects anyone else; this guards the service client.
  if (!isAdmin) redirect("/login");

  const head = { count: "exact" as const, head: true };
  const drafts = (table: string) =>
    supabase.from(table).select("id", head).eq("is_published", false);

  const [
    messages,
    unread,
    blog,
    blogDrafts,
    portfolio,
    portfolioDrafts,
    events,
    eventDrafts,
    community,
    communityDrafts,
    team,
  ] = await Promise.all([
    supabase.from("messages").select("id", head),
    supabase.from("messages").select("id", head).eq("is_read", false),
    supabase.from("blog_posts").select("id", head),
    drafts("blog_posts"),
    supabase.from("portfolio_items").select("id", head),
    drafts("portfolio_items"),
    supabase.from("events").select("id", head),
    drafts("events"),
    supabase.from("testimonials").select("id", head),
    drafts("testimonials"),
    supabase.from("team_members").select("id", head),
  ]);

  // RLS lets an admin read only their own `admins` row, so a count through the
  // session client would always be 1 — the service client sees them all.
  const admins = await adminCount();

  const messageLine =
    messages.error || messages.count === null
      ? "Not set up"
      : unread.count
        ? `${unread.count} unread · ${messages.count} total`
        : plural(messages.count, "message", "messages");

  return {
    "/admin/messages": messageLine,
    "/admin/blog": summary(blog, blogDrafts, "post", "posts"),
    "/admin/portfolio": summary(
      portfolio,
      portfolioDrafts,
      "project",
      "projects",
    ),
    "/admin/events": summary(events, eventDrafts, "event", "events"),
    "/admin/community": summary(community, communityDrafts, "quote", "quotes"),
    "/admin/team":
      team.error || team.count === null
        ? "Not set up"
        : plural(team.count, "member", "members"),
    "/admin/admins":
      admins.error || admins.count === null
        ? "Not set up"
        : plural(admins.count, "admin", "admins"),
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
                <span className="text-accent text-right text-xs font-semibold">
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
