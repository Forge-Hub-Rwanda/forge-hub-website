import { getLenis } from "@/lib/lenis";

/**
 * A pinned sideways track: while the page scrolls through `pin`, its sticky
 * stage holds still and `track` slides left, one item per step, then the page
 * carries on. The same motion as the homepage gallery's desktop row (see
 * portfolio.tsx, which keeps its own copy because it also drives the wheel),
 * packaged for the phone layouts that want it.
 *
 * Every frame is a pure function of the scroll position. The travel between
 * two items is eased, so the track slows as an item arrives, holds while it is
 * read, then carries on; and it settles under a light extra ease so a flung
 * scroll still glides. The loop sleeps once the track has caught up and runs
 * only while the pin is near the screen, so a still page costs nothing.
 *
 * Geometry is measured on resize, never per frame: the only things read inside
 * the loop are `scrollY` and the cached numbers.
 */

/** Vertical scroll per pixel of sideways travel. */
const DRAG = 1;

/** Share of the remaining distance the track covers each frame. */
const EASE = 0.16;

/** How much of each step is eased rather than linear; see portfolio.tsx. */
const DWELL = 0.8;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type HorizontalPinFrame = {
  /** How far the track has moved, in px (positive = left). */
  x: number;
  /** 0 at the start of the pin, 1 at its end. */
  progress: number;
  /** The item nearest its resting place, from 0. */
  index: number;
};

export type HorizontalPin = {
  /** Scrolls the page to where item `index` rests. */
  scrollTo: (index: number) => void;
  destroy: () => void;
};

export function horizontalPin({
  pin,
  view,
  track,
  items,
  onMeasure,
  onFrame,
}: {
  /** The tall element the stage is sticky within; its height is written. */
  pin: HTMLElement;
  /** The strip the track is seen through. */
  view: HTMLElement;
  /** The element translated sideways. */
  track: HTMLElement;
  /** Where the track stops: one rest per item, after a rest at 0. */
  items: HTMLElement[];
  /** After each measure, with the pin's top in document px. */
  onMeasure?: (top: number) => void;
  onFrame?: (frame: HorizontalPinFrame) => void;
}): HorizontalPin {
  let frame = 0;
  let near = false;
  let current = 0;
  let target = 0;
  let lastIndex = -1;

  const metrics = { top: 0, travel: 0, stops: [0] as number[] };

  const draw = () => {
    const { top, travel, stops } = metrics;
    if (travel <= 0) return;

    const steps = stops.length - 1;
    const progress = Math.min(
      Math.max((window.scrollY - top) / (travel * DRAG), 0),
      1,
    );
    const position = progress * steps;
    const step = Math.min(Math.floor(position), steps - 1);
    const within = position - step;
    const eased = within + (easeInOut(within) - within) * DWELL;
    target = stops[step] + (stops[step + 1] - stops[step]) * eased;

    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.05) current = target;

    track.style.transform = `translate3d(${(-current).toFixed(2)}px, 0, 0)`;

    // The rest the track is nearest, for anything that follows along.
    let index = 0;
    for (let i = 1; i < stops.length; i++) {
      if (Math.abs(stops[i] - current) < Math.abs(stops[index] - current)) {
        index = i;
      }
    }
    lastIndex = index;
    onFrame?.({ x: current, progress, index });
  };

  const loop = () => {
    draw();
    frame = current !== target ? requestAnimationFrame(loop) : 0;
  };

  const wake = () => {
    if (near && !frame) frame = requestAnimationFrame(loop);
  };

  const measure = () => {
    // Measured with the track at rest, so offsets are its own.
    const transform = track.style.transform;
    track.style.transform = "";
    const travel = Math.max(0, track.scrollWidth - view.clientWidth);
    const base = track.getBoundingClientRect().left;
    const viewLeft = view.getBoundingClientRect().left;
    // Each item rests with its left edge where the first item's margin puts
    // it: centred in the strip, whatever the item's width.
    const stops = [0];
    for (const item of items) {
      const box = item.getBoundingClientRect();
      const centred =
        box.left -
        base -
        (view.clientWidth - box.width) / 2 +
        (base - viewLeft);
      stops.push(Math.min(Math.max(centred, 0), travel));
    }
    track.style.transform = transform;

    pin.style.setProperty(
      "--pin-height",
      `${window.innerHeight + travel * DRAG}px`,
    );
    metrics.travel = travel;
    metrics.stops = stops;
    metrics.top = window.scrollY + pin.getBoundingClientRect().top;
    onMeasure?.(metrics.top);
    wake();
  };

  const sizer = new ResizeObserver(measure);
  sizer.observe(track);
  sizer.observe(view);
  sizer.observe(document.body);
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", wake, { passive: true });

  const visibility = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near) wake();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { rootMargin: "20% 0px" },
  );
  visibility.observe(pin);

  const scrollTo = (index: number) => {
    const steps = metrics.stops.length - 1;
    if (steps <= 0) return;
    const top =
      metrics.top +
      (Math.min(Math.max(index, 0), steps) / steps) * metrics.travel * DRAG;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: reduced });
    else window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  // Tabbing into an item that is off to the side scrolls the page to it: the
  // browser's own scroll-into-view cannot move a transformed track.
  const onFocusIn = (event: FocusEvent) => {
    const index = items.findIndex((item) =>
      item.contains(event.target as Node),
    );
    if (index !== -1 && index + 1 !== lastIndex) scrollTo(index + 1);
  };
  track.addEventListener("focusin", onFocusIn);

  return {
    scrollTo,
    destroy: () => {
      sizer.disconnect();
      visibility.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", wake);
      track.removeEventListener("focusin", onFocusIn);
      if (frame) cancelAnimationFrame(frame);
      track.style.transform = "";
      pin.style.removeProperty("--pin-height");
    },
  };
}
