import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { programs, programsSection } from "@/lib/site";

/**
 * Programs as full-width rows rather than cards: each one has a status and two
 * spec fields, which read better on a line than stacked in a tile. The whole
 * row inverts on hover, so the hit target is the row itself.
 */
export function Programs() {
  return (
    <Section id="programs" className="border-line border-t">
      <SectionHeading {...programsSection} />

      <ul className="border-line border-t">
        {programs.map((program, index) => (
          <Reveal
            key={program.name}
            as="li"
            delay={index * 70}
            className="border-line border-b"
          >
            <a
              href={programsSection.cta.href}
              className="group hover:bg-text grid gap-4 px-2 py-8 transition-colors duration-300 lg:grid-cols-12 lg:items-baseline lg:gap-8 lg:px-6 lg:py-10"
            >
              <h3 className="font-display text-text group-hover:text-text-invert text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold tracking-[-0.03em] transition-colors lg:col-span-4">
                {program.name}
              </h3>

              <p className="text-text-muted group-hover:text-text-invert/70 leading-snug transition-colors lg:col-span-4">
                {program.blurb}
              </p>

              <dl className="text-label text-text-muted group-hover:text-text-invert/70 flex gap-6 transition-colors lg:col-span-3 lg:flex-col lg:gap-2">
                <div>
                  <dt className="sr-only">Format</dt>
                  <dd>{program.format}</dd>
                </div>
                <div>
                  <dt className="sr-only">Duration</dt>
                  <dd>{program.duration}</dd>
                </div>
              </dl>

              <p className="text-text group-hover:text-text-invert text-sm font-bold transition-colors lg:col-span-1 lg:text-right">
                {program.status}
              </p>
            </a>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
