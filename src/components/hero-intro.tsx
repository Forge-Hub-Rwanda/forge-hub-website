import { HERO_RELEASE_ID } from "@/lib/motion";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { hero } from "@/lib/site";

/**
 * The upright half of the hero: sub-headline, one-line summary, lead paragraph and CTAs.
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
      className="relative z-20 px-6 pt-2 pb-20 lg:px-[3.6vw] lg:pt-4 lg:pb-28"
    >
      {/* The sticky display line above releases as this headline reaches it. */}
      <h2
        id={HERO_RELEASE_ID}
        className="rise font-display text-heading text-text max-w-[19ch] text-[clamp(2.25rem,5.4vw,4.75rem)]"
        style={{ "--delay": "140ms" } as React.CSSProperties}
      >
        {hero.headline}
      </h2>

      {/* Everything under the sub-headline stays hidden until the first
          scroll, so the opening screen is the display line, the nav and the
          headline alone. No `rise` here: it simply appears. */}
      <RevealOnScroll>
        {/* One line from xl, sized in vw so it holds that line at any desktop
            width; below xl there is not the room, so it wraps. */}
        <p className="text-text mt-14 max-w-[90ch] text-lg leading-snug sm:text-xl lg:mt-24 lg:text-[1.4rem] xl:max-w-none xl:text-[clamp(1rem,1.3vw,1.4rem)] xl:whitespace-nowrap">
          {hero.summary}
        </p>

        <p className="text-text mt-5 max-w-[90ch] text-lg leading-snug sm:text-xl lg:text-[1.4rem]">
          {hero.body.text}
          <strong className="font-bold">{hero.body.strong}</strong>
          {hero.body.tail}
        </p>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-end">
          {/* `btn-strong` is the only thing separating the page's main action
            from the one beside it — without it both CTAs are the same pill and
            nothing tells a visitor which one we actually want them to take. */}
          <a
            href={hero.primaryCta.href}
            className="group btn btn-strong bg-surface gap-3"
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
          <a href={hero.secondaryCta.href} className="btn bg-surface">
            {hero.secondaryCta.label}
          </a>
        </div>
      </RevealOnScroll>
    </div>
  );
}
