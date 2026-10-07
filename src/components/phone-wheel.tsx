import { WheelArt } from "@/components/wheel-art";

/**
 * The imigongo wheel for phones: half a wheel held against the right edge of a
 * band, turning as the band scrolls through the window.
 *
 * The desktop wheel is one fixed layer blended over the whole page and driven
 * by script; on a phone that is more than the effect is worth. This is the
 * same artwork as an ordinary watermark in the band's own flow — no fixed
 * layer, no blend, no script — turned by a CSS scroll-driven animation that
 * the browser runs off the main thread (see `.phone-wheel` in globals.css).
 * Where scroll timelines are unsupported, on a lite device or under reduced
 * motion, it simply stands still. Not rendered from lg, where the live wheel
 * runs.
 *
 * Place it inside a `Section`'s `watermark`.
 */
export function PhoneWheel({ top = "30%" }: { top?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-clip lg:hidden"
    >
      <div className="phone-wheel" style={{ top }}>
        <WheelArt />
      </div>
    </div>
  );
}
