"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImigongoBand, ImigongoRule } from "@/components/imigongo";
import { Logo } from "@/components/logo";
import { RollText } from "@/components/split-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLenis } from "@/lib/lenis";
import { PHONE_QUERY } from "@/lib/motion-tier";
import {
  HERO_DISPLAY_ID,
  LOGO_SCROLL_TRAVEL,
  NAV_TUCK_TRAVEL,
} from "@/lib/motion";
import {
  hero,
  menuColumns,
  navItems,
  site,
  socials,
  type NavItem,
} from "@/lib/site";

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
  // Which row's related links are unfolded in the menu, below lg.
  const [expanded, setExpanded] = useState<string | null>(null);
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
    let written = "";

    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / LOGO_SCROLL_TRAVEL, 1);
      // Written only on a change, so past its travel — most of the page — the
      // tile is never restyled by a scroll at all.
      const scale = String(1 - (1 - LOGO_MIN_SCALE) * progress);
      if (scale === written) return;
      written = scale;
      node.style.setProperty("--logo-scale", scale);
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

  // The nav links slide right and fade as the display line
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
    let written = NaN;

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

      // Written only on a change: once tucked, scrolling restyles nothing.
      if (progress === written) return;
      written = progress;

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
    let written: boolean | null = null;

    // One probe line through the middle of the chrome cluster is enough: a
    // band spans the full width of the page, so anything crossing this line
    // crosses all of it. 30px is inside the logo tile at every scale it
    // takes, and inside the corner controls' 32px circles.
    const PROBE_Y = 30;

    // Each band's extent in document px, measured when the layout changes
    // rather than on every scroll. The bands are ordinary sections in the
    // flow, so their document position plus `scrollY` is exactly what a rect
    // would report — without making the browser resolve layout mid-scroll.
    const bands = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tone]"),
    );
    let extents: { top: number; bottom: number }[] = [];

    const update = () => {
      frame = 0;

      const probe = window.scrollY + PROBE_Y;
      const onColor = extents.some(
        (band) => band.top <= probe && band.bottom >= probe,
      );

      if (onColor === written) return;
      written = onColor;
      if (onColor) root.setAttribute("data-chrome", "on-color");
      else root.removeAttribute("data-chrome");
    };

    const measure = () => {
      const scroll = window.scrollY;
      extents = bands.map((band) => {
        const rect = band.getBoundingClientRect();
        return { top: rect.top + scroll, bottom: rect.bottom + scroll };
      });
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Anything above a band changing height moves it, and that changes the
    // body's height too; a band's own height is watched directly.
    const sizer = new ResizeObserver(measure);
    sizer.observe(document.body);
    for (const band of bands) sizer.observe(band);

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      sizer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
      root.removeAttribute("data-chrome");
    };
    // `pathname` re-measures after a navigation, where the bands are different
    // ones at different offsets and the old measurement means nothing.
  }, [menuOpen, pathname]);

  // On a phone or tablet the fixed logo tile and corner controls sit over the
  // page's own text, with nothing behind them. So below lg they slide up out of
  // the way while the visitor scrolls down — reading — and come straight back
  // on any scroll up, which is where a reader reaches for the menu. Never in
  // the first screen, and never while the menu is open. The movement itself is
  // in globals.css, scoped to `data-chrome-away` and to narrow windows; this
  // only decides when.
  useEffect(() => {
    const root = document.documentElement;
    const narrow = window.matchMedia(PHONE_QUERY);
    if (menuOpen) {
      root.removeAttribute("data-chrome-away");
      return;
    }

    /** Clear of the first screen's heading before anything hides. */
    const TOP = 120;
    /** Downward travel that counts as reading, so a jitter never hides it. */
    const DOWN = 8;

    let frame = 0;
    let last = window.scrollY;
    let down = 0;
    let away = false;

    const set = (next: boolean) => {
      if (next === away) return;
      away = next;
      if (next) root.setAttribute("data-chrome-away", "");
      else root.removeAttribute("data-chrome-away");
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      if (!narrow.matches || y < TOP) {
        down = 0;
        set(false);
      } else if (delta > 0) {
        down += delta;
        if (down > DOWN) set(true);
      } else if (delta < 0) {
        down = 0;
        set(false);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.removeAttribute("data-chrome-away");
    };
  }, [menuOpen]);

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

  // Every open starts with the rows folded, whatever was left open last time.
  const openMenu = () => {
    setExpanded(null);
    setMenuOpen(true);
  };

  const primaryNav = navItems.filter((item) => item.primary);

  // Small hover-reveal links per menu item, grouped in `site.ts` so the flyout
  // doesn't need its own content to maintain.
  const linksByColumn = (title: string) =>
    menuColumns.find((column) => column.title === title)?.links ?? [];
  const subLinksByLabel: Record<string, NavItem[]> = {
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
          Phones and tablets have no nav row, so the hamburger and the other
          controls live pinned in the corner. From lg they move into the nav
          row, sitting after the links — see below. */}
      <div
        data-corner-chrome
        className="fixed top-0 right-0 z-60 flex items-center gap-4 px-6 py-4 lg:hidden"
      >
        {/* Kept at every width: one 32px circle leaves the cluster narrow
            enough to clear the centred logo tile even on the smallest phone. */}
        <ThemeToggle className="flex" />
        {/* Drops out below sm for the same reason: the smallest phones only
            have room for one circle beside the centred logo. The menu carries
            its own copy, so it is still reachable there. */}
        <AccountLink className="hidden sm:flex" />
        <MenuButton open={menuOpen} onOpen={openMenu} />
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
                      <RollText>{item.label}</RollText>
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

              The theme toggle and the account link sit here too and carry no
              fade: both are for the whole site and should be reachable from
              anywhere on the page without opening the menu first. */}
          <div className="flex items-center gap-6">
            <ThemeToggle className="flex" />
            <AccountLink className="flex" />
            <MenuButton open={menuOpen} onOpen={openMenu} />
          </div>
        </div>
      </div>

      {/* Reserves the nav's height while it is out of flow. */}
      <div aria-hidden hidden={!pinned} className="h-0 lg:h-[4.5rem]" />

      {/* --- Full-screen menu ---------------------------------------------
          Always mounted (not `hidden`) so the curtains can animate — `inert`
          takes it out of the tab order and off the a11y tree while closed,
          and `globals.css` hides it outright once the close has played.

          Two layouts from one tree. Below lg it is a single column: the rows
          at the top, the calls to action at the foot where a thumb reaches,
          and each row's related links folded under a chevron. From lg the
          rows take the left two-thirds and the calls to action a side column,
          and the related links swap in for the blurb on hover.

          Every size in the list is capped by the viewport's height as well as
          its width, so the whole menu fits on one screen on a short laptop or
          a phone with its browser bars showing — the side column and the foot
          are where anything added later (an account, a sign-in) goes. */}
      <div
        id="site-menu"
        data-open={menuOpen}
        inert={!menuOpen}
        aria-hidden={!menuOpen}
        className="fixed inset-0 z-70"
      >
        <div aria-hidden className="menu-veil" />

        <div data-lenis-prevent className="menu-panel">
          <div className="mx-auto flex min-h-full max-w-[110rem] flex-col px-6 lg:px-10">
            {/* --- Top bar --- */}
            <div className="flex h-16 shrink-0 items-center justify-between lg:h-20">
              <p
                className="menu-fade text-label text-text-muted flex items-center gap-3"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <ImigongoRule className="text-accent" />
                Menu
              </p>

              <div className="flex items-center gap-4 lg:gap-6">
                {/* A third instance. The menu overlay sits above the corner
                    cluster, so without a copy here the theme could not be
                    changed while the menu is open. */}
                <ThemeToggle className="flex" />
                <AccountLink
                  className="flex"
                  onNavigate={() => setMenuOpen(false)}
                />

                {/* Doubles as the "back to home" exit: it closes the drawer
                    and the `href` carries the page back to the hero. It sits
                    exactly where the hamburger was, so open and close are
                    one spot. */}
                <Link
                  href="/"
                  onClick={goHome}
                  className="text-text -mr-1.5 flex h-11 w-11 items-center justify-center transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] hover:rotate-90 hover:opacity-70"
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
            </div>

            <div className="flex flex-1 flex-col justify-between gap-6 pb-6 lg:grid lg:grid-cols-12 lg:content-center lg:gap-x-16 lg:pb-8">
              {/* --- The rows --- */}
              <nav
                aria-label="All pages"
                className="flex flex-col lg:col-span-8 lg:justify-center"
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="menu-line bg-line absolute inset-x-0 top-0 h-px"
                    style={{ "--i": 0 } as React.CSSProperties}
                  />
                  <ul>
                    <MenuRow
                      order={0}
                      label="Home"
                      href="/"
                      onNavigate={goHome}
                      home
                    />
                    {navItems.map((item, index) => (
                      <MenuRow
                        key={item.href}
                        order={index + 1}
                        label={item.label}
                        href={item.href}
                        blurb={item.blurb}
                        subLinks={subLinksByLabel[item.label]}
                        expanded={expanded === item.label}
                        onToggle={() =>
                          setExpanded((current) =>
                            current === item.label ? null : item.label,
                          )
                        }
                        onNavigate={() => setMenuOpen(false)}
                      />
                    ))}
                  </ul>
                </div>
              </nav>

              {/* --- Side column from lg, the foot below it ---
                  From lg the grid's one row is centred rather than stretched,
                  so this column takes the rows' own height: the tagline
                  starts level with the first rule, the buttons end level with
                  the last. */}
              <div className="flex flex-col gap-6 lg:col-span-4 lg:justify-between">
                {/* The brand's three words, one to a line. Desktop only: on a
                    phone the height is worth more to the rows. */}
                <p className="font-display text-heading hidden text-[clamp(2rem,min(3vw,6svh),3.25rem)] lg:block">
                  {site.tagline.map((word, index) => (
                    <span key={word} className="menu-slot">
                      <span
                        className={`menu-rise ${
                          index === site.tagline.length - 1
                            ? "text-accent"
                            : "text-text-muted"
                        }`}
                        style={
                          {
                            "--i": navItems.length + 1 + index,
                          } as React.CSSProperties
                        }
                      >
                        {word}.
                      </span>
                    </span>
                  ))}
                </p>

                <div
                  className="menu-fade flex flex-col gap-5"
                  style={{ "--i": navItems.length + 2 } as React.CSSProperties}
                >
                  <div className="grid gap-3 sm:flex sm:flex-wrap lg:grid">
                    <a
                      href={menuPrimaryHref}
                      onClick={() => setMenuOpen(false)}
                      className="btn btn-strong"
                    >
                      <RollText>{hero.primaryCta.label}</RollText>
                    </a>
                    {/* Plain `btn`: with both at `btn-strong` the pair carried
                        no hierarchy, which is the same problem the page CTAs
                        had. */}
                    <a
                      href={hero.secondaryCta.href}
                      onClick={() => setMenuOpen(false)}
                      className="btn"
                    >
                      <RollText>{hero.secondaryCta.label}</RollText>
                    </a>
                  </div>

                  {socials.length > 0 ? (
                    <ul className="flex flex-wrap gap-x-6 gap-y-3">
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
                  ) : null}
                </div>
              </div>
            </div>

            {/* The same sawtooth banding that tops the footer, closing the
                panel off. Drawn in last, like the rules above it. */}
            <div
              aria-hidden
              className="menu-line text-text shrink-0"
              style={{ "--i": navItems.length + 3 } as React.CSSProperties}
            >
              <ImigongoBand id="menu-band" opacity={0.18} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * One row of the full-screen menu: an index, the label, its blurb, and — for
 * the rows that have them — the related links.
 *
 * The related links are rendered twice on purpose, and only one copy is ever
 * displayed. From lg they sit inside the row's hover group and swap in for the
 * blurb. Below lg, where there is no hover, they fold out under the row from a
 * chevron — kept outside the group, so tapping it does not invert the row the
 * way focusing a link inside the group would.
 */
function MenuRow({
  order,
  label,
  href,
  blurb,
  subLinks = [],
  expanded = false,
  onToggle,
  onNavigate,
  home = false,
}: {
  /** Place in the entrance order, and the index printed on the row. */
  order: number;
  label: string;
  href: string;
  blurb?: string;
  subLinks?: NavItem[];
  expanded?: boolean;
  onToggle?: () => void;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Home goes through `Link`, so `goHome` can scroll instead of navigating. */
  home?: boolean;
}) {
  const style = { "--i": order } as React.CSSProperties;
  const hasSubLinks = subLinks.length > 0;
  const subId = `menu-sub-${label.toLowerCase()}`;

  // The inverted fill sweeps up behind imigongo teeth (`fill-rise`) rather
  // than switching on, and the label rolls with it.
  const rowClass =
    "fill-rise group-hover:text-text-invert group-focus-within:text-text-invert flex items-center gap-4 px-2 py-[clamp(0.5rem,1.5svh,1rem)] transition-colors sm:gap-6 sm:px-4";

  const content = (
    <>
      <span
        className="menu-fade text-label text-text-muted group-hover:text-text-invert/60 group-focus-within:text-text-invert/60 w-6 shrink-0 tabular-nums transition-colors"
        style={style}
      >
        {String(order).padStart(2, "0")}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <span className="menu-slot font-display text-heading text-[clamp(1.375rem,min(7.5vw,4.6svh),2.25rem)] lg:text-[clamp(2rem,min(3.3vw,6svh),3.25rem)]">
          <span className="menu-rise" style={style}>
            <RollText>{label}</RollText>
          </span>
        </span>

        {blurb ? (
          <span className="menu-fade" style={style}>
            {/* From lg, on a row with related links, the blurb lifts away
                as they come up into its place. */}
            <span
              className={`text-text-muted group-hover:text-text-invert/70 group-focus-within:text-text-invert/70 block text-[0.8rem] transition-[color,opacity,transform] duration-500 ease-[var(--ease-out-expo)] sm:text-sm lg:text-base ${
                hasSubLinks
                  ? "lg:group-focus-within:-translate-y-2 lg:group-focus-within:opacity-0 lg:group-hover:-translate-y-2 lg:group-hover:opacity-0"
                  : ""
              }`}
            >
              {blurb}
            </span>
          </span>
        ) : null}
      </span>

      {/* Slides in at the row's end on hover, desktop only. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="hidden h-6 w-6 shrink-0 -translate-x-3 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 lg:block"
      >
        <path
          d="M4 12h15m-6-6 6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  return (
    <li className="relative">
      <div className="flex items-stretch">
        <div className="group relative min-w-0 flex-1">
          {home ? (
            <Link href={href} onClick={onNavigate} className={rowClass}>
              {content}
            </Link>
          ) : (
            <a href={href} onClick={onNavigate} className={rowClass}>
              {content}
            </a>
          )}

          {/* The desktop copy of the related links, over the blurb's spot and
              revealed on hover — and on focus, which is the same reveal for
              anyone using a keyboard. Without the `group-focus-within` pair
              these would stay at `opacity: 0` while still being tab stops.
              `right-16` clears the arrow. */}
          {hasSubLinks ? (
            <div className="pointer-events-none absolute inset-y-0 right-16 hidden max-w-[min(34rem,58%)] translate-y-2 flex-wrap content-center items-center justify-end gap-x-5 gap-y-1 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
              {subLinks.map((sub) => (
                <a
                  key={`${href}-${sub.label}`}
                  href={sub.href}
                  onClick={onNavigate}
                  className="text-label text-text-invert/70 hover:text-text-invert pointer-events-auto"
                >
                  {sub.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {/* Below lg: the chevron that folds the related links out. Rows
            without any get a spacer instead, so every blurb lines up. */}
        {hasSubLinks ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={subId}
            className="menu-fade text-text-muted hover:text-text flex w-11 shrink-0 items-center justify-center transition-colors lg:hidden"
            style={style}
          >
            <span className="sr-only">More in {label}</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`h-5 w-5 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                expanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span aria-hidden className="w-11 shrink-0 lg:hidden" />
        )}
      </div>

      {/* The folding copy. `lg:hidden` is on a wrapper because `.menu-sub`
          sets its own `display`, and an unlayered rule outranks the utility. */}
      {hasSubLinks ? (
        <div className="lg:hidden">
          <div id={subId} data-expanded={expanded} className="menu-sub">
            <div>
              <ul className="flex flex-wrap gap-x-5 pr-2 pb-3 pl-12 sm:pl-16">
                {subLinks.map((sub, index) => (
                  <li
                    key={`${href}-${sub.label}`}
                    style={{ "--j": index } as React.CSSProperties}
                  >
                    <a
                      href={sub.href}
                      onClick={onNavigate}
                      className="text-label text-text-muted hover:text-text block py-2 transition-colors"
                    >
                      {sub.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <span
        aria-hidden
        className="menu-line bg-line absolute inset-x-0 bottom-0 h-px"
        style={style}
      />
    </li>
  );
}

/**
 * The person icon that leads to the admin sign-in page. The same 32px circle
 * as the theme toggle beside it, but filled solid black so it reads as the one
 * call to action in the cluster, and flipping to white with a black icon on
 * hover. Black in both themes: `border-line-strong` turns light on a dark
 * page, so the circle keeps a visible edge there.
 */
function AccountLink({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/login"
      onClick={onNavigate}
      data-chrome-ink
      className={`border-line-strong bg-ink-900 text-paper hover:border-ink-900 hover:bg-paper hover:text-ink-900 h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        className ?? ""
      }`}
    >
      <span className="sr-only">Sign in or create an account</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    </Link>
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
