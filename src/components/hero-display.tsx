"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/lib/site";

/**
 * The oversized oblique line at the very top of the page.
 *
 * It spans the full viewport width, then sticks to the top of the viewport and
 * shrinks as the page scrolls, anchored to its left edge, so it recedes into a
 * running header rather than sliding away. It releases at the bottom of the
 * hero zone, which is its nearest positioned ancestor.
 *
 * Three elements, because three transforms must not share one:
 *   - the outer element carries the `rise` entrance animation,
 *   - the middle one carries the scroll-driven scale,
 *   - the heading itself carries the oblique skew.
 * A CSS animation overrides inline styles, so putting `rise` and the scale on
 * the same node lets the animation's final `transform: none` win permanently
 * and the scale never takes effect.
 *
 * The scale is written to a custom property inside a rAF callback rather than
 * to React state, so scrolling never triggers a re-render.
 */

/** Scroll distance, in px, over which the line reaches its smallest size. */
const TRAVEL = 200;
const MIN_SCALE = 0.48;

export function HeroDisplay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / TRAVEL, 1);
      node.style.setProperty("--scale", String(1 - (1 - MIN_SCALE) * progress));
    };

    const onScroll = () => {
      // Coalesce bursts of scroll events into one write per frame.
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      id="top"
      className="rise pointer-events-none sticky top-0 z-20 px-6 pt-24 sm:pt-28 lg:px-[3.6vw] lg:pt-32"
    >
      <div
        ref={ref}
        className="origin-left will-change-transform"
        style={
          {
            "--scale": 1,
            transform: "scale(var(--scale))",
          } as React.CSSProperties
        }
      >
        <h1 className="font-display text-oblique text-text text-[9.3vw]">
          {hero.display}
        </h1>
      </div>
    </div>
  );
}
