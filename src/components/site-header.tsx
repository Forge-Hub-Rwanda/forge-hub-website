"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLenis } from "@/lib/lenis";
import {
  HERO_DISPLAY_ID,
  LOCALE_FADE_TRAVEL,
  LOGO_SCROLL_TRAVEL,
  NAV_TUCK_TRAVEL,
} from "@/lib/motion";
import { hero, menuColumns, navItems, socials } from "@/lib/site";

const LOCALES = ["EN", "RW"] as const;

/**
 * The hero's primary CTA is an in-page anchor (`#programs`), which is correct
 * in the hero itself — that band is on the same page. The menu is global
 * chrome shown on all seven routes, and four of them have no `#programs`
 * element at all, so the bare fragment there is a link that does nothing.
 * Rooting it at "/" makes it navigate home and then scroll, from anywhere.
 */
const menuPrimaryHref = hero.primaryCta.href.startsWith("#")
  ? `/${hero.primaryCta.href}`
  : hero.primaryCta.href;

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
  const pathname = usePathname();
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

  // The fixed chrome — the logo tile, the menu button and the theme toggle —
  // rides over whatever the page happens to be showing. Over a full-bleed
  // colour band the tile, which is oxblood itself, would vanish into oxblood,
  // and the controls, drawn in near-black, would be close behind it. So the
  // overlap is measured here and `data-chrome` on <html> switches the lot to
  // white; the rules that act on it live in `globals.css`.
  //
  // Unlike every other scroll effect in this component, this one runs under
  // `prefers-reduced-motion` as well. It is a legibility fix rather than
  // decoration, and a visitor who has asked for less motion still has to be
  // able to see the logo.
  useEffect(() => {
    const root = document.documentElement;

    // The menu overlay covers the chrome and carries a theme toggle of its own,
    // sitting on an ordinary page surface — leaving the flag set would paint
    // that one white on white. Clearing it while the menu is open is the whole
    // reason this effect depends on `menuOpen`.
    if (menuOpen) {
      root.removeAttribute("data-chrome");
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      // One probe line through the middle of the chrome cluster is enough: a
      // band spans the full width of the page, so anything crossing this line
      // crosses all of it. 30px is inside the logo tile at every scale it
      // takes, and inside the corner controls' 32px circles.
      const PROBE_Y = 30;

      const onColor = Array.from(document.querySelectorAll("[data-tone]")).some(
        (band) => {
          const rect = band.getBoundingClientRect();
          return rect.top <= PROBE_Y && rect.bottom >= PROBE_Y;
        },
      );

      if (onColor) root.setAttribute("data-chrome", "on-color");
      else root.removeAttribute("data-chrome");
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
      root.removeAttribute("data-chrome");
    };
    // `pathname` re-measures after a navigation, where the bands are different
    // ones at different offsets and the old measurement means nothing.
  }, [menuOpen, pathname]);

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

  // Home links point at "/", so they work with JavaScript unavailable and from
  // any page on the site. On the homepage itself a full navigation would be
  // wasteful, so the handler takes over there and scrolls to the top instead.
  const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Off the homepage this is a real navigation — leave it to the browser.
    if (pathname !== "/") {
      setMenuOpen(false);
      return;
    }

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

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Native smooth scrolling and Lenis fight over the same journey, so hand it
    // to whichever is actually driving the page.
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: reduced });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const primaryNav = navItems.filter((item) => item.primary);

  // Small hover-reveal links per menu item, grouped in `site.ts` so the flyout
  // doesn't need its own content to maintain.
  const linksByColumn = (title: string) =>
    menuColumns.find((column) => column.title === title)?.links ?? [];
  const subLinksByLabel: Record<string, ReturnType<typeof linksByColumn>> = {
    About: linksByColumn("Company"),
    Services: linksByColumn("What we do"),
    Team: linksByColumn("Company"),
    Contact: linksByColumn("Join"),
  };

  return (
    <>
      {/* --- Fixed centre logo tile --------------------------------------- */}
      <Link
        ref={logoRef}
        href="/"
        onClick={goHome}
        data-logo-tile
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
      </Link>

      {/* --- Corner controls, below lg only ---------------------------------
          Phones and tablets have no nav row, so the hamburger and the language
          toggle live pinned in the corner. From lg they move into the nav row,
          sitting after the links — see below. */}
      <div className="fixed top-0 right-0 z-60 flex items-center gap-4 px-6 py-4 lg:hidden">
        {/* Unlike the locale toggle it is kept at every width: one 32px circle
            leaves the cluster narrow enough to clear the centred logo tile even
            on the smallest phone, once EN/RW has dropped out below sm. */}
        <ThemeToggle className="flex" />
        <LocaleToggle
          locale={locale}
          onChange={setLocale}
          className="hidden sm:flex"
        />
        <MenuButton open={menuOpen} onOpen={() => setMenuOpen(true)} />
      </div>

      {/* Drops the desktop nav row to the vertical middle of the first screen,
          so the space above it matches the space below. It is the viewport's
          half-height, less the half-row (2.25rem), the display block's top
          padding (8rem) and the line itself (9.2vw at a 0.86 line-height — see
          HeroDisplay). Placed above the pin sentinel so the row still pins
          exactly when it reaches the top, rather than jumping up from
          mid-screen; floored at zero for short, wide windows. */}
      <div
        aria-hidden
        className="hidden lg:block lg:h-[max(0px,calc(50vh-10.25rem-7.91vw))]"
      />

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
                      {/* An imigongo zigzag draws in from the left on hover,
                          and on keyboard focus, which is the same cue for
                          anyone not using a mouse. See `imigongo-underline`. */}
                      <span
                        aria-hidden
                        className="imigongo-underline group-hover:imigongo-underline-on group-focus-visible:imigongo-underline-on absolute inset-x-0 -bottom-1 h-[5px] bg-current"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* At the right end of the row, after the links. Outside the tucking
              wrapper, so the hamburger holds its place as the links slide away
              and stays reachable once the row pins to the top.

              The theme toggle sits here too and, unlike the locale toggle
              beside it, carries no fade: the locale belongs to the hero, but
              the theme is a setting for the whole site and should be reachable
              from anywhere on the page without opening the menu first. */}
          <div className="flex items-center gap-6">
            <ThemeToggle className="flex" />
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
            <Link
              href="/"
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
            </Link>
          </div>

          <nav
            aria-label="All pages"
            className="flex flex-1 flex-col justify-center py-10"
          >
            <Link
              href="/"
              onClick={goHome}
              className="font-display text-heading text-text hover:text-accent mb-10 inline-block w-fit text-[clamp(2rem,6vw,3.5rem)] transition-colors sm:mb-16"
            >
              Home
            </Link>

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
                      className="group-hover:bg-text group-hover:text-text-invert group-focus-within:bg-text group-focus-within:text-text-invert flex flex-col gap-1 px-2 py-5 transition-colors sm:flex-row sm:items-baseline sm:gap-8 sm:px-4"
                    >
                      <span className="font-display text-heading w-full text-[clamp(2rem,6vw,3.5rem)] sm:w-1/2">
                        {item.label}
                      </span>
                      {item.blurb ? (
                        <span className="text-text-muted group-hover:text-text-invert/70 group-focus-within:text-text-invert/70 text-sm sm:text-base">
                          {item.blurb}
                        </span>
                      ) : null}
                    </a>

                    {/* Small related links, tucked into the item's bottom-right
                        corner and revealed on hover — and on focus, which is
                        the same reveal for anyone using a keyboard. Without the
                        `group-focus-within` pair these stay at `opacity: 0`
                        while still being real tab stops, so tabbing through the
                        menu lands on links nobody can see. The row above
                        inverts on focus too, so the revealed labels are white
                        on the dark fill rather than white on white. */}
                    {subLinks.length > 0 ? (
                      <div className="pointer-events-none absolute right-2 bottom-1.5 flex translate-y-1.5 flex-wrap justify-end gap-x-4 gap-y-1 opacity-0 transition-all duration-300 ease-[var(--ease-out-expo)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 sm:right-4">
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
                  href={menuPrimaryHref}
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-strong"
                >
                  {hero.primaryCta.label}
                </a>
                {/* Plain `btn`: with both at `btn-strong` the pair carried no
                    hierarchy, which is the same problem the page CTAs had. */}
                <a
                  href={hero.secondaryCta.href}
                  onClick={() => setMenuOpen(false)}
                  className="btn"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>

              {/* A third instance. The menu overlay sits above the corner
                  cluster, so without a copy here the theme could not be
                  changed while the menu is open. */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <ThemeToggle className="flex" />

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
                : "border-line-mid text-text-muted hover:border-text hover:bg-text hover:text-text-invert"
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
      data-chrome-ink
      className="text-text flex h-8 w-8 flex-col items-center justify-center gap-[6px]"
    >
      <span className="sr-only">Open menu</span>
      <span className="block h-0.5 w-7 bg-current" />
      <span className="block h-0.5 w-7 bg-current" />
      <span className="block h-0.5 w-7 bg-current" />
    </button>
  );
}
