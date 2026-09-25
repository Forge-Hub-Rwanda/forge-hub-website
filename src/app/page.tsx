import { Blob } from "@/components/blob";
import { ImigongoCorner } from "@/components/imigongo";
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
import { portfolioSection, projects } from "@/lib/site";

export default function Home() {
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
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
          <HeroDisplay />
          <SiteHeader />
          <HeroIntro />

          {/* Anchored in the hero's bottom-right corner and dissolving away from
            it. Sits at z-0, below the display line and the intro copy, both of
            which are z-20. */}
          <ImigongoCorner
            id="imigongo-hero-corner"
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        <Manifesto />

        {/* A curated cut, not the whole list: the homepage shows the three most
            recent and sends anyone who wants the rest to /portfolio. */}
        <Portfolio projects={projects.slice(0, 3)} {...portfolioSection} />

        <Community />
        <Membership />
        <Impact />

        {/* The page's one full-bleed colour band. It sits here, roughly two
            thirds down, because that is where a long white scroll starts to
            flatten out — and because programs are what we would most like
            someone still reading at that point to act on. */}
        <Programs tone="band" />

        <Events />
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
