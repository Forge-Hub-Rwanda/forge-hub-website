"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import {
  HERO_DISPLAY_ID,
  LOCALE_FADE_TRAVEL,
  LOGO_SCROLL_TRAVEL,
  NAV_TUCK_TRAVEL,
} from "@/lib/motion";
import { footerColumns, hero, navItems, socials } from "@/lib/site";

const LOCALES = ["EN", "RW"] as const;

/** How small the logo tile gets once the page has scrolled. */
const LOGO_MIN_SCALE = 0.65;

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
  const logoRef = useRef<HTMLAnchorElement>(null);
  const tuckRef = useRef<HTMLDivElement>(null);
  const pinSentinelRef = useRef<HTMLDivElement>(null);
  // The logo tile eases down to LOGO_MIN_SCALE over its own scroll distance,
  // longer than the display line's, so it is still settling once the rest of
  // the header has finished moving. Written to a custom property in a rAF
  // callback, so scrolling never re-renders the header.
  useEffect(() => {
    const node = logoRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / LOGO_SCROLL_TRAVEL, 1);
      node.style.setProperty(
        "--logo-scale",
        String(1 - (1 - LOGO_MIN_SCALE) * progress),
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The nav links and language toggle slide right and fade as the display line
  // comes down onto them, leaving the logo — and the hamburger, so the site
  // stays navigable — alone at the top. Driven by the measured overlap rather
  // than a scroll threshold, so it stays correct at any viewport size, and it
  // reverses on the way back up. Once the nav is pinned the line is long gone,
  // so `pinned` holds it tucked rather than letting it spring back.
  useEffect(() => {
    const node = tuckRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const line = document.getElementById(HERO_DISPLAY_ID);
      let progress = 1;
      if (!pinned && line) {
        // The two sit flush at rest, so overlap starts at 0 and grows as the
        // nav rides up into the line's band.
        const overlap =
          line.getBoundingClientRect().bottom -
          node.getBoundingClientRect().top;
        progress = Math.min(Math.max(overlap / NAV_TUCK_TRAVEL, 0), 1);
      }

      node.style.setProperty("--nav-tuck", String(progress));
      // Keep faded-out links off the tab order and out of the a11y tree.
      if (progress > 0.9) node.setAttribute("inert", "");
      else node.removeAttribute("inert");
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned]);

  // The language toggle sits beside the hamburger but, unlike it, fades out
  // over the first stretch of scroll: it belongs to the hero, not to the rest
  // of the page. Two instances are rendered — one for the pinned corner below
  // lg, one in the desktop nav row — and only ever one is visible, so the
  // effect drives whichever are present rather than holding a single ref.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / LOCALE_FADE_TRAVEL, 1);
      for (const node of document.querySelectorAll<HTMLElement>(
        "[data-locale-toggle]",
      )) {
        node.style.setProperty("--locale-fade", String(1 - progress));
        // Once invisible it should not be tabbable either.
        if (progress > 0.9) node.setAttribute("inert", "");
        else node.removeAttribute("inert");
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Through the hero the nav travels with the page, sitting between the oblique
  // display line and the sub-headline; it pins to the top once its resting
  // position passes out of view. The sentinel marks that position and is
  // rendered ABOVE the spacer, so pinning cannot move it — otherwise adding the
  // spacer's height would push the sentinel back down and unpin the row, and
  // the two would oscillate. By the time the row pins the links have already
  // tucked away, so what stays visible at the top is the hamburger alone.
  useEffect(() => {
    const node = pinSentinelRef.current;
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

  // Home links return to the very top of the page. They keep href="#top" so
  // they still work with JavaScript unavailable — with no element of that id,
  // the fragment "top" is specified to mean the start of the document — while
  // the handler takes over to keep the hash out of the address bar.
  const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Leave modified clicks alone, so "open in new tab" still behaves.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    setMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const primaryNav = navItems.filter((item) => item.primary);

  // Small hover-reveal links per menu item, grouped from the footer's existing
  // link columns so the flyout doesn't need its own content to maintain.
  const linksByColumn = (title: string) =>
    footerColumns.find((column) => column.title === title)?.links ?? [];
  const subLinksByLabel: Record<string, ReturnType<typeof linksByColumn>> = {
    Spaces: linksByColumn("The building"),
    Membership: linksByColumn("Join"),
    Programs: linksByColumn("Programs"),
    Events: linksByColumn("More"),
    About: linksByColumn("More"),
    Community: linksByColumn("More"),
  };

  return (
    <>
      {/* --- Fixed centre logo tile --------------------------------------- */}
      <a
        ref={logoRef}
        href="#top"
        onClick={goHome}
        /* The centring translate lives in the inline transform rather than in a
           utility class: an inline transform replaces the class outright, so
           -translate-x-1/2 would be lost the moment the scale is applied.
           Scaling about the top keeps the tile pinned to the viewport edge. */
        className="fixed top-0 left-1/2 z-60 origin-top transition-opacity hover:opacity-85"
        style={
          {
            "--logo-scale": 1,
            transform: "translateX(-50%) scale(var(--logo-scale))",
          } as React.CSSProperties
        }
      >
        <Logo className="w-[3.1rem] sm:w-[3.875rem] lg:w-[4.4rem]" />
      </a>

      {/* --- Corner controls, below lg only ---------------------------------
          Phones and tablets have no nav row, so the hamburger and the language
          toggle live pinned in the corner. From lg they move into the nav row,
          sitting after the links — see below. */}
      <div className="fixed top-0 right-0 z-60 flex items-center gap-4 px-6 py-4 lg:hidden">
        <LocaleToggle
          locale={locale}
          onChange={setLocale}
          className="hidden sm:flex"
        />
        <MenuButton open={menuOpen} onOpen={() => setMenuOpen(true)} />
      </div>

      {/* Marks the nav row's resting position for the pin observer above. */}
      <div ref={pinSentinelRef} aria-hidden className="h-0" />

      {/* --- Desktop nav row ------------------------------------------------
          Only exists at lg, where it sits in flow between the oblique display
          line and the sub-headline as in the reference, tucking away as the
          line comes down onto it. Below lg there are no inline links, so the
          row is dropped entirely rather than left to occupy empty height. */}
      <div
        className={`hidden lg:block ${
          pinned ? "fixed inset-x-0 top-0 z-50" : "relative z-50"
        }`}
      >
        <div className="mx-auto flex max-w-[110rem] items-center justify-end gap-8 px-6 py-4 lg:px-10 lg:py-5">
          <div
            ref={tuckRef}
            className="flex items-center"
            style={
              {
                "--nav-tuck": 0,
                transform: "translateX(calc(var(--nav-tuck) * 80px))",
                opacity: "calc(1 - var(--nav-tuck))",
              } as React.CSSProperties
            }
          >
            <nav aria-label="Main">
              <ul className="flex items-center gap-11 xl:gap-14">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="group text-text relative block py-1 text-[1.05rem] font-medium"
                    >
                      {item.label}
                      {/* Rule draws in from the left on hover. */}
                      <span className="bg-text absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* At the right end of the row, after the links. Outside the tucking
              wrapper, so the hamburger holds its place as the links slide away
              and stays reachable once the row pins to the top. */}
          <div className="flex items-center gap-6">
            <LocaleToggle
              locale={locale}
              onChange={setLocale}
              className="flex"
            />
            <MenuButton open={menuOpen} onOpen={() => setMenuOpen(true)} />
          </div>
        </div>
      </div>

      {/* Reserves the nav's height while it is out of flow. */}
      <div aria-hidden hidden={!pinned} className="h-0 lg:h-[4.5rem]" />

      {/* --- Full-screen menu ---------------------------------------------
          Always mounted (not `hidden`) so the open/close transform can
          animate — `inert` takes it out of the tab order and off the a11y
          tree while closed instead. It starts translated fully above the
          viewport and drops into place, reversing on close. */}
      <div
        id="site-menu"
        data-open={menuOpen}
        inert={!menuOpen}
        aria-hidden={!menuOpen}
        className="bg-surface fixed inset-0 z-70 -translate-y-full overflow-y-auto opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
      >
        <div className="mx-auto flex min-h-full max-w-[110rem] flex-col px-6 py-5 lg:px-10">
          <div className="flex items-center justify-end">
            {/* Doubles as the "back to home" exit: it closes the drawer and
                the `href` carries the page back to the hero. */}
            <a
              href="#top"
              onClick={goHome}
              className="text-text flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
            >
              <span className="sr-only">Close menu and return to home</span>
              <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
                <path
                  d="M5 5l14 14M19 5L5 19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>

          <nav
            aria-label="All pages"
            className="flex flex-1 flex-col justify-center py-10"
          >
            <a
              href="#top"
              onClick={goHome}
              className="font-display text-heading text-text hover:text-accent mb-10 inline-block w-fit text-[clamp(2rem,6vw,3.5rem)] transition-colors sm:mb-16"
            >
              Home
            </a>

            <ul className="border-line border-t">
              {navItems.map((item) => {
                const subLinks = subLinksByLabel[item.label] ?? [];
                return (
                  <li
                    key={item.href}
                    className="group border-line relative border-b"
                  >
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group-hover:bg-text group-hover:text-text-invert flex flex-col gap-1 px-2 py-5 transition-colors sm:flex-row sm:items-baseline sm:gap-8 sm:px-4"
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

                    {/* Small related links, tucked into the item's bottom-right
                        corner and revealed only on hover. */}
                    {subLinks.length > 0 ? (
                      <div className="pointer-events-none absolute right-2 bottom-1.5 flex translate-y-1.5 flex-wrap justify-end gap-x-4 gap-y-1 opacity-0 transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 sm:right-4">
                        {subLinks.map((sub) => (
                          <a
                            key={`${item.href}-${sub.label}`}
                            href={sub.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-label text-text-invert/70 hover:text-text-invert pointer-events-auto"
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex flex-col gap-6 px-2 sm:px-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href={hero.primaryCta.href}
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-strong"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-strong"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>

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

/**
 * The EN/RW switch. Rendered once for the corner and once for the desktop nav
 * row; `data-locale-toggle` is how the scroll effect finds whichever is live.
 */
function LocaleToggle({
  locale,
  onChange,
  className,
}: {
  locale: (typeof LOCALES)[number];
  onChange: (locale: (typeof LOCALES)[number]) => void;
  className?: string;
}) {
  return (
    <div
      data-locale-toggle
      role="group"
      aria-label="Language"
      className={`items-center gap-1.5 ${className ?? ""}`}
      style={
        {
          "--locale-fade": 1,
          opacity: "var(--locale-fade)",
        } as React.CSSProperties
      }
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.68rem] font-bold transition-colors ${
              active
                ? "border-text bg-text text-text-invert"
                : "border-ink-300 text-text-muted hover:border-text hover:bg-text hover:text-text-invert"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

/** The three-bar menu trigger. Never fades: it is the only way into the menu. */
function MenuButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      aria-controls="site-menu"
      className="text-text flex h-8 w-8 flex-col items-center justify-center gap-[6px]"
    >
      <span className="sr-only">Open menu</span>
      <span className="block h-0.5 w-7 bg-current" />
      <span className="block h-0.5 w-7 bg-current" />
      <span className="block h-0.5 w-7 bg-current" />
    </button>
  );
}
