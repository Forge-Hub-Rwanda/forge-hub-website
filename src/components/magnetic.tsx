"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isFinePointer } from "@/lib/pointer";

/**
 * Leans its contents a few pixels toward the pointer while it is over them, so
 * a primary button feels like it is reaching for the click.
 *
 * Deliberately small: MAX is a nudge, not a chase. A button that travels far
 * enough to notice is a button that moves out from under the pointer aiming at
 * it. Mouse and pen only, decided per event, and off under reduced motion — a
 * finger has no hover to respond to.
 *
 * The transform goes on a wrapper, never on the control itself, so the
 * control's own hover fill and focus ring are untouched.
 */

/** The furthest the contents may lean, in px. */
const MAX = 6;

export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (event: PointerEvent) => {
      // Mouse and pen only, decided per event — see `src/lib/pointer.ts`.
      if (!isFinePointer(event)) return;
      const rect = node.getBoundingClientRect();
      const dx =
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy =
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      node.style.setProperty("--mx", `${(dx * MAX).toFixed(2)}px`);
      node.style.setProperty("--my", `${(dy * MAX).toFixed(2)}px`);
    };

    const onLeave = () => {
      node.style.setProperty("--mx", "0px");
      node.style.setProperty("--my", "0px");
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span ref={ref} className={`magnetic ${className ?? ""}`}>
      {children}
    </span>
  );
}
