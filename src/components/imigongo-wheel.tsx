"use client";

import { useEffect, useRef } from "react";
import { WheelArt } from "@/components/wheel-art";
import {
  gallery,
  isCapablePhone,
  PHONE_WHEEL_QUERY,
  runWheelReactors,
  setWheelWake,
  WHEEL_QUERY,
  wheelState,
} from "@/lib/wheel";

/**
 * The imigongo wheel: a half-wheel held against the right edge of the window,
 * almost as tall as the window, turning slowly as the homepage is scrolled —
 * an experiment, on its own branch.
 *
 * ## Behind the words, over the backgrounds
 *
 * It is `position: fixed` at z-index 1, rendered after the page content. In the
 * root stacking context that paints it above every section's background and
 * watermark, all of which are z-auto, and below the content, which globals.css
 * lifts to z-index 2 with `.wheel-over` while `<html data-wheel>` is set. So it
 * crosses every band of the page without ever lying over a line of text.
 *
 * It is drawn in white with `mix-blend-mode: difference` at watermark
 * strength: faint dark linework over a white band, faint light linework over
 * the dark events band or in dark mode. One wheel, legible on all of them.
 *
 * ## The turn
 *
 * Rotation is a pure function of the scroll position, so it runs backwards
 * exactly as it runs forwards. While the gallery is pinned the scroll stops
 * turning it and the gallery takes over: the wheel turns by the cards' own
 * travel divided by its radius, so its rim moves exactly as far as the cards
 * do, easing and dwelling when they do — the mechanism that moves them.
 *
 * ## The dock
 *
 * As the closing section comes up the screen the wheel eases off the edge and
 * shrinks into the slot marked `data-wheel-dock` beside the blob, becoming a
 * small whole wheel; from then on it simply follows that slot, and scrolls away
 * with the section. The slot holds a static copy of the same artwork — what a
 * phone, a reduced-motion visitor or a browser without scripting sees — which
 * hides while this one is running, so the hand-over is invisible.
 *
 * ## Cost
 *
 * The whole wheel is one composited layer that is only ever transformed, so
 * turning it repaints nothing. The loop runs only while something is changing
 * — scrolling, the gallery moving, a reactor still settling — and sleeps the
 * moment everything is at rest, and while the tab is hidden. It exists only
 * without a reduced-motion preference: from 64rem up, and on a phone only if
 * it is a capable one (see `isCapablePhone`). A cheaper phone gets no wheel at
 * all, still or turning.
 *
 * ## On a phone
 *
 * The same wheel and the same loop, smaller — sized by the window's width
 * rather than its height, see `.wheel-live` in globals.css. None of the
 * reactors run there, so each frame is one transform and nothing else.
 */

/** Degrees of turn per px of scroll. About a turn and a half over the page. */
const TURN_PER_PX = 0.06;

/** Where the dock starts and finishes, as the closing section's top edge
    travels from the foot of the window to this fraction of its height. */
const DOCK_END = 0.35;

const smoothstep = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

export function ImigongoWheel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const query = window.matchMedia(WHEEL_QUERY);
    const phone = window.matchMedia(PHONE_WHEEL_QUERY);
    const capablePhone = isCapablePhone();
    const runs = () => query.matches || (capablePhone && phone.matches);
    let stop: (() => void) | null = null;

    const start = () => {
      const root = document.documentElement;
      root.setAttribute("data-wheel", "on");

      const dock = document.querySelector<HTMLElement>("[data-wheel-dock]");
      const closing = dock?.closest("section") ?? null;

      let frame = 0;
      let last = { angle: NaN, x: NaN, y: NaN, scale: NaN };
      let hidden = false;
      const began = performance.now();

      // Geometry, in document px, measured on resize rather than on every
      // frame — the same arrangement as WheelNudge. A rect read inside the loop
      // forces whatever style the gallery and the reactors have just written to
      // be resolved synchronously, every frame. Neither the slot nor the
      // closing section moves except by scrolling, so their document positions
      // plus `scrollY` give the very same numbers the rects did.
      const geometry = {
        size: 0,
        closingTop: 0,
        slotLeft: 0,
        slotTop: 0,
        slotWidth: 0,
        slotHeight: 0,
      };
      const measure = () => {
        geometry.size = node.offsetWidth;
        if (dock && closing) {
          const scroll = window.scrollY;
          geometry.closingTop = closing.getBoundingClientRect().top + scroll;
          const slot = dock.getBoundingClientRect();
          geometry.slotLeft = slot.left;
          geometry.slotTop = slot.top + scroll;
          geometry.slotWidth = slot.width;
          geometry.slotHeight = slot.height;
        }
      };
      measure();
      // Anything above the closing section changing height moves it down the
      // document, and that always changes the body's height too.
      const sizer = new ResizeObserver(() => {
        measure();
        wake();
      });
      sizer.observe(document.body);
      sizer.observe(node);
      if (closing) sizer.observe(closing);

      const paint = (now: number) => {
        frame = 0;

        const viewport = window.innerHeight;
        // clientWidth, not innerWidth: the scrollbar is not part of the page.
        const edge = document.documentElement.clientWidth;
        const size = geometry.size;
        const radius = size / 2;
        const scroll = window.scrollY;

        // The turn. Scroll inside the pinned gallery is taken out and the
        // cards' travel put in its place; both are continuous at the ends of
        // the pin, so the hand-over between them cannot jump.
        const pinned = Math.min(
          Math.max(scroll - gallery.top, 0),
          gallery.length,
        );
        const angle =
          TURN_PER_PX * (scroll - pinned) +
          (gallery.travel / radius) * (180 / Math.PI);

        // The dock: from centred on the right edge, to the slot's centre and
        // the slot's size. Once complete it tracks the slot exactly.
        let x = edge;
        let y = viewport / 2;
        let scale = 1;
        // Off screen: docked, and the slot it docked into has scrolled out of
        // the window. The layer stays mounted and keeps its transform, so it
        // is simply hidden — which takes its full-window `difference` blend
        // out of every frame while the footer is in view — and shows again,
        // exactly where it was, the moment the slot comes back.
        let away = false;
        if (dock && closing) {
          const top = geometry.closingTop - scroll;
          const progress = smoothstep(
            (viewport - top) / (viewport * (1 - DOCK_END)),
          );
          if (progress > 0) {
            const slotTop = geometry.slotTop - scroll;
            x += (geometry.slotLeft + geometry.slotWidth / 2 - x) * progress;
            y += (slotTop + geometry.slotHeight / 2 - y) * progress;
            scale += (geometry.slotWidth / size - 1) * progress;
            away = progress === 1 && slotTop + geometry.slotHeight < 0;
          }
        }

        if (away !== hidden) {
          hidden = away;
          node.style.visibility = away ? "hidden" : "";
        }

        const moved =
          angle !== last.angle ||
          x !== last.x ||
          y !== last.y ||
          scale !== last.scale;

        if (moved) {
          node.style.transform = `translate3d(${(x - radius).toFixed(2)}px, ${(y - radius).toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${angle.toFixed(3)}deg)`;
        }

        wheelState.velocity = Number.isNaN(last.angle) ? 0 : angle - last.angle;
        wheelState.angle = angle;
        wheelState.cx = x;
        wheelState.cy = y;
        wheelState.r = radius * scale;
        wheelState.time = (now - began) / 1000;
        last = { angle, x, y, scale };

        // Keep going while anything is still moving; otherwise sleep until the
        // next scroll, resize or gallery update wakes it.
        const busy = runWheelReactors();
        if ((moved || busy) && !document.hidden) {
          frame = requestAnimationFrame(paint);
        }
      };

      function wake() {
        if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
      }

      const onResize = () => {
        measure();
        wake();
      };

      setWheelWake(wake);
      window.addEventListener("scroll", wake, { passive: true });
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", wake);
      wake();

      return () => {
        if (frame) cancelAnimationFrame(frame);
        setWheelWake(null);
        sizer.disconnect();
        window.removeEventListener("scroll", wake);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", wake);
        root.removeAttribute("data-wheel");
        node.style.transform = "";
        node.style.visibility = "";
      };
    };

    // Starts and stops across the breakpoint, or if reduced motion is turned
    // on mid-visit — in which case the static copy in the closing section is
    // all that remains, and the page is exactly as it was.
    const sync = () => {
      if (runs() && !stop) stop = start();
      else if (!runs() && stop) {
        stop();
        stop = null;
      }
    };

    sync();
    query.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      phone.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="wheel-live">
      <WheelArt />
    </div>
  );
}
