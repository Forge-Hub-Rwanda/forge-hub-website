/**
 * The imigongo wheel's shared state — how the wheel, the gallery it drives and
 * the backgrounds it disturbs talk to one another without knowing one another.
 *
 * A plain module singleton, the same arrangement as `src/lib/lenis.ts`: no
 * React state, no context, nothing that re-renders.
 *
 *   - The GALLERY writes how far its cards have travelled. The wheel turns by
 *     exactly that distance at its rim, so it reads as the gear moving them.
 *   - The WHEEL writes where it is, how big it is and how fast it is turning,
 *     once per frame.
 *   - REACTORS — the programs band's sticks, the rippling watermarks — are
 *     called by the wheel on each of those frames, so every reaction rides the
 *     wheel's one loop rather than running a loop of its own. A reactor returns
 *     `true` while it still has motion to settle, which keeps the loop awake
 *     after the scrolling itself has stopped.
 */

export type WheelState = {
  /** Centre, in viewport px. */
  cx: number;
  cy: number;
  /** Radius, in px, at its current scale. */
  r: number;
  /** Rotation, in degrees. */
  angle: number;
  /** Change in rotation since the last frame, in degrees. */
  velocity: number;
  /** Seconds since the wheel started, for anything that sways. */
  time: number;
};

export type WheelReactor = (state: WheelState) => boolean;

export const wheelState: WheelState = {
  cx: 0,
  cy: 0,
  r: 0,
  angle: 0,
  velocity: 0,
  time: 0,
};

/**
 * The pinned gallery's contribution. `top` and `length` are the pinned range in
 * document px; `travel` is how far the cards have moved sideways, in px.
 */
export const gallery = { top: 0, length: 0, travel: 0 };

const reactors = new Set<WheelReactor>();
let wake: (() => void) | null = null;

/** The wheel registers how to wake its loop; `null` when it stops. */
export function setWheelWake(next: (() => void) | null) {
  wake = next;
}

/** Asks the wheel for another frame. Harmless if it is already awake. */
export function wakeWheel() {
  wake?.();
}

export function setGallery(next: Partial<typeof gallery>) {
  Object.assign(gallery, next);
  wake?.();
}

export function registerWheelReactor(reactor: WheelReactor) {
  reactors.add(reactor);
  wake?.();
  return () => {
    reactors.delete(reactor);
  };
}

/** Runs every reactor; true if any of them still has motion to settle. */
export function runWheelReactors() {
  let busy = false;
  for (const reactor of reactors) if (reactor(wheelState)) busy = true;
  return busy;
}

/**
 * Whether the wheel runs on this device, decided the same way by the wheel
 * and by everything that reacts to it, so the two can never disagree.
 */
export const WHEEL_QUERY =
  "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
