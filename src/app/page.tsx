import { Blob } from "@/components/blob";
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
import { NAV_PIN_SENTINEL_ID, SiteHeader } from "@/components/site-header";
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
        {/* Crossing the top of the viewport is what pins the nav. */}
        <div id={NAV_PIN_SENTINEL_ID} aria-hidden className="h-0" />
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
