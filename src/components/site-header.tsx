"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { closing, navItems, socials } from "@/lib/site";

const LOCALES = ["EN", "RW"] as const;

/** Rendered by the page at the end of the hero zone; see the effect below. */
export const NAV_PIN_SENTINEL_ID = "nav-pin-sentinel";

/**
 * Site chrome, following the reference layout: the logo tile is pinned dead
 * centre at the very top of the viewport and never moves, while the nav is a
 * right-aligned row that sits low in the hero and rides up with the page,
 * pinning to the top only once the hero zone is behind it.
 *
 * The two never collide because the logo is centred and the nav is right-set.
 */
export function SiteHeader() {
  const [pinned, setPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("EN");
  // Through the hero the nav travels with the page, sitting between the oblique
  // display line and the sub-headline. It pins to the top only once the hero
  // zone has scrolled past — signalled by the sentinel the page renders at the
  // hero's end, watched here rather than owned so the nav can stay in flow.
  useEffect(() => {
    const node = document.getElementById(NAV_PIN_SENTINEL_ID);
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setPinned(entry.boundingClientRect.top <= 0),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Lock body scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const primaryNav = navItems.filter((item) => item.primary);

  return (
    <>
      {/* --- Fixed centre logo tile --------------------------------------- */}
      <a
        href="#top"
        className="fixed top-0 left-1/2 z-60 -translate-x-1/2 transition-opacity hover:opacity-85"
      >
        <Logo className="w-16 text-[1.35rem] sm:w-20 sm:text-[1.6rem] lg:w-[5.75rem] lg:text-[1.75rem]" />
      </a>

      {/* --- Nav row -------------------------------------------------------
          In flow to begin with, so it sits between the oblique display line
          and the sub-headline as in the reference. Once the hero zone is past
          it switches to fixed, and the spacer below takes over its space so
          the page does not jump at the swap. */}
      <div
        className={
          pinned ? "bg-surface fixed inset-x-0 top-0 z-50" : "relative z-50"
        }
      >
        <div className="mx-auto flex max-w-[110rem] items-center justify-end gap-8 px-6 py-4 lg:gap-12 lg:px-10 lg:py-5">
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9 xl:gap-11">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group text-text relative block py-1 text-[0.95rem] font-medium"
                  >
                    {item.label}
                    {/* Rule draws in from the left on hover. */}
                    <span className="bg-text absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language toggle */}
          <div
            className="hidden items-center gap-1.5 sm:flex"
            role="group"
            aria-label="Language"
          >
            {LOCALES.map((code) => {
              const active = locale === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  aria-pressed={active}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.68rem] font-bold transition-colors ${
                    active
                      ? "border-text bg-text text-text-invert"
                      : "border-ink-300 text-text-muted hover:border-text hover:text-text"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>

          {/* Hamburger — the only way into the full menu on small screens,
              and a supplement to the visible nav on large ones. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="text-text flex h-8 w-8 flex-col items-center justify-center gap-[6px]"
          >
            <span className="sr-only">Open menu</span>
            <span className="block h-0.5 w-7 bg-current" />
            <span className="block h-0.5 w-7 bg-current" />
          </button>
        </div>
      </div>

      {/* Reserves the nav's height while it is out of flow. */}
      <div aria-hidden hidden={!pinned} className="h-16 lg:h-[4.5rem]" />

      {/* --- Full-screen menu --------------------------------------------- */}
      <div
        id="site-menu"
        hidden={!menuOpen}
        className="bg-surface fixed inset-0 z-70 overflow-y-auto"
      >
        <div className="mx-auto flex min-h-full max-w-[110rem] flex-col px-6 py-5 lg:px-10">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-text flex h-11 w-11 items-center justify-center"
            >
              <span className="sr-only">Close menu</span>
              <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
                <path
                  d="M5 5l14 14M19 5L5 19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav
            aria-label="All pages"
            className="flex flex-1 flex-col justify-center py-10"
          >
            <ul className="border-line border-t">
              {navItems.map((item) => (
                <li key={item.href} className="border-line border-b">
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group hover:bg-text hover:text-text-invert flex flex-col gap-1 px-2 py-5 transition-colors sm:flex-row sm:items-baseline sm:gap-8 sm:px-4"
                  >
                    <span className="font-display text-heading w-full text-[clamp(2rem,6vw,3.5rem)] sm:w-1/2">
                      {item.label}
                    </span>
                    {item.blurb ? (
                      <span className="text-text-muted group-hover:text-text-invert/70 text-sm sm:text-base">
                        {item.blurb}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-6 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <a
                href={closing.primaryCta.href}
                onClick={() => setMenuOpen(false)}
                className="bg-text text-text-invert hover:bg-accent inline-flex w-full items-center justify-center px-8 py-4 font-bold transition-colors sm:w-auto"
              >
                {closing.primaryCta.label}
              </a>
              <ul className="flex flex-wrap gap-6">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="text-text-muted hover:text-text text-label transition-colors"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
