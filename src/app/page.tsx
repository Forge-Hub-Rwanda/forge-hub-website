import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { Community } from "@/components/community";
import { Events } from "@/components/events";
import { HeroDisplay } from "@/components/hero-display";
import { HeroIntro } from "@/components/hero-intro";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { Impact } from "@/components/impact";
import { Manifesto } from "@/components/manifesto";
import { Membership } from "@/components/membership";
import { Portfolio } from "@/components/portfolio";
import { Programs } from "@/components/programs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getEvents, getProjects, getTestimonials } from "@/lib/content";
import { portfolioSection } from "@/lib/site";

// CMS-backed. Served from Next's cache rather than read from Supabase on every
// visit; the admin actions expire the cache on each edit, so new content still
// shows on the next load. See `src/lib/content.ts`.

export default async function Home() {
  const [projects, events, testimonials] = await Promise.all([
    getProjects(),
    getEvents(),
    getTestimonials(),
  ]);

  return (
    <>
      {/* `main` opens before the hero, not after it, so the page's `h1` sits
          inside the main landmark — and so the skip link, which targets
          `#hero-intro`, lands inside it too rather than just before it. */}
      <main>
        {/* The hero zone is one positioning context: it lets the blob sit behind
          the display line, the nav and the intro copy at once, and it bounds
          the sticky display line so the line releases at the hero's end. */}
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(40.8vh,42vw)] [--blob-pace:1.5] [--color-blob-amber:var(--color-brand-500)] [--color-blob-coral:#b8483e] lg:left-[11vw]" />
          <HeroDisplay />
          <SiteHeader />
          <HeroIntro />
        </div>

        <Manifesto />

        {/* A curated cut, not the whole list: the homepage shows the first
            three, in admin order, and sends anyone who wants the rest to
            /portfolio. */}
        <Portfolio projects={projects.slice(0, 3)} {...portfolioSection} />

        <Community testimonials={testimonials} />
        <Membership />
        <Impact />

        {/* The page's one full-bleed colour band. It sits here, roughly two
            thirds down, because that is where a long white scroll starts to
            flatten out — and because programs are what we would most like
            someone still reading at that point to act on. */}
        <Programs tone="band" />

        <Events events={events} />
        {/* `wheel`: the tunnel gives way to the slot the wheel docks in. */}
        <ClosingCta wheel />
      </main>

      {/* The imigongo wheel (experiment). After `main` on purpose: fixed at
          z-index 1, coming later in the document is what puts it above every
          band's background while `.wheel-over` keeps the content above it. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}
