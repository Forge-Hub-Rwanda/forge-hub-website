import { ImigongoRule } from "@/components/imigongo";
import { SplitLetters } from "@/components/split-text";
import { HERO_DISPLAY_ID } from "@/lib/motion";

/**
 * The hero for a subpage, split into the two halves the homepage hero is split
 * into so that `<SiteHeader />` can sit between them, exactly as it does on the
 * homepage: oblique display line → navigation → upright copy.
 *
 * The line carries `HERO_DISPLAY_ID` because SiteHeader measures that element
 * to decide how far the nav row has tucked away. With no such element on the
 * page the nav treats itself as fully tucked and the desktop links disappear,
 * so this is load-bearing rather than decorative.
 *
 * Unlike the homepage's, this line does not stick or shrink on scroll: page
 * titles here are single words, and a shrinking one-word line reads as a
 * glitch rather than as the poster line receding. It keeps the same `rise`
 * entrance and the same type treatment, so the two still feel like one site.
 *
 * The title rises letter by letter on a tilt — one word, so there is nothing
 * else to split it by, and at this size the kerning the split costs is not
 * visible.
 */
export function PageHeroLine({ title }: { title: string }) {
  return (
    <div className="rise pointer-events-none relative z-20 px-6 pt-24 sm:pt-28 lg:px-[3.6vw] lg:pt-32">
      <h1
        id={HERO_DISPLAY_ID}
        className="font-display text-oblique text-text text-[9.1vw] text-nowrap lg:text-[9.7vw]"
      >
        <SplitLetters text={title} />
      </h1>
    </div>
  );
}

/**
 * The upright half: eyebrow and lead paragraph. Carries `id="hero-intro"` and
 * `tabIndex={-1}` so the skip link in the root layout lands here on every page,
 * the same way it lands on `HeroIntro` at home.
 */
export function PageIntro({
  eyebrow,
  lede,
}: {
  eyebrow: string;
  lede: string;
}) {
  return (
    <div
      id="hero-intro"
      tabIndex={-1}
      className="relative z-20 px-6 pt-10 pb-20 lg:px-[3.6vw] lg:pt-20 lg:pb-28"
    >
      <p
        className="rise text-label text-text-muted flex items-center gap-4"
        style={{ "--delay": "140ms" } as React.CSSProperties}
      >
        <ImigongoRule />
        {eyebrow}
      </p>

      <p
        className="rise text-text mt-8 max-w-[60ch] text-lg leading-snug sm:text-xl lg:text-[1.4rem]"
        style={{ "--delay": "280ms" } as React.CSSProperties}
      >
        {lede}
      </p>
    </div>
  );
}
