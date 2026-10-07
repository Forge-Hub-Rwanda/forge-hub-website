import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner, ImigongoWatermark } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Scrub } from "@/components/scrub";
import { Section, SectionHeading } from "@/components/section-heading";
import { RollText } from "@/components/split-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { aboutPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "About | ForgeHub Rwanda",
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
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(38.4vh,40vw)] lg:left-[11vw]" />
          <PageHeroLine title={aboutPage.title} />
          <SiteHeader />
          <PageIntro eyebrow={aboutPage.eyebrow} lede={aboutPage.lede} />

          <ImigongoCorner
            id="imigongo-about-corner"
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
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
            drift
          />

          {/* The two paragraphs drift in from opposite sides and meet, the
              same split drift the heading above carries. */}
          <Scrub
            query="(min-width: 64rem)"
            from={1}
            to={0.5}
            className="grid gap-8 lg:grid-cols-12 lg:gap-10"
          >
            {aboutPage.story.body.map((paragraph, index) => (
              <Reveal
                key={paragraph}
                delay={index * 90}
                className="lg:col-span-6"
              >
                <p
                  className={`${index % 2 ? "drift-r" : "drift-l"} text-text-muted text-lg leading-snug lg:text-xl`}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </Scrub>
        </Section>

        {/* Mission and vision as rule-separated cards — no shadows, no radii,
            inverting on hover, the way every card on this site behaves.

            Dealt like cards: they start stacked and fanned in the middle of
            the row and are dealt out to their own cells as the band comes up
            the screen. `--dx` is how far toward the middle each one starts, in
            its own widths; `--rot` is its fan. Two columns only — stacked on a
            phone there is no middle to deal from. */}
        <Section className="bg-surface-2">
          <Scrub
            as="ul"
            query="(min-width: 48rem)"
            from={1}
            to={0.45}
            className="border-line grid gap-px border-l md:grid-cols-2"
          >
            {aboutPage.pillars.map((pillar, index) => (
              <Reveal
                key={pillar.name}
                as="li"
                delay={index * 70}
                className="border-line border-t border-r border-b"
              >
                <article
                  className="deal-card group fill-rise bg-surface flex h-full flex-col p-8 lg:p-10"
                  style={
                    {
                      "--dx": index % 2 ? -52 : 52,
                      "--rot": index % 2 ? 5 : -6,
                    } as React.CSSProperties
                  }
                >
                  <h2 className="font-display text-text group-hover:text-text-invert text-2xl font-extrabold tracking-[-0.02em] transition-colors lg:text-[1.75rem]">
                    {pillar.name}
                  </h2>
                  <p className="text-text-muted group-hover:text-text-invert/70 mt-5 text-lg leading-snug transition-colors">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </Scrub>

          <Reveal delay={200}>
            <a href={aboutPage.cta.href} className="btn mt-12">
              <RollText>{aboutPage.cta.label}</RollText>
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
