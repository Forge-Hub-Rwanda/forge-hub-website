import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { spaces, spacesSection } from "@/lib/site";

/**
 * Three-column grid of rooms. Cards are square-cornered and separated by rules
 * rather than shadows, and invert on hover — the page has no photography, so
 * the block of solid colour is what gives the grid its texture.
 */
export function Spaces() {
  return (
    <Section id="spaces" className="border-line border-t">
      <SectionHeading {...spacesSection} />

      <ul className="border-line grid gap-px border-l md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space, index) => (
          <Reveal
            key={space.name}
            as="li"
            delay={index * 70}
            className="border-line border-t border-r border-b"
          >
            <article className="group hover:bg-text flex h-full flex-col p-8 transition-colors duration-300 lg:p-10">
              <h3 className="font-display text-text group-hover:text-text-invert text-2xl font-extrabold tracking-[-0.02em] transition-colors lg:text-[1.75rem]">
                {space.name}
              </h3>
              <p className="text-text group-hover:text-text-invert mt-3 text-lg font-semibold transition-colors">
                {space.blurb}
              </p>
              <p className="text-text-muted group-hover:text-text-invert/70 mt-4 leading-snug transition-colors">
                {space.detail}
              </p>
              <p className="text-label text-text-muted group-hover:text-text-invert/70 border-line group-hover:border-text-invert/25 mt-8 border-t pt-5 transition-colors">
                {space.meta}
              </p>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
