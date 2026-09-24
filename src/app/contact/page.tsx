import type { Metadata } from "next";
import { Blob } from "@/components/blob";
import { ImigongoCorner, ImigongoWatermark } from "@/components/imigongo";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Magnetic } from "@/components/magnetic";
import { RollText } from "@/components/split-text";
import { contact, contactPage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — ForgeHub Rwanda",
  description: contactPage.lede,
};

/**
 * Fields are square-cornered and rule-bordered like every card on the site —
 * the page has no other input pattern to follow, so they take the card's
 * visual language rather than inventing a third one. The global
 * `:focus-visible` outline in globals.css is the focus treatment.
 */
/* The placeholder is `text-text-muted` at full strength, not dimmed further:
   at 60% it composites to roughly 3.1:1 against the field, under the 4.5:1
   WCAG minimum for body text, and placeholder text is the one string in a form
   a visitor most needs to be able to read before they have typed anything. */
const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-3 w-full border px-4 py-3 text-lg transition-colors hover:border-text focus:border-text";

const FIELDS = [
  {
    id: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your name",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
] as const;

export default function Contact() {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
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
            {/* --- The form ------------------------------------------------
                Posts via `mailto:`, which hands the message to the sender's own
                mail app: there is no server behind it yet, and the note below
                says so rather than letting anyone assume otherwise. */}
            <Reveal className="lg:col-span-7">
              <form
                action={`mailto:${contact.email}`}
                method="post"
                encType="text/plain"
                className="flex flex-col gap-8"
              >
                {/* `field`: a label rolls up while its input has focus, so the
                    one being typed into is marked without anything moving
                    around it. */}
                {FIELDS.map((field) => (
                  <div key={field.id} className="field">
                    <label
                      htmlFor={field.id}
                      className="text-label text-text-muted"
                    >
                      <RollText>{field.label}</RollText>
                    </label>
                    <input
                      id={field.id}
                      name={field.label}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      placeholder={field.placeholder}
                      required
                      className={FIELD_CLASS}
                    />
                  </div>
                ))}

                <div className="field">
                  <label
                    htmlFor="message"
                    className="text-label text-text-muted"
                  >
                    <RollText>Message</RollText>
                  </label>
                  <textarea
                    id="message"
                    name="Message"
                    rows={6}
                    placeholder="What are you building, or what would you like to learn?"
                    required
                    className={`${FIELD_CLASS} resize-y leading-snug`}
                  />
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                  <Magnetic className="w-fit">
                    <button
                      type="submit"
                      data-cursor="Send"
                      className="btn btn-strong w-fit"
                    >
                      <RollText>{contactPage.submit}</RollText>
                    </button>
                  </Magnetic>
                  <p className="text-text-muted max-w-[42ch] text-sm leading-snug">
                    {contactPage.note}
                  </p>
                </div>
              </form>
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

      <SiteFooter />
    </>
  );
}
