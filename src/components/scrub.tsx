"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Exposes how far an element has travelled through the window as `--p`, a
 * number from 0 to 1, so a stylesheet can scrub an effect against the scroll.
 *
 * The same contract as `Reveal` and the pinned gallery: this component decides
 * WHEN and HOW FAR, and every rule that moves anything lives in globals.css,
 * scoped to `[data-scrub="true"]`. That attribute is set only once the
 * component has confirmed JavaScript is running, the viewport passes `query`
 * and no reduced-motion preference — so a phone, a reduced-motion visitor and
 * a scriptless browser all get the plain, finished layout without a fallback
 * being written for any of them.
 *
 * Two ways of measuring, because two kinds of effect need them:
 *
 *   - "top"  — follows the element's TOP edge from `from` to `to`, each a
 *              fraction of the window height. Right for an entrance: the
 *              effect has finished by the time the block is being read.
 *   - "full" — follows the whole element, from its top edge reaching `from`
 *              to its BOTTOM edge reaching `to`. Right for something that
 *              plays across the entire pass, like the closing tunnel.
 *
 * Every frame is a pure function of the scroll position, written to a custom
 * property inside a rAF callback, so scrolling never re-renders React and the
 * effect runs backwards exactly as it runs forwards. The listener does nothing
 * while the element is off screen, which is most of the page.
 */

type ScrubProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  /** Which edge the progress follows. See above. */
  span?: "top" | "full";
  /** Window-height fraction at which `--p` is 0. */
  from?: number;
  /** Window-height fraction at which `--p` is 1. */
  to?: number;
  /**
   * The effect only runs where this matches. Scrubbed motion is written for a
   * pointer and a wide window; below that the section simply reveals.
   */
  query?: string;
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function Scrub({
  children,
  as: Tag = "div",
  className,
  style,
  span = "top",
  from = 0.95,
  to = 0.35,
  query = "(min-width: 0px)",
}: ScrubProps) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Decide whether the effect runs at all, and keep deciding: a visitor can
  // resize across the breakpoint, or turn reduced motion on, mid-visit.
  useEffect(() => {
    const fits = window.matchMedia(query);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => setActive(fits.matches && !reduced.matches);

    sync();
    fits.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fits.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [query]);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    let visible = false;

    const paint = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;

      const start = viewport * from;
      const distance =
        span === "full"
          ? start - viewport * to + rect.height
          : start - viewport * to;

      const progress =
        distance <= 0
          ? 1
          : Math.min(Math.max((start - rect.top) / distance, 0), 1);
      node.style.setProperty("--p", progress.toFixed(4));
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(paint);
    };

    // Attached for the component's life but inert off screen. Gating on a flag
    // rather than adding and removing the listener keeps the two states from
    // racing on a fast fling past the section — the same choice TeamShowcase
    // makes for its parallax.
    const watch = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // One last paint on the way out, so a fast scroll never strands the
        // effect half-played at the edge it left by.
        if (!frame) frame = requestAnimationFrame(paint);
      },
      { rootMargin: "10% 0px" },
    );

    watch.observe(node);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    paint();

    return () => {
      watch.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      node.style.removeProperty("--p");
    };
  }, [active, from, to, span]);

  return (
    <Tag ref={ref} data-scrub={active} className={className} style={style}>
      {children}
    </Tag>
  );
}
