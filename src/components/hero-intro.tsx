import { HERO_RELEASE_ID } from "@/lib/motion";
import { hero } from "@/lib/site";

/**
 * The upright half of the hero: sub-headline, lead paragraphs and CTAs.
 *
 * Sits below the nav row, matching the reference's stacking order of oblique
 * display line → navigation → upright headline → body.
 */
export function HeroIntro() {
  return (
    // tabIndex -1 so the skip link moves focus here, not just the scroll
    // position; without it a keyboard user lands visually but tabs on from the
    // header they were trying to skip.
    <div
      id="hero-intro"
      tabIndex={-1}
      className="relative z-20 px-6 pt-10 pb-20 lg:px-[3.6vw] lg:pt-20 lg:pb-28"
    >
      {/* The sticky display line above releases as this headline reaches it. */}
      <h2
        id={HERO_RELEASE_ID}
        className="rise font-display text-heading text-text max-w-[19ch] text-[clamp(2.25rem,5.4vw,4.75rem)]"
        style={{ "--delay": "140ms" } as React.CSSProperties}
      >
        {hero.headline}
      </h2>

      <div
        className="rise mt-10 space-y-5 lg:mt-16"
        style={{ "--delay": "280ms" } as React.CSSProperties}
      >
        {hero.body.map((paragraph) => (
          <p
            key={paragraph.text}
            className="text-text max-w-[90ch] text-lg leading-snug sm:text-xl lg:text-[1.4rem]"
          >
            {paragraph.text}
            {"strong" in paragraph && paragraph.strong ? (
              <strong className="font-bold">{paragraph.strong}</strong>
            ) : null}
            {"tail" in paragraph && paragraph.tail ? paragraph.tail : null}
          </p>
        ))}
      </div>

      <div
        className="rise mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-end"
        style={{ "--delay": "400ms" } as React.CSSProperties}
      >
        <a
          href={hero.primaryCta.href}
          className="group btn gap-3"
        >
          {hero.primaryCta.label}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
          >
            <path
              d="M4 12h15m0 0-6-6m6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a
          href={hero.secondaryCta.href}
          className="btn"
        >
          {hero.secondaryCta.label}
        </a>
      </div>
    </div>
  );
}
