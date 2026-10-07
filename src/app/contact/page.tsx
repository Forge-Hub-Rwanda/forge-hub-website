import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ImigongoCorner, ImigongoWatermark } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact-form";
import { contact, contactPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | ForgeHub Rwanda",
  description: contactPage.lede,
};

export default function Contact() {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(38.4vh,40vw)] lg:left-[11vw]" />
          <PageHeroLine title={contactPage.title} />
          <SiteHeader />
          <PageIntro eyebrow={contactPage.eyebrow} lede={contactPage.lede} />

          <ImigongoCorner
            id="imigongo-contact-corner"
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        <Section
          className="border-line border-t"
          watermark={
            <ImigongoWatermark
              id="imigongo-contact"
              motif="spiral"
              opacity={0.05}
              scale={1.4}
            />
          }
        >
          <SectionHeading {...contactPage.heading} />

          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            {/* --- The form: saved to the database by a server action. */}
            <Reveal className="lg:col-span-7">
              <ContactForm
                submit={contactPage.submit}
                note={contactPage.note}
              />
            </Reveal>

            {/* --- Direct details ------------------------------------------ */}
            <Reveal delay={120} className="lg:col-span-5">
              <address className="border-line bg-surface-2 flex flex-col gap-8 border p-8 not-italic lg:p-10">
                <div>
                  <p className="text-label text-text-muted">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-text mt-2 block text-lg font-semibold underline-offset-4 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>

                <div>
                  <p className="text-label text-text-muted">Phone</p>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-text mt-2 block text-lg font-semibold underline-offset-4 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>

                <div>
                  <p className="text-label text-text-muted">Location</p>
                  <p className="text-text mt-2 text-lg font-semibold">
                    {contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  {/* Honest stand-in for the street address and opening hours
                      we do not yet publish — see the TODO in `site.ts`. */}
                  {contact.hours.map((slot) => (
                    <p
                      key={slot.days}
                      className="text-text-muted mt-2 text-sm leading-snug"
                    >
                      {slot.time}
                    </p>
                  ))}
                </div>
              </address>
            </Reveal>
          </div>
        </Section>
      </main>

      {/* The homepage's imigongo wheel, turning down this page too. After
          `main` for the same layering reason given in src/app/page.tsx. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}
