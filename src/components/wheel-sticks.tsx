"use client";

import { useEffect, useRef, useState } from "react";
import { ImigongoWatermark } from "@/components/imigongo";
import { registerWheelReactor, WHEEL_QUERY } from "@/lib/wheel";

/**
 * The programs band's herringbone, as sticks the imigongo wheel can push.
 *
 * The band's watermark is a tiled SVG pattern, and a pattern cannot move one
 * plank without moving them all. So where the wheel runs, this redraws the
 * same field as individual planks — the same tile, scale, angle and strength,
 * so the swap is invisible — and gives each one a spring. Planks the wheel's
 * rim comes near drift outward, away from its centre, and sway slowly on a
 * phase of their own, like sticks on water; once the wheel has passed, the
 * springs float them back to where they were.
 *
 * Everywhere else — a phone, reduced motion, no scripting — it is simply the
 * original `ImigongoWatermark`, unchanged.
 *
 * Only planks that are in the wheel's reach, or still settling, are written
 * on a frame; the rest of the field is never touched, so the cost is a few
 * dozen transforms rather than the whole band.
 */

/** The watermark this replaces, and must match exactly. */
const TILE = 48;
const SCALE = 3.5;
const ANGLE = -8;
const OPACITY = 0.05;
const STROKE = 5;

/**
 * The four planks of one herringbone tile, in tile units, from `TILES` in
 * imigongo.tsx. The fourth is the plank the tile's own edge cuts in two there,
 * joined back into one piece — here each plank is its own element, so there is
 * no seam to hide.
 */
const PLANKS = [
  [1.4, 1.4, 22.6, 22.6],
  [1.4, 25.4, 22.6, 46.6],
  [25.4, 34.6, 46.6, 13.4],
  [25.4, 58.6, 46.6, 37.4],
] as const;

/** How far past its rim the wheel pushes, in px. */
const REACH = 150;

/** The furthest a plank is pushed, in px. */
const PUSH = 70;

/** Slow and a little under-damped, so the sticks float rather than snap. */
const STIFF = 0.025;
const DAMP = 0.9;

type Plank = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Centre, in band px. */
  mx: number;
  my: number;
  phase: number;
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  va: number;
  moving: boolean;
};

/** Lays the planks out over a band of the given size, in band px. */
function layout(width: number, height: number): Plank[] {
  const angle = (ANGLE * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Pattern space → band px: scale, then rotate, as the pattern's own
  // `rotate(angle) scale(scale)` does.
  const place = (px: number, py: number) => [
    (px * cos - py * sin) * SCALE,
    (px * sin + py * cos) * SCALE,
  ];

  // Which tiles can reach the band at all: the band's corners, taken back
  // into pattern space.
  const corners = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ].map(([x, y]) => [
    (x * cos + y * sin) / SCALE,
    (-x * sin + y * cos) / SCALE,
  ]);
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const fromX = Math.floor(Math.min(...xs) / TILE) - 1;
  const toX = Math.ceil(Math.max(...xs) / TILE) + 1;
  const fromY = Math.floor(Math.min(...ys) / TILE) - 1;
  const toY = Math.ceil(Math.max(...ys) / TILE) + 1;

  const planks: Plank[] = [];
  const margin = TILE * SCALE;

  for (let ty = fromY; ty <= toY; ty++) {
    for (let tx = fromX; tx <= toX; tx++) {
      for (const [ax, ay, bx, by] of PLANKS) {
        const [x1, y1] = place(tx * TILE + ax, ty * TILE + ay);
        const [x2, y2] = place(tx * TILE + bx, ty * TILE + by);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        if (mx < -margin || mx > width + margin) continue;
        if (my < -margin || my > height + margin) continue;
        planks.push({
          x1,
          y1,
          x2,
          y2,
          mx,
          my,
          phase: Math.random() * Math.PI * 2,
          x: 0,
          y: 0,
          a: 0,
          vx: 0,
          vy: 0,
          va: 0,
          moving: false,
        });
      }
    }
  }
  return planks;
}

export function WheelSticks({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [planks, setPlanks] = useState<Plank[] | null>(null);

  // Lay the field out once the band has a size, and again if it changes.
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.matchMedia(WHEEL_QUERY).matches) return;

    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width > 0 && height > 0) setPlanks(layout(width, height));
    };
    const sizer = new ResizeObserver(measure);
    sizer.observe(node);
    return () => sizer.disconnect();
  }, []);

  // Once the planks are drawn, let the wheel move them.
  useEffect(() => {
    const node = ref.current;
    const svg = svgRef.current;
    if (!planks || !node || !svg) return;

    const lines = Array.from(svg.querySelectorAll<SVGLineElement>("line"));
    let top = 0;
    let left = 0;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      top = rect.top + window.scrollY;
      left = rect.left;
    };
    measure();
    window.addEventListener("resize", measure);

    // The box every plank's middle lies in, in band px. If the wheel's reach
    // misses the whole box, it misses every plank in it, so a frame with the
    // wheel elsewhere on the page and nothing left settling can stop before
    // looking at a single plank. Planks are tested individually otherwise,
    // exactly as before.
    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };
    for (const plank of planks) {
      bounds.minX = Math.min(bounds.minX, plank.mx);
      bounds.minY = Math.min(bounds.minY, plank.my);
      bounds.maxX = Math.max(bounds.maxX, plank.mx);
      bounds.maxY = Math.max(bounds.maxY, plank.my);
    }
    /** Planks still springing back, so the band cannot be skipped. */
    let settling = false;

    const unregister = registerWheelReactor((wheel) => {
      const bandTop = top - window.scrollY;
      const zone = wheel.r + REACH;

      if (!settling) {
        const nearestX = Math.min(
          Math.max(wheel.cx, left + bounds.minX),
          left + bounds.maxX,
        );
        const nearestY = Math.min(
          Math.max(wheel.cy, bandTop + bounds.minY),
          bandTop + bounds.maxY,
        );
        if (Math.hypot(wheel.cx - nearestX, wheel.cy - nearestY) >= zone) {
          return false;
        }
      }

      let busy = false;

      for (let i = 0; i < planks.length; i++) {
        const plank = planks[i];
        const dx = left + plank.mx - wheel.cx;
        const dy = bandTop + plank.my - wheel.cy;
        const distance = Math.hypot(dx, dy) || 1;

        let tx = 0;
        let ty = 0;
        let ta = 0;
        if (distance < zone) {
          // Deepest at the rim and a little inside it, fading out to the
          // edge of the reach.
          const depth = Math.min(1, (zone - distance) / (REACH * 1.6));
          const eased = depth * depth * (3 - 2 * depth);
          const sway = Math.sin(wheel.time * 0.55 + plank.phase);
          tx =
            (dx / distance) * PUSH * eased - (dy / distance) * sway * 9 * eased;
          ty =
            (dy / distance) * PUSH * eased + (dx / distance) * sway * 9 * eased;
          ta = sway * 14 * eased;
        } else if (!plank.moving) {
          // At rest and out of reach: never touched.
          continue;
        }

        plank.vx = (plank.vx + (tx - plank.x) * STIFF) * DAMP;
        plank.vy = (plank.vy + (ty - plank.y) * STIFF) * DAMP;
        plank.va = (plank.va + (ta - plank.a) * STIFF) * DAMP;
        plank.x += plank.vx;
        plank.y += plank.vy;
        plank.a += plank.va;

        const settled =
          tx === 0 &&
          Math.abs(plank.x) + Math.abs(plank.y) < 0.1 &&
          Math.abs(plank.a) < 0.05 &&
          Math.abs(plank.vx) + Math.abs(plank.vy) + Math.abs(plank.va) < 0.02;

        const line = lines[i];
        if (settled) {
          plank.x = plank.y = plank.a = 0;
          plank.vx = plank.vy = plank.va = 0;
          plank.moving = false;
          line.style.transform = "";
          continue;
        }

        plank.moving = true;
        busy = true;
        line.style.transform = `translate(${plank.x.toFixed(1)}px, ${plank.y.toFixed(1)}px) rotate(${plank.a.toFixed(2)}deg)`;
      }

      settling = busy;
      return busy;
    });

    return () => {
      unregister();
      window.removeEventListener("resize", measure);
    };
  }, [planks]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-clip"
    >
      {planks ? (
        <svg
          ref={svgRef}
          className="text-accent absolute inset-0 h-full w-full"
        >
          <g
            stroke="currentColor"
            strokeWidth={STROKE * SCALE}
            opacity={OPACITY}
          >
            {planks.map((plank, index) => (
              <line
                key={index}
                x1={plank.x1}
                y1={plank.y1}
                x2={plank.x2}
                y2={plank.y2}
                className="wheel-stick"
              />
            ))}
          </g>
        </svg>
      ) : (
        <ImigongoWatermark
          id={id}
          motif="herringbone"
          tone="accent"
          angle={ANGLE}
          scale={SCALE}
          opacity={OPACITY}
        />
      )}
    </div>
  );
}
