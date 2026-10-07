import { HERO_RELEASE_ID } from "@/lib/motion";
import { Magnetic } from "@/components/magnetic";
import { RollText, SplitWords } from "@/components/split-text";
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
      className="relative z-20 px-6 pt-6 pb-28 lg:px-[3.6vw] lg:pt-4 lg:pb-28 lg:landscape:pt-2 lg:landscape:pl-[calc(3.6vw+8px)]"
    >
      {/* The sticky display line above releases as this headline reaches it.
          The words rise on their own rather than the heading carrying `rise`,
          which also keeps the element HeroDisplay measures free of any
          transform while it plays. */}
      <h2
        id={HERO_RELEASE_ID}
        className="font-display text-heading text-text max-w-[19ch] text-[clamp(2.25rem,5.4vw,4.75rem)] lg:landscape:ml-5"
        style={{ "--delay": "140ms" } as React.CSSProperties}
      >
        <SplitWords text={hero.headline} mode="load" />
      </h2>

      {/* Everything under the sub-headline is shown from the first paint. It
          used to wait for the first scroll, which on phones read as the page
          failing to load. No `rise` here: it simply appears. */}
      {/* Phones get one short sentence in place of the two below: the
            summary and the paragraph say the same thing twice, and on a
            phone's first screen that is what made the hero feel crammed. */}
      <p className="text-text mt-16 max-w-[34ch] text-lg leading-snug sm:text-xl lg:hidden">
        {hero.phoneLine}
      </p>

      {/* One line from xl, sized in vw so it holds that line at any desktop
            width; below xl there is not the room, so it wraps. */}
      <p className="text-text mt-14 hidden max-w-[90ch] text-lg leading-snug sm:text-xl lg:mt-24 lg:block lg:text-[1.4rem] xl:max-w-none xl:text-[clamp(1rem,1.3vw,1.4rem)] xl:whitespace-nowrap">
        {hero.summary}
      </p>

      <p className="text-text mt-5 hidden max-w-[90ch] text-lg leading-snug sm:text-xl lg:block lg:text-[1.4rem]">
        {hero.body.text}
        <strong className="font-bold">{hero.body.strong}</strong>
        {hero.body.tail}
      </p>

      <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-4 lg:justify-end">
        {/* `btn-strong` is the only thing separating the page's main action
            from the one beside it — without it both CTAs are the same pill and
            nothing tells a visitor which one we actually want them to take. */}
        <Magnetic>
          <a
            href={hero.primaryCta.href}
            className="group btn btn-strong bg-surface gap-3"
          >
            <RollText>{hero.primaryCta.label}</RollText>
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
        </Magnetic>
        <a href={hero.secondaryCta.href} className="btn bg-surface">
          <RollText>{hero.secondaryCta.label}</RollText>
        </a>
      </div>
    </div>
  );
}
