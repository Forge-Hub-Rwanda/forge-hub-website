"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/logo";

/**
 * The first-visit loader: a counter rolls from 000 to 100 while an oxblood bar
 * fills, then the bar squares up into the logo tile, the mark knocks out of it,
 * and the tile flies up into its place at the top of the page — lusion.co's
 * loader folding into its "L", told with the ForgeHub tile instead.
 *
 * Whether it plays at all is decided before first paint by the inline script in
 * `src/lib/loader.ts`; this component only runs the sequence once that script
 * has said yes. It is also only ever a curtain, never a gate: the page is fully
 * rendered underneath from the first byte, nothing waits on it, and any key,
 * click, wheel or touch cuts straight to the end.
 *
 * Two failsafes in globals.css cover the case where this file never runs — a
 * script that failed to load, say, after the inline gate had already fired —
 * so the overlay can never be left standing over the page.
 */

/** Durations, in ms. The whole sequence is a little under two seconds. */
const COUNT = 850;
const SQUARE = 380;
const KNOCK = 220;
const FLY = 620;

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

const pad3 = (value: number) => String(value).padStart(3, "0");

export function ForgeLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = ref.current;
    if (!overlay || root.dataset.loader !== "play") return;

    const bar = overlay.querySelector<HTMLElement>("[data-loader-bar]");
    const fill = overlay.querySelector<HTMLElement>("[data-loader-fill]");
    const tile = overlay.querySelector<HTMLElement>("[data-loader-tile]");
    const count = overlay.querySelector<HTMLElement>("[data-loader-count]");
    if (!bar || !fill || !tile || !count) return;

    const animations: Animation[] = [];
    const timers: number[] = [];
    let frame = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      for (const timer of timers) clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      root.setAttribute("data-loader", "done");
      removeListeners();
    };

    // Any sign the visitor wants the page cuts the curtain. The overlay fades
    // rather than vanishing, so it never reads as a glitch.
    const skip = () => {
      if (finished) return;
      for (const animation of animations) animation.pause();
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 220,
        easing: "ease-out",
        fill: "forwards",
      });
      fade.onfinish = finish;
      removeListeners();
    };

    const events = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
    const removeListeners = () => {
      for (const type of events) window.removeEventListener(type, skip);
    };
    for (const type of events) {
      window.addEventListener(type, skip, { passive: true, once: true });
    }

    const at = (ms: number, run: () => void) => {
      timers.push(window.setTimeout(run, ms));
    };

    /* ---- 1. Count up while the bar fills ------------------------------- */
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      count.textContent = pad3(Math.round(eased * 100));
      frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    frame = requestAnimationFrame(tick);

    animations.push(
      fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: COUNT,
        easing: IN_OUT,
        fill: "forwards",
      }),
    );

    /* ---- 2. The bar squares up into the tile --------------------------- */
    at(COUNT, () => {
      const target = tile.getBoundingClientRect().width;
      animations.push(
        bar.animate(
          [
            { width: `${bar.offsetWidth}px`, height: `${bar.offsetHeight}px` },
            { width: `${target}px`, height: `${target}px` },
          ],
          { duration: SQUARE, easing: EXPO, fill: "forwards" },
        ),
        count.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: SQUARE,
          easing: "ease-out",
          fill: "forwards",
        }),
      );
    });

    /* ---- 3. The mark knocks out of it ---------------------------------- */
    // The tile artwork is the same oxblood as the bar, with the mark cut out.
    // Fading the artwork in while the solid bar fades out behind it is what
    // opens the hole.
    at(COUNT + SQUARE, () => {
      animations.push(
        tile.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: KNOCK,
          easing: "ease-out",
          fill: "forwards",
        }),
        bar.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: KNOCK,
          easing: "ease-in",
          fill: "forwards",
        }),
      );
    });

    /* ---- 4. The tile flies up into the header -------------------------- */
    at(COUNT + SQUARE + KNOCK, () => {
      const from = tile.getBoundingClientRect();
      const home = document.querySelector("[data-logo-tile] svg");
      const to = home?.getBoundingClientRect();

      if (to && to.width > 0) {
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const scale = to.width / from.width;
        animations.push(
          tile.animate(
            [
              { transform: "none" },
              { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
            ],
            { duration: FLY, easing: EXPO, fill: "forwards" },
          ),
        );
      }

      // The page shows through as the tile travels, so it lands on a page
      // that is already there rather than on an empty sheet.
      animations.push(
        overlay.animate(
          [
            { backgroundColor: "var(--color-surface)" },
            { backgroundColor: "transparent" },
          ],
          {
            duration: FLY * 0.7,
            easing: "ease-out",
            fill: "forwards",
          },
        ),
      );
    });

    at(COUNT + SQUARE + KNOCK + FLY, finish);

    return () => {
      finish();
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="forge-loader">
      <div className="forge-loader-stage">
        <div data-loader-bar className="forge-loader-bar">
          <span data-loader-fill className="forge-loader-fill" />
        </div>
        <div data-loader-tile className="forge-loader-tile">
          <Logo className="w-full" />
        </div>
      </div>
      <p data-loader-count className="forge-loader-count">
        000
      </p>
    </div>
  );
}
