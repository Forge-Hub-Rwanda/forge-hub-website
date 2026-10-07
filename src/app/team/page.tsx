import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RollText } from "@/components/split-text";
import { TeamShowcase } from "@/components/team-showcase";
import { getTeam } from "@/lib/content";
import { teamPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Team | ForgeHub Rwanda",
  description: teamPage.lede,
};

// CMS-backed and cached; admin edits expire the cache, so new members appear
// on the next load. See `src/lib/content.ts`.

export default async function Team() {
  const members = await getTeam();

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
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        {/* The row of portraits. `overflow-hidden` is load-bearing rather
            than tidy: the pattern panel behind the row is inset past the
            section's own edges so it has somewhere to drift to, and this is
            what stops that overhang adding a horizontal scrollbar. */}
        <Section className="border-line relative overflow-hidden border-t">
          <SectionHeading {...teamPage.heading} />

          <TeamShowcase members={members} />

          <Reveal delay={220}>
            <a href={teamPage.cta.href} className="btn relative z-1 mt-16">
              <RollText>{teamPage.cta.label}</RollText>
            </a>
          </Reveal>
        </Section>

        <ClosingCta wheel />
      </main>

      {/* The homepage's imigongo wheel, turning down this page too. After
          `main` for the same layering reason given in src/app/page.tsx. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}
