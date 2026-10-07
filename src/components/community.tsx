import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { communitySection, testimonials } from "@/lib/site";

/**
 * Member quotes, three across.
 *
 * `testimonials` currently holds one honest holding entry — "Member stories /
 * Coming soon" — rather than invented praise. Keep it that way: add a quote
 * here only once it is real, sourced, and attributed to a member who has given
 * written permission.
 */
export function Community() {
  return (
    <Section id="community" className="border-line border-t">
      <SectionHeading {...communitySection} />

      <ul className="grid gap-px lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal
            key={testimonial.quote}
            as="li"
            delay={index * 90}
            className="flex"
          >
            <figure className="border-line flex h-full w-full flex-col border p-8 lg:p-10">
              <svg
                aria-hidden
                viewBox="0 0 32 24"
                className="text-accent h-6 w-8 shrink-0"
                fill="currentColor"
              >
                <path d="M0 24V13.5C0 6 4.5 1 12 0v5c-3.8.9-5.8 3.4-5.8 6.4H12V24H0Zm20 0V13.5C20 6 24.5 1 32 0v5c-3.8.9-5.8 3.4-5.8 6.4H32V24H20Z" />
              </svg>

              <blockquote className="text-text mt-7 flex-1 text-lg leading-snug font-semibold lg:text-xl">
                {testimonial.quote}
              </blockquote>

              <figcaption className="border-line mt-8 border-t pt-6">
                <span className="text-text block font-bold">
                  {testimonial.name}
                </span>
                <span className="text-text-muted mt-1 block text-sm">
                  {testimonial.role}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
