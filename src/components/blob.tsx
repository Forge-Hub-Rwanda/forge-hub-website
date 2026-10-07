"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The organic gradient shape behind the hero.
 *
 * Drawn as an SVG path rather than an animated border-radius: the silhouette
 * is a lumpy, multi-lobed outline — bulging on some edges and pulling inward
 * into notches on others — and a border-radius can only ever describe a
 * rounded rectangle tending toward an ellipse.
 *
 * `preserveAspectRatio="none"` lets the caller set the proportions with
 * classes. Callers fix them with an `aspect-[…]` class and size the blob by
 * its width alone, so the shape is the same on every screen and only its size
 * changes; setting a width and a height in different units (vw against vh)
 * would stretch it thin on a tall phone and squat on a short laptop.
 * Decorative only: the hero's meaning is all in the text.
 *
 * The motion — a slow glide, a morphing silhouette and a cycling gradient — is
 * defined in globals.css. All this component owns is when it runs: the shape
 * animates only while it is on screen, so the blob at the foot of the page is
 * not burning frames while someone reads the hero.
 */

type BlobProps = {
  className?: string;
  /** Distinguishes the gradient's id if more than one blob is ever rendered. */
  id?: string;
};

export function Blob({ className, id = "blob-gradient" }: BlobProps) {
  const ref = useRef<SVGSVGElement>(null);
  // Defaults to animating, so the pause is purely an optimisation the observer
  // applies: without IntersectionObserver, or before it has first reported, the
  // blob behaves exactly as it did before this was added.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      // A margin either side, so the blob is already moving by the time it
      // scrolls into view rather than visibly starting from a standstill.
      { rootMargin: "20% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      data-animate={onScreen}
      viewBox="0 0 200 240"
      preserveAspectRatio="none"
      className={`blob pointer-events-none absolute -z-10 will-change-transform ${className ?? ""}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0%"
            className="blob-stop-a"
            stopColor="var(--color-blob-amber)"
          />
          <stop
            offset="100%"
            className="blob-stop-b"
            stopColor="var(--color-blob-coral)"
          />
        </linearGradient>
      </defs>
      {/* The `d` here is the morph's 0%/100% keyframe in absolute form. It is
          what shows if the CSS `d` property is unsupported, so the two must
          stay in step — edit both or neither. */}
      <path
        className="blob-shape"
        fill={`url(#${id})`}
        d="M116.4 7.3C130.8 7.6 155.9 49.6 161 70.1C166.2 90.6 149.5 106.4 147.3 130.1C145 153.8 157.4 203.1 147.5 212.1C137.6 221.2 109.1 190.2 87.8 184.3C66.5 178.3 28.2 190 19.6 176.3C11 162.6 26.9 120.1 36.1 102.1C45.2 84.1 61.1 84.3 74.5 68.4C87.8 52.6 102 7 116.4 7.3Z"
      />
    </svg>
  );
}
