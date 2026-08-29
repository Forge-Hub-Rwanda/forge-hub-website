import { HeroBackdrop } from "@/components/hero-backdrop";
import { hero, stats } from "@/lib/site";

/**
 * Above-the-fold hero: full-viewport backdrop, eyebrow, display headline,
 * supporting copy, paired CTAs, and a stat rail pinned to the fold line.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-28 pb-7 lg:pt-32 lg:pb-8"
    >
      <HeroBackdrop />

      {/* --- Headline block ------------------------------------------------ */}
      <div className="relative mx-auto flex w-full max-w-[92rem] flex-1 items-center px-6 lg:px-10">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p
            className="rise text-accent flex items-center gap-3 text-xs font-semibold tracking-[0.28em] uppercase"
            style={{ "--delay": "80ms" } as React.CSSProperties}
          >
            <span aria-hidden className="bg-accent h-px w-10" />
            {hero.eyebrow}
          </p>

          <h1
            className="rise text-display font-display text-text mt-7 text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.94] font-semibold"
            style={{ "--delay": "180ms" } as React.CSSProperties}
          >
            {hero.headline.lead}{" "}
            <span className="text-accent relative inline-block">
              {hero.headline.accent}
              {/* Hand-drawn-feeling underline beneath the accent word. */}
              <svg
                aria-hidden
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="text-accent-strong absolute -bottom-1 left-0 h-[0.14em] w-full"
              >
                <path
                  d="M2 9 C 70 2, 150 2, 298 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            {hero.headline.trail}
          </h1>

          <p
            className="rise text-text-muted mt-6 max-w-xl text-base leading-relaxed sm:mt-8 sm:text-xl"
            style={{ "--delay": "300ms" } as React.CSSProperties}
          >
            {hero.body}
          </p>

          {/* CTAs */}
          <div
            className="rise mt-9 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            style={{ "--delay": "420ms" } as React.CSSProperties}
          >
            <a
              href={hero.primaryCta.href}
              className="group bg-text font-display text-text-invert hover:bg-accent inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-semibold transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
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
              className="border-text/20 font-display text-text hover:border-accent hover:text-accent inline-flex items-center justify-center rounded-full border px-8 py-4 font-semibold transition-colors duration-300"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      {/* --- Fold rail: stats + scroll cue --------------------------------- */}
      <div
        className="rise relative mx-auto w-full max-w-[92rem] px-6 lg:px-10"
        style={{ "--delay": "560ms" } as React.CSSProperties}
      >
        <div className="border-line flex flex-col gap-6 border-t pt-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:pt-8">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:gap-x-16 lg:gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-display text-text block text-2xl font-semibold sm:text-3xl lg:text-4xl">
                    {stat.value}
                  </span>
                  <span className="text-text-muted mt-1 block text-[0.65rem] tracking-[0.14em] uppercase sm:text-xs sm:tracking-[0.16em]">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {/* Scroll cue */}
          <a
            href="#spaces"
            className="group text-text-muted hover:text-text hidden shrink-0 items-center gap-3 text-xs tracking-[0.24em] uppercase transition-colors lg:flex"
          >
            {hero.scrollCue}
            <span
              aria-hidden
              className="border-text/20 flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-1"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                <path
                  d="M12 4v15m0 0 6-6m-6 6-6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
