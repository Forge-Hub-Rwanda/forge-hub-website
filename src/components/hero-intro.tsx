import { hero } from "@/lib/site";

/**
 * The upright half of the hero: sub-headline, lead paragraphs and CTAs.
 *
 * Sits below the nav row, matching the reference's stacking order of oblique
 * display line → navigation → upright headline → body.
 */
export function HeroIntro() {
  return (
    <div className="relative z-20 px-6 pt-14 pb-24 lg:px-[3.6vw] lg:pt-28 lg:pb-32">
      <h2
        className="rise font-display text-heading text-text max-w-[19ch] text-[clamp(2.25rem,5.4vw,4.75rem)]"
        style={{ "--delay": "140ms" } as React.CSSProperties}
      >
        {hero.headline}
      </h2>

      <div
        className="rise mt-14 max-w-[68ch] space-y-5 lg:mt-24"
        style={{ "--delay": "280ms" } as React.CSSProperties}
      >
        {hero.body.map((paragraph) => (
          <p
            key={paragraph.text}
            className="text-text text-lg leading-snug sm:text-xl lg:text-[1.4rem]"
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
        className="rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        style={{ "--delay": "400ms" } as React.CSSProperties}
      >
        <a
          href={hero.primaryCta.href}
          className="group bg-text text-text-invert hover:bg-accent inline-flex items-center justify-center gap-3 px-8 py-4 font-bold transition-colors duration-300"
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
          className="border-text text-text hover:bg-text hover:text-text-invert inline-flex items-center justify-center border px-8 py-4 font-bold transition-colors duration-300"
        >
          {hero.secondaryCta.label}
        </a>
      </div>
    </div>
  );
}
