import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner } from "@/components/imigongo";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeamShowcase } from "@/components/team-showcase";
import { teamPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Team — ForgeHub Rwanda",
  description: teamPage.lede,
};

export default function Team() {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
          <PageHeroLine title={teamPage.title} />
          <SiteHeader />
          <PageIntro eyebrow={teamPage.eyebrow} lede={teamPage.lede} />

          <ImigongoCorner
            id="imigongo-team-corner"
            motif="lozenge"
            opacity={0.13}
            className="right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        {/* The row of portraits. `overflow-hidden` is load-bearing rather
            than tidy: the pattern panel behind the row is inset past the
            section's own edges so it has somewhere to drift to, and this is
            what stops that overhang adding a horizontal scrollbar. */}
        <Section className="border-line relative overflow-hidden border-t">
          <SectionHeading {...teamPage.heading} />

          <TeamShowcase />

          <Reveal delay={220}>
            <a href={teamPage.cta.href} className="btn relative z-1 mt-16">
              {teamPage.cta.label}
            </a>
          </Reveal>
        </Section>

        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  );
}
