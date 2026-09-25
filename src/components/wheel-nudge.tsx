"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerWheelReactor, WHEEL_QUERY } from "@/lib/wheel";

/**
 * Lets the imigongo wheel disturb a watermark as its rim turns over it: while
 * the wheel turns, the pattern is nudged away from its centre and leans a
 * fraction of a degree with the turn, then ripples back into place when it
 * stops — a pattern floating on water that something has just stirred.
 *
 * The motion is a transform on an inner layer, so it runs on the compositor.
 * That layer is inset past its frame by more than it ever travels, and the
 * frame clips it, so the pattern's edges never come into view. The clip is
 * here rather than on the section, deliberately: an overflow clip on a section
 * would stop the membership index sticking.
 *
 * Renders its children exactly where they were wherever the wheel does not run,
 * and attaches nothing.
 */

/** How far the rim reaches past its own edge, in px, before a pattern feels it. */
const REACH = 90;

/** The furthest a pattern is nudged, in px. */
const PUSH = 12;

/** Spring stiffness and damping: slow, and a little under-damped, so it floats. */
const STIFF = 0.035;
const DAMP = 0.88;

export function WheelNudge({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || !window.matchMedia(WHEEL_QUERY).matches) return;

    // Where the frame sits in the document, measured on resize rather than on
    // every frame, so the reactor never reads layout.
    const box = { top: 0, left: 0, width: 0, height: 0 };
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      box.top = rect.top + window.scrollY;
      box.left = rect.left;
      box.width = rect.width;
      box.height = rect.height;
    };
    measure();
    const sizer = new ResizeObserver(measure);
    sizer.observe(frame);

    const spring = { x: 0, y: 0, a: 0, vx: 0, vy: 0, va: 0 };
    let written = false;

    const unregister = registerWheelReactor((wheel) => {
      const top = box.top - window.scrollY;

      // The nearest point of the frame to the wheel's centre decides whether
      // the rim is over it at all, and how deep.
      const nearestX = Math.min(
        Math.max(wheel.cx, box.left),
        box.left + box.width,
      );
      const nearestY = Math.min(Math.max(wheel.cy, top), top + box.height);
      const distance = Math.hypot(wheel.cx - nearestX, wheel.cy - nearestY);
      const depth = Math.min(
        Math.max((wheel.r + REACH - distance) / 240, 0),
        1,
      );

      // The disturbance comes from the wheel TURNING, not from it merely being
      // there: a watermark fills its whole band, so the wheel is over one for
      // most of the time it is on screen, and a push that held for as long as
      // it was would simply park the pattern out of place. Driven by the turn,
      // the pattern is churned while the page moves and floats back when it
      // stops — and the spring's overshoot is the ripple.
      let tx = 0;
      let ty = 0;
      let ta = 0;
      const stir = Math.min(Math.abs(wheel.velocity) / 1.5, 1) * depth;
      if (stir > 0) {
        // Away from the wheel, from its centre toward the frame's centre.
        const dx = box.left + box.width / 2 - wheel.cx;
        const dy = top + box.height / 2 - wheel.cy;
        const length = Math.hypot(dx, dy) || 1;
        tx = (dx / length) * PUSH * stir;
        ty = (dy / length) * PUSH * stir;
        ta = Math.max(-1, Math.min(1, wheel.velocity * 0.6)) * depth;
      }

      spring.vx = (spring.vx + (tx - spring.x) * STIFF) * DAMP;
      spring.vy = (spring.vy + (ty - spring.y) * STIFF) * DAMP;
      spring.va = (spring.va + (ta - spring.a) * STIFF) * DAMP;
      spring.x += spring.vx;
      spring.y += spring.vy;
      spring.a += spring.va;

      // At rest once the wheel has stopped stirring and the spring has run
      // down — whether or not the wheel is still over the pattern.
      const resting =
        stir === 0 &&
        Math.abs(spring.x) < 0.05 &&
        Math.abs(spring.y) < 0.05 &&
        Math.abs(spring.a) < 0.005 &&
        Math.abs(spring.vx) + Math.abs(spring.vy) < 0.02;

      if (resting) {
        if (written) {
          inner.style.transform = "";
          written = false;
        }
        spring.x = spring.y = spring.a = 0;
        spring.vx = spring.vy = spring.va = 0;
        return false;
      }

      inner.style.transform = `translate3d(${spring.x.toFixed(2)}px, ${spring.y.toFixed(2)}px, 0) rotate(${spring.a.toFixed(3)}deg)`;
      written = true;
      return true;
    });

    return () => {
      unregister();
      sizer.disconnect();
      inner.style.transform = "";
    };
  }, []);

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-clip"
    >
      <div ref={innerRef} className="absolute -inset-4 will-change-transform">
        {children}
      </div>
    </div>
  );
}
