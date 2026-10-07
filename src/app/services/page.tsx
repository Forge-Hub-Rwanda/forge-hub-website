import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Programs } from "@/components/programs";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { RollText } from "@/components/split-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { services, servicesPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services | ForgeHub Rwanda",
  description: servicesPage.lede,
};

export default function Services() {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(38.4vh,40vw)] lg:left-[11vw]" />
          <PageHeroLine title={servicesPage.title} />
          <SiteHeader />
          <PageIntro eyebrow={servicesPage.eyebrow} lede={servicesPage.lede} />

          <ImigongoCorner
            id="imigongo-services-corner"
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        {/* Full-width rows rather than cards, matching the homepage's programs
            band: each service carries a lead number, a blurb and a status-style
            meta line, which read better on a line than stacked in a tile. */}
        <Section className="border-line border-t">
          <SectionHeading {...servicesPage.heading} />

          {/* Below lg the rows become the homepage's deck of rounded cards,
              each sticking a little below the last - see `.svc-deck` in
              globals.css. */}
          <ul className="svc-deck border-line lg:border-t">
            {services.map((service, index) => (
              <Reveal
                key={service.id}
                as="li"
                delay={index * 70}
                className="svc-card border-line lg:border-b"
                style={{ "--i": index } as React.CSSProperties}
              >
                {/* `data-cursor-motif`: a slowly turning lozenge trails the
                    pointer across the row. A motif rather than a word, because
                    the row is not a link and a label would promise a click. */}
                <div
                  id={service.id}
                  data-cursor-motif
                  className="relative grid scroll-mt-24 gap-4 px-2 py-8 lg:grid-cols-12 lg:gap-8 lg:px-6 lg:py-12"
                >
                  <p className="font-display text-text-muted text-label lg:col-span-1">
                    {service.index}
                  </p>

                  {/* Phones: the number again, huge and in outline, bled off
                      the card's corner as on the homepage's ways-in deck. */}
                  <span aria-hidden className="mb-num lg:hidden">
                    {service.index}
                  </span>

                  <h3 className="font-display text-text text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold tracking-[-0.03em] lg:col-span-4">
                    {service.name}
                  </h3>

                  <div className="lg:col-span-5">
                    <p className="text-text text-lg font-semibold">
                      {service.blurb}
                    </p>
                    <p className="text-text-muted mt-3 leading-snug">
                      {service.detail}
                    </p>
                  </div>

                  <p className="text-label text-text-muted lg:col-span-2 lg:text-right">
                    {service.meta}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={200}>
            <a href={servicesPage.cta.href} className="btn mt-12">
              <RollText>{servicesPage.cta.label}</RollText>
            </a>
          </Reveal>
        </Section>

        {/* The homepage's programs band verbatim — the training tracks are the
            same content, so it is reused rather than restated. */}
        <Programs />

        <ClosingCta wheel />
      </main>

      {/* The homepage's imigongo wheel, turning down this page too. After
          `main` for the same layering reason given in src/app/page.tsx. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}
