"use client";

import { useEffect, useRef } from "react";

/**
 * How far down the page the visitor is, drawn as one row of imigongo chevrons
 * along the very top edge of the window — lusion.co's scroll indicator, in the
 * site's own geometry.
 *
 * The line is revealed with a clip rather than a scaleX, for the same reason
 * the nav underline is: scaling would squash the chevrons flat as it grew.
 *
 * It maps scroll position straight onto length and never animates on a timer,
 * so it is a gauge rather than motion, and it runs under reduced motion too.
 * Mounted once, in the root layout; rAF-throttled, so scrolling never
 * re-renders anything.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let written = "";
    // The scrollable distance, measured when the page or window changes size
    // rather than on every frame: reading `scrollHeight` mid-scroll makes the
    // browser resolve whatever layout the frame's other effects have touched.
    let max = 0;

    const update = () => {
      frame = 0;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      const value = progress.toFixed(4);
      if (value === written) return;
      written = value;
      node.style.setProperty("--progress", value);
    };

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const sizer = new ResizeObserver(measure);
    sizer.observe(document.body);

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      sizer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden className="scroll-progress" />;
}
