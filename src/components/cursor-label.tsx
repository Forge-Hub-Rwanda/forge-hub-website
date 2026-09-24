"use client";

import { useEffect, useRef } from "react";
import { isFinePointer } from "@/lib/pointer";

/**
 * A companion to the pointer that says what a region does — "View" over a
 * project, "Scroll" over the pinned gallery — the contextual cursor lusion.co
 * runs across its work.
 *
 * It never replaces the system cursor. The arrow stays where it is and this
 * trails it as a small oxblood pill, visible only while the pointer is over
 * something that has opted in with `data-cursor="Label"`; everywhere else it
 * is not drawn at all. So it adds a word of context without taking away the
 * pointer anyone is used to aiming with.
 *
 * `data-cursor-motif` swaps the word for a slowly turning imigongo lozenge,
 * for rows that are worth marking but that do not go anywhere — a label there
 * would promise a click the row cannot keep.
 *
 * Mounted once, in the root layout. Off under reduced motion, and it only ever
 * responds to movement that came from a mouse or pen — decided per event, not
 * by media query; see `src/lib/pointer.ts` for why. A finger on a touchscreen
 * hides it rather than dragging it along.
 *
 * The position is eased in a rAF loop that stops itself once the pill has
 * caught up, so a still mouse costs nothing.
 */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Share of the remaining distance covered each frame. */
const EASE = 0.22;

export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const label = labelRef.current;
    if (!node || !label) return;
    if (window.matchMedia(REDUCED_QUERY).matches) return;

    let frame = 0;
    let x = -100;
    let y = -100;
    let targetX = -100;
    let targetY = -100;
    let current: Element | null = null;

    const loop = () => {
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      // A touch is not a cursor: hide the pill rather than let it chase a
      // finger around the screen.
      if (!isFinePointer(event)) {
        current = null;
        node.dataset.state = "off";
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;

      const host = (event.target as Element | null)?.closest?.(
        "[data-cursor], [data-cursor-motif]",
      );

      if (host !== current) {
        current = host ?? null;
        if (host) {
          const motif = host.hasAttribute("data-cursor-motif");
          label.textContent = motif
            ? ""
            : (host.getAttribute("data-cursor") ?? "");
          node.dataset.state = motif ? "motif" : "label";
          // Snap rather than glide in from wherever it was last seen, which
          // could be the other side of the screen.
          if (!node.dataset.seen) {
            x = targetX;
            y = targetY;
            node.dataset.seen = "true";
          }
        } else {
          node.dataset.state = "off";
        }
      }

      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      current = null;
      node.dataset.state = "off";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    // Scrolling carries the page out from under a still pointer, so whatever
    // the pill was describing may no longer be under it. Hide it until the
    // pointer next moves and it can look again, rather than leave "Join"
    // floating over a band it has long left.
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden data-state="off" className="cursor-label">
      <span className="cursor-label-pill">
        <span ref={labelRef} className="cursor-label-text" />
        <svg viewBox="0 0 48 48" className="cursor-label-motif">
          <path
            d="M24 3 L45 24 L24 45 L3 24 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path d="M24 14 L34 24 L24 34 L14 24 Z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}
