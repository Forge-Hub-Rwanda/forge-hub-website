import Link from "next/link";
import { ImigongoCorner } from "@/components/imigongo";
import { Logo } from "@/components/logo";
import { Odometer } from "@/components/odometer";
import { RollText } from "@/components/split-text";
import { SiteFooter } from "@/components/site-footer";
import { notFoundPage } from "@/lib/site";

/**
 * The 404, for any unmatched URL and for `notFound()` in `portfolio/[slug]`.
 * Both cases previously fell through to Next's stock page, which carries none
 * of the site's type, colour or navigation.
 *
 * It deliberately does NOT render `SiteHeader`. That component measures the
 * hero's display line to decide how far to tuck the nav, and there is no
 * display line here — it would mount already fully tucked and `inert`, which
 * is a navigation bar nobody can reach. A logo that links home, three routes
 * out, and the footer's own nav do the same job honestly.
 *
 * Nothing here is wrapped in `Reveal` either. This is the page shown when
 * something has already gone wrong, so it must not also depend on an
 * IntersectionObserver firing before any of it becomes visible.
 */
export default function NotFound() {
  return (
    <>
      <main className="relative flex flex-col px-6 pt-10 pb-24 lg:px-[3.6vw] lg:pt-12 lg:pb-32">
        <ImigongoCorner
          id="imigongo-404-corner"
          motif="lozenge"
          opacity={0.13}
          className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
        />

        <Link
          href="/"
          className="relative z-10 w-fit transition-opacity hover:opacity-85"
        >
          <span className="sr-only">ForgeHub Rwanda, home</span>
          <Logo className="w-[3.1rem] sm:w-[3.875rem] lg:w-[4.4rem]" />
        </Link>

        <div className="relative z-10 mt-16 lg:mt-24">
          <p className="text-label text-text-muted">{notFoundPage.eyebrow}</p>

          {/* The code is set as display type rather than as the heading: it is
              the loudest thing on the page, but "404" is not what the page is
              about, so the sentence below it carries the `h1`. */}
          {/* Rolls up to "404" like a counter on arrival — the one playful
              moment on a page that is otherwise all way-finding. `immediate`,
              because this must not wait on an observer to show anything. */}
          <p
            aria-hidden
            className="font-display text-oblique text-text mt-6 text-[clamp(4rem,14vw,10rem)] leading-none"
          >
            <Odometer value={notFoundPage.code} immediate />
          </p>

          <h1 className="font-display text-heading text-text mt-6 max-w-[18ch] text-[clamp(2rem,5vw,4rem)]">
            {notFoundPage.title}
          </h1>

          <p className="text-text-muted mt-8 max-w-[52ch] text-lg leading-snug">
            {notFoundPage.body}
          </p>

          <nav
            aria-label="Where to go next"
            className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            {notFoundPage.links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={index === 0 ? "btn btn-strong" : "btn"}
              >
                <RollText>{link.label}</RollText>
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
