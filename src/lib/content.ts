/**
 * The public site's read layer.
 *
 * Portfolio, team, events and community content lives in the CMS tables and
 * is edited from /admin. These helpers read those tables through the anonymous
 * Supabase client (the public-read RLS in 0011_public_read.sql lets them) and
 * map each row onto the `site.ts` types, so the components rendering them stay
 * unchanged.
 *
 * The admin panel is the single source of truth: an empty table renders as an
 * empty section, and a failed query is logged and treated the same way. The
 * content that used to be hand-written in `site.ts` was copied into the tables
 * by 0012_seed_content.sql.
 *
 * Server-only: these run in Server Components and must never be imported into a
 * client component.
 *
 * ## Caching
 *
 * Each read is cached by Next and tagged (`CONTENT_TAGS`), so a visit is served
 * from the cache instead of waiting on Supabase. Every admin action that changes
 * a table calls `updateTag` for it, so an edit still shows on the very next
 * load. `REVALIDATE` is only a safety net for edits made outside /admin, such
 * as straight in the Supabase dashboard.
 *
 * A failed query throws INSIDE the cached function, so the failure is never
 * cached: the empty fallback is returned for that one request, and the next
 * request tries Supabase again.
 */

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CONTENT_TAGS } from "@/lib/content-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Project,
  ProjectImage,
  SiteEvent,
  TeamMember,
  Testimonial,
} from "@/lib/site";

/** Short month labels for the date block in the events band. */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * A stored image becomes a `ProjectImage`. `width`/`height` are required by the
 * type but unused by `ProjectImage`/`next/image`, which render these with
 * `fill` — so 0/0 is correct here, not a guess at the file's real size.
 */
function toPicture(url: string, alt: string | null): ProjectImage {
  return { src: url, alt: alt ?? "", width: 0, height: 0 };
}

/** Seconds before a cached read is refreshed even without an admin edit. */
const REVALIDATE = 300;

class ReadError extends Error {}

/** Throws, so `unstable_cache` stores nothing for a failed query. */
function fail(table: string, error: { message: string }): never {
  throw new ReadError(`Couldn't read ${table}: ${error.message}`);
}

/** The cached read, or `fallback` (logged) if Supabase failed this time. */
async function orFallback<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!(error instanceof ReadError)) throw error;
    console.error(error.message);
    return fallback;
  }
}

type PortfolioImageRow = {
  image_url: string;
  alt: string | null;
  position: number;
};

type PortfolioItemRow = {
  slug: string;
  name: string;
  blurb: string | null;
  client: string | null;
  year: string | null;
  disciplines: string[] | null;
  status: string | null;
  href: string | null;
  portfolio_images: PortfolioImageRow[] | null;
};

function toProject(row: PortfolioItemRow): Project {
  const images = [...(row.portfolio_images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const pictures = images.map((image) => toPicture(image.image_url, image.alt));

  return {
    slug: row.slug,
    name: row.name,
    blurb: row.blurb ?? "",
    // The CMS has no separate detail line or write-up; the blurb is the summary.
    detail: "",
    client: row.client ?? "",
    year: row.year ?? "",
    disciplines: row.disciplines ?? [],
    status: row.status ?? "",
    href: row.href ?? undefined,
    cover: pictures[0],
    gallery: pictures.slice(1),
  };
}

const PROJECT_SELECT =
  "slug, name, blurb, client, year, disciplines, status, href, created_at, portfolio_images ( image_url, alt, position )";

const readProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select(PROJECT_SELECT)
      .order("created_at", { ascending: true });

    if (error) fail("portfolio_items", error);
    return (data as PortfolioItemRow[]).map(toProject);
  },
  ["content", "projects"],
  { tags: [CONTENT_TAGS.portfolio], revalidate: REVALIDATE },
);

/**
 * Every portfolio project, oldest first, so a new one joins the end.
 * `React.cache` on top shares one result across a single render — the project
 * page asks for it from both `generateMetadata` and the page itself.
 */
export const getProjects = cache((): Promise<Project[]> =>
  orFallback(readProjects, []),
);

/**
 * One project by slug, or `null` if there is no such project. Read from the
 * same cached list rather than a query of its own: the list is small, already
 * cached, and it means a project page needs one cache entry, not two.
 */
export async function getProject(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

type EventRow = {
  name: string;
  kind: string | null;
  event_date: string | null;
  time_text: string | null;
  location: string | null;
};

function toSiteEvent(row: EventRow): SiteEvent {
  let day = "TBA";
  let month = "";
  if (row.event_date) {
    // A plain `YYYY-MM-DD`; split rather than `new Date` so a timezone can
    // never roll it to the day before.
    const [, m, d] = row.event_date.split("-").map(Number);
    if (d && m) {
      day = String(d);
      month = MONTHS[m - 1] ?? "";
    }
  }
  return {
    date: { day, month },
    name: row.name,
    kind: row.kind ?? "",
    time: row.time_text ?? "",
    location: row.location ?? "",
  };
}

const readEvents = unstable_cache(
  async (): Promise<SiteEvent[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select(
        "name, kind, event_date, time_text, location, position, created_at",
      )
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) fail("events", error);
    return (data as EventRow[]).map(toSiteEvent);
  },
  ["content", "events"],
  { tags: [CONTENT_TAGS.events], revalidate: REVALIDATE },
);

/** Events for the "What's on" band, in their admin order. */
export function getEvents(): Promise<SiteEvent[]> {
  return orFallback(readEvents, []);
}

type TestimonialRow = {
  quote: string;
  name: string;
  role: string | null;
};

const readTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("quote, name, role, position, created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) fail("testimonials", error);
    return (data as TestimonialRow[]).map((row) => ({
      quote: row.quote,
      name: row.name,
      role: row.role ?? "",
    }));
  },
  ["content", "testimonials"],
  { tags: [CONTENT_TAGS.testimonials], revalidate: REVALIDATE },
);

/** Member quotes for the "Community" band, in their admin order. */
export function getTestimonials(): Promise<Testimonial[]> {
  return orFallback(readTestimonials, []);
}

type TeamRow = {
  name: string;
  role: string;
  photo_url: string | null;
};

const readTeam = unstable_cache(
  async (): Promise<TeamMember[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("name, role, photo_url, position, created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) fail("team_members", error);
    return (data as TeamRow[]).map((row) => ({
      name: row.name,
      role: row.role,
      photo: row.photo_url ? toPicture(row.photo_url, "") : undefined,
    }));
  },
  ["content", "team"],
  { tags: [CONTENT_TAGS.team], revalidate: REVALIDATE },
);

/** The team, in the same order as the admin list. */
export function getTeam(): Promise<TeamMember[]> {
  return orFallback(readTeam, []);
}
