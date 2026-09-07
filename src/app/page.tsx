import { Blob } from "@/components/blob";
import { ImigongoCorner } from "@/components/imigongo";
import { ClosingCta } from "@/components/closing-cta";
import { Community } from "@/components/community";
import { Events } from "@/components/events";
import { HeroDisplay } from "@/components/hero-display";
import { HeroIntro } from "@/components/hero-intro";
import { Impact } from "@/components/impact";
import { Manifesto } from "@/components/manifesto";
import { Membership } from "@/components/membership";
import { PartnerMarquee } from "@/components/partner-marquee";
import { Programs } from "@/components/programs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Spaces } from "@/components/spaces";

export default function Home() {
  return (
    <>
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
          className="right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
        />
      </div>

      <main>
        <PartnerMarquee />
        <Manifesto />
        <Spaces />
        <Membership />
        <Programs />
        <Events />
        <Community />
        <Impact />
        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  );
}
