/**
 * The imigongo wheel's artwork: one SVG of concentric bands built from the
 * site's own imigongo vocabulary, read from the rim inward.
 *
 *   - the rim: sawtooth teeth, the same triangles `ImigongoBand` frames the
 *     footer with, run round the circumference so the wheel reads as a gear;
 *   - a zigzag ring, the chevron band of the `zigzag` motif bent into a circle;
 *   - a ring of nested lozenges, the diamond-in-diamond of the `lozenge` motif;
 *   - a ring of alternating solid triangles, the `nested` motif;
 *   - eight panel dividers, the way a real panel is split into fields;
 *   - a lozenge hub.
 *
 * Everything is computed here, at module load, from a handful of numbers — no
 * traced artwork — and painted in `currentColor`, so the one drawing serves the
 * live wheel (white, blended onto whatever band it is over) and the static copy
 * docked in the closing section (in the page's text colour).
 *
 * A server component: it renders static markup and holds no state, so the
 * static copy costs no script at all.
 */

/** Rounded to a hundredth of a unit, which is sub-pixel at any size used. */
const n = (value: number) => Math.round(value * 100) / 100;

/** A point on a circle of radius `r` at `turn` (0–1 of a full turn). */
const at = (r: number, turn: number) => {
  const angle = turn * Math.PI * 2;
  return `${n(Math.cos(angle) * r)} ${n(Math.sin(angle) * r)}`;
};

/** Gear teeth: triangles on a base circle, apex outward. */
function teeth(count: number, base: number, tip: number) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const start = i / count;
    const end = (i + 1) / count;
    d += `M${at(base, start)}L${at(tip, (start + end) / 2)}L${at(base, end)}Z`;
  }
  return d;
}

/** A closed zigzag running between two radii. */
function zigzag(points: number, inner: number, outer: number) {
  let d = "";
  for (let i = 0; i <= points; i++) {
    d += `${i === 0 ? "M" : "L"}${at(i % 2 ? outer : inner, i / points)}`;
  }
  return `${d}Z`;
}

/** Alternating solid triangles in a band: one pointing out, the next in. */
function triangles(count: number, inner: number, outer: number) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const start = i / count;
    const end = (i + 1) / count;
    const middle = (start + end) / 2;
    d +=
      i % 2
        ? `M${at(outer, start)}L${at(inner, middle)}L${at(outer, end)}Z`
        : `M${at(inner, start)}L${at(outer, middle)}L${at(inner, end)}Z`;
  }
  return d;
}

/** A lozenge centred at radius `r`, pointing along its radius. */
function lozenge(r: number, turn: number, half: number) {
  const angle = turn * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const point = (along: number, across: number) =>
    `${n(cos * (r + along) - sin * across)} ${n(sin * (r + along) + cos * across)}`;
  return `M${point(-half, 0)}L${point(0, half * 0.72)}L${point(half, 0)}L${point(0, -half * 0.72)}Z`;
}

const LOZENGES = 24;

const TEETH = teeth(96, 91, 99);
const ZIGZAG = zigzag(72, 77, 86);
const TRIANGLES = triangles(36, 40, 52);
const LOZENGE_OUTER = Array.from({ length: LOZENGES }, (_, i) =>
  lozenge(64, i / LOZENGES, 7),
).join("");
const LOZENGE_INNER = Array.from({ length: LOZENGES }, (_, i) =>
  lozenge(64, i / LOZENGES, 2.8),
).join("");
const DIVIDERS = Array.from(
  { length: 8 },
  (_, i) => `M${at(16, i / 8 + 1 / 16)}L${at(36, i / 8 + 1 / 16)}`,
).join("");

export function WheelArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="-100 -100 200 200"
      className={`pointer-events-none block h-full w-full ${className ?? ""}`}
    >
      <g fill="currentColor">
        <path d={TEETH} />
        <path d={TRIANGLES} />
        <path d={LOZENGE_INNER} />
        {/* The hub's solid centre. */}
        <path d="M0 -6 L6 0 L0 6 L-6 0 Z" />
      </g>
      <g fill="none" stroke="currentColor">
        <circle r="91" strokeWidth="1.4" />
        <path d={ZIGZAG} strokeWidth="1.5" strokeLinejoin="miter" />
        <circle r="73" strokeWidth="0.8" />
        <path d={LOZENGE_OUTER} strokeWidth="1.2" />
        <circle r="56" strokeWidth="0.8" />
        <circle r="36" strokeWidth="1.2" />
        <path d={DIVIDERS} strokeWidth="1.2" />
        <circle r="14" strokeWidth="1" />
        <path d="M0 -12 L12 0 L0 12 L-12 0 Z" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
