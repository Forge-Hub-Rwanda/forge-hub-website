import { LOGO_LOCKUP, LOGO_MARK } from "@/components/logo-art";
import { site } from "@/lib/site";

/**
 * ForgeHub logo.
 *
 *   - "tile"   — the oxblood square with the mark knocked out of it, so the
 *                mark is a genuine hole and whatever sits behind the header
 *                shows through as the page scrolls.
 *   - "lockup" — mark, wordmark and tagline as solid artwork, for the footer.
 *
 * Both fill with `currentColor`, so a placement sets the colour with an
 * ordinary text-colour class. That is also why the art is inlined rather than
 * referenced as an <img>: through <img> the SVG is a separate document, where
 * `currentColor` has nothing to inherit from and resolves to black.
 */

type LogoProps = {
  /** "tile" is the knocked-out oxblood square; "lockup" is the full logo. */
  variant?: "tile" | "lockup";
  className?: string;
};

/* ---- Knockout geometry ---------------------------------------------------
   The hole is cut with `fill-rule: evenodd`: an enclosing rectangle adds one
   crossing to every point inside it, which flips the fill parity, so the
   mark's ink becomes empty and its counters fill with oxblood. Doing it this
   way keeps the tile a single <path> — a <mask> would need a document-unique
   id, which a server component cannot mint.

   The rectangle is placed around the mark's own coordinate space rather than
   the mark being transformed into the square, so the traced path is used
   exactly as generated. The mark is 896x1184; a square of 1558 leaves it at
   1184/1558 = 76% of the tile height, centred by the offsets below. */
const MARK_W = 896;
const MARK_H = 1184;
const TILE = 1558; // 1184 / 0.76
const OX = (TILE - MARK_W) / 2; // 331
const OY = (TILE - MARK_H) / 2; // 187
const TILE_VIEW_BOX = `${-OX} ${-OY} ${TILE} ${TILE}`;
const TILE_RECT = `M${-OX} ${-OY} H${TILE - OX} V${TILE - OY} H${-OX} Z`;

export function Logo({ variant = "tile", className }: LogoProps) {
  const label = `${site.name} ${site.region}`;

  if (variant === "lockup") {
    return (
      <svg
        viewBox={LOGO_LOCKUP.viewBox}
        role="img"
        aria-label={label}
        className={`h-auto ${className ?? ""}`}
      >
        <path fill="currentColor" fillRule="evenodd" d={LOGO_LOCKUP.d} />
      </svg>
    );
  }

  return (
    <svg
      viewBox={TILE_VIEW_BOX}
      role="img"
      aria-label={label}
      className={`text-accent aspect-square ${className ?? ""}`}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d={`${TILE_RECT}${LOGO_MARK.d}`}
      />
    </svg>
  );
}
