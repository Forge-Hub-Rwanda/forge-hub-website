"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "@/lib/lenis";

/**
 * Starts smooth scrolling for the whole site. Renders nothing.
 *
 * Lenis interpolates the wheel and touch delta and then sets the real window
 * scroll position, so everything already reading `window.scrollY` — the hero's
 * display line, the logo shrink, the nav tuck, the pinned narrative — keeps
 * working without knowing this exists. That is the reason for choosing it over
 * a transform-based scroller, which would have broken all four.
 *
 * `respectReducedMotion` defaults to `true`: a visitor who has asked for
 * reduced motion gets `lerp: 1`, which is scrolling that tracks their input
 * device exactly, plus instant programmatic jumps. It is left at the default
 * deliberately rather than skipping the instance entirely, so anchor handling
 * stays consistent for everyone.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // Lenis runs its own requestAnimationFrame loop.
      autoRaf: true,
      // Hands in-page `#fragment` links to Lenis, so they ease rather than
      // jumping. `html { scroll-behavior: smooth }` is turned off while Lenis
      // is active — see globals.css — because the two fight over the same jump.
      anchors: true,
      // Low enough to read as glide rather than drag. Above roughly 0.15 the
      // smoothing stops being perceptible; below about 0.06 the page starts
      // feeling like it is resisting the wheel.
      lerp: 0.09,
    });

    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
