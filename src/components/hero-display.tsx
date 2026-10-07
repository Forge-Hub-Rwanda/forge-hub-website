"use client";

import { useEffect, useRef } from "react";
import {
  HERO_DISPLAY_ID,
  HERO_RELEASE_ID,
  HERO_SCROLL_TRAVEL,
} from "@/lib/motion";
import { SplitWords } from "@/components/split-text";
import { hero } from "@/lib/site";

/**
 * The oversized oblique line at the very top of the page.
 *
 * It spans the full viewport width, then sticks to the top of the viewport and
 * shrinks as the page scrolls, anchored to its left edge, so it recedes into a
 * running header rather than sliding away.
 *
 * It hands the screen over at the intro headline. `position: sticky` alone
 * would hold the line pinned for the whole hero zone, leaving the display line
 * sitting on top of the intro copy; instead, once the headline has come up to
 * meet it, the line is pushed up by exactly the overlap, which cancels the pin
 * and lets it travel away with the page. Scrolling back up reverses it.
 *
 * Three elements, because three transforms must not share one:
 *   - the outer element carries the `rise` entrance animation,
 *   - the middle one carries the scroll-driven scale and release,
 *   - the heading itself carries the oblique skew.
 * A CSS animation overrides inline styles, so putting `rise` and the scale on
 * the same node lets the animation's final `transform: none` win permanently
 * and the scale never takes effect.
 *
 * Both values are written to custom properties inside a rAF callback rather
 * than to React state, so scrolling never triggers a re-render.
 */

/** How small the line gets, as a fraction of its full size. */
const MIN_SCALE = 0.48;

/** Clear space, in px, kept between the line and the headline it releases at. */
const RELEASE_GAP = 40;

export function HeroDisplay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let shift = 0;

    const update = () => {
      frame = 0;

      // Measure before writing: reading a rect straight after a style write in
      // the same frame forces a synchronous layout on every scroll event. Both
      // reads describe last frame's state, which is imperceptible here.
      const release = document.getElementById(HERO_RELEASE_ID);
      const releaseTop = release?.getBoundingClientRect().top ?? Infinity;
      // The rect already includes the shift applied last frame, so back it out
      // to get where the line would come to rest unshifted.
      const restingBottom = node.getBoundingClientRect().bottom - shift;

      if (!reduced) {
        const progress = Math.min(window.scrollY / HERO_SCROLL_TRAVEL, 1);
        node.style.setProperty(
          "--scale",
          String(1 - (1 - MIN_SCALE) * progress),
        );
      }

      // Negative once the headline is within a gap's reach, zero before that.
      // This runs whatever the motion preference: it is what keeps the line off
      // the copy, not decoration.
      shift = Math.min(0, releaseTop - RELEASE_GAP - restingBottom);
      node.style.setProperty("--shift", `${shift}px`);
    };

    const onScroll = () => {
      // Coalesce bursts of scroll events into one write per frame.
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // The release point is measured, so a resize can move it without a scroll.
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    /* Deliberately carries no id="top". This element is sticky, so an anchor
       pointing at it resolves to the end of its sticky range — the intro copy
       — rather than the top of the page. With no element of that id anywhere,
       href="#top" falls back to the start of the document, which is what the
       home links want. */
    <div className="rise pointer-events-none sticky top-0 z-20 px-6 pt-24 sm:pt-28 lg:px-[3.6vw] lg:pt-32">
      <div
        ref={ref}
        className="origin-left will-change-transform"
        style={
          {
            "--scale": 1,
            "--shift": "0px",
            transform: "translate3d(0, var(--shift), 0) scale(var(--scale))",
          } as React.CSSProperties
        }
      >
        <h1
          id={HERO_DISPLAY_ID}
          /* One line by design, so the size has to be what fits: measured
             against the container's padding — a fixed 24px each side below lg,
             3.6vw each side from lg — with slack for the skew's extra width.
             Verified by comparing scrollWidth against clientWidth, since the
             nowrap text overflows its box without changing the box. SiteHeader's
             nav spacer is calculated from this size, so change both together. */
          className="font-display text-oblique text-text text-[8.6vw] text-nowrap lg:text-[9.2vw] lg:landscape:relative lg:landscape:top-4"
        >
          {/* Each word springs up out of its own slot on load — see
              `SplitWords`. Words rather than letters, so the kerning inside
              each word survives at this size. */}
          <SplitWords text={hero.display} mode="load" />
        </h1>
      </div>
    </div>
  );
}
