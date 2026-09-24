import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner, ImigongoWatermark } from "@/components/imigongo";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { aboutPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — ForgeHub Rwanda",
  description: aboutPage.lede,
};

export default function About() {
  return (
    <>
      {/* `main` opens here rather than after the hero so the page's `h1` and
          its lede sit inside the main landmark, which is also where the root
          layout's skip link lands. */}
      <main>
        {/* Same hero zone as the homepage: one positioning context holding the
          blob, the display line, the nav and the intro copy together. */}
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
          <PageHeroLine title={aboutPage.title} />
          <SiteHeader />
          <PageIntro eyebrow={aboutPage.eyebrow} lede={aboutPage.lede} />

          <ImigongoCorner
            id="imigongo-about-corner"
            motif="lozenge"
            opacity={0.13}
            className="right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        <Section
          id="story"
          className="border-line border-t"
          watermark={
            <ImigongoWatermark
              id="imigongo-about-story"
              motif="spiral"
              scale={1.4}
            />
          }
        >
          <SectionHeading
            eyebrow={aboutPage.story.eyebrow}
            title={aboutPage.story.title}
          />

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {aboutPage.story.body.map((paragraph, index) => (
              <Reveal
                key={paragraph}
                delay={index * 90}
                className="lg:col-span-6"
              >
                <p className="text-text-muted text-lg leading-snug lg:text-xl">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Mission and vision as rule-separated cards — no shadows, no radii,
            inverting on hover, the way every card on this site behaves. */}
        <Section className="bg-surface-2">
          <ul className="border-line grid gap-px border-l md:grid-cols-2">
            {aboutPage.pillars.map((pillar, index) => (
              <Reveal
                key={pillar.name}
                as="li"
                delay={index * 70}
                className="border-line border-t border-r border-b"
              >
                <article className="group hover:bg-text bg-surface flex h-full flex-col p-8 transition-colors duration-300 lg:p-10">
                  <h2 className="font-display text-text group-hover:text-text-invert text-2xl font-extrabold tracking-[-0.02em] transition-colors lg:text-[1.75rem]">
                    {pillar.name}
                  </h2>
                  <p className="text-text-muted group-hover:text-text-invert/70 mt-5 text-lg leading-snug transition-colors">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={200}>
            <a href={aboutPage.cta.href} className="btn mt-12">
              {aboutPage.cta.label}
            </a>
          </Reveal>
        </Section>

        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  );
}
