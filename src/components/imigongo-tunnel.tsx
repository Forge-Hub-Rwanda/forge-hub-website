import { Scrub } from "@/components/scrub";

/**
 * A tunnel of concentric imigongo lozenges that the page flies through on its
 * way to the closing call to action — lusion.co's "step into a new world"
 * fly-through, built from the site's own geometry.
 *
 * Plain CSS 3D rather than WebGL. Each ring is one flat SVG in a shared
 * perspective, placed at its own depth; `Scrub` writes the section's progress
 * as `--p` and the stylesheet slides every ring toward the viewer by the same
 * amount, fading each out as it passes the camera. So the whole effect is a
 * handful of composited layers with one custom property changing — no canvas,
 * no per-frame script beyond the progress itself.
 *
 * Decorative only, and drawn at watermark strength so it is texture behind the
 * headline rather than something the headline has to compete with. Where the
 * scrub does not run the rings rest at their starting depths, which is a
 * complete, still composition in its own right.
 */

/** Rings from nearest to furthest. Fewer below lg — see globals.css. */
const RINGS = 7;

export function ImigongoTunnel() {
  return (
    <Scrub
      span="full"
      from={1}
      to={0.2}
      // Phones too, with the nearer three rings only (globals.css); a lite
      // phone keeps the still composition.
      query="all"
      liteQuery="(min-width: 48rem)"
      className="tunnel pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div aria-hidden className="tunnel-stage">
        {Array.from({ length: RINGS }, (_, index) => (
          <svg
            key={index}
            viewBox="0 0 200 200"
            className="tunnel-ring text-accent"
            style={{ "--i": index } as React.CSSProperties}
          >
            {/* Three nested lozenges with a zigzag running between the outer
                two — the banded diamond at the centre of most real panels. */}
            <path
              d="M100 4 L196 100 L100 196 L4 100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M100 22 L178 100 L100 178 L22 100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
            <path
              d="M100 40 L160 100 L100 160 L40 100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
        ))}
      </div>
    </Scrub>
  );
}
