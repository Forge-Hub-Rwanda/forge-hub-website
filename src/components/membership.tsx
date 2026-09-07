import { ImigongoMark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { membershipSection, plans } from "@/lib/site";

/**
 * Pricing columns. The featured plan inverts rather than growing or lifting —
 * on a square-cornered, shadowless page a block of solid black is the strongest
 * available emphasis, and it costs no layout shift.
 */
export function Membership() {
  return (
    <Section id="membership" className="bg-surface-2">
      <SectionHeading {...membershipSection} />

      <ul className="grid gap-px md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} as="li" delay={index * 70} className="flex">
            <article
              className={`relative flex h-full w-full flex-col overflow-hidden p-8 lg:p-10 ${
                plan.featured
                  ? "bg-text text-text-invert"
                  : "bg-surface text-text"
              }`}
            >
              {/* Marks the featured plan without adding another badge: the
                  motif sits in the corner and bleeds off two edges. */}
              {plan.featured ? (
                <ImigongoMark
                  motif="lozenge"
                  className="text-text-invert absolute -top-6 -right-6 h-28 w-28 opacity-25"
                />
              ) : null}
              <h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">
                {plan.name}
              </h3>
              <p
                className={
                  plan.featured
                    ? "text-text-invert/70 mt-1 text-sm"
                    : "text-text-muted mt-1 text-sm"
                }
              >
                {plan.blurb}
              </p>

              {/* A reserved two-line box: "from RWF 450,000" wraps where the
                  other prices do not, and without this the feature lists below
                  fall out of alignment across the four columns. */}
              <p className="font-display mt-8 flex min-h-[2em] items-end text-[2.25rem] leading-none font-extrabold tracking-[-0.035em]">
                {plan.price}
              </p>
              <p
                className={
                  plan.featured
                    ? "text-text-invert/70 text-label mt-2"
                    : "text-text-muted text-label mt-2"
                }
              >
                {plan.cadence}
              </p>

              <ul
                className={`mt-8 flex-1 space-y-3 border-t pt-8 ${
                  plan.featured ? "border-text-invert/25" : "border-line"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 leading-snug">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="mt-1 h-4 w-4 shrink-0"
                    >
                      <path
                        d="M4 12.5l5.5 5.5L20 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className={
                        plan.featured
                          ? "text-text-invert/85"
                          : "text-text-muted"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.cta.href}
                className={`mt-10 ${
                  // Mirrored on the dark featured card: a white outline filling
                  // white, since an ink hover would vanish against it.
                  plan.featured ? "btn-invert" : "btn"
                }`}
              >
                {plan.cta.label}
              </a>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
