/**
 * Imigongo motifs — the geometric vocabulary of Rwandan cow-dung relief panels:
 * zigzags, nested triangles, concentric lozenges and square spirals.
 *
 * The geometry here is drawn from scratch as SVG rather than traced from
 * photographs of real panels: it stays sharp at any size, recolours with the
 * page's own tokens, and carries no third party's authorship.
 *
 * Everything in this file is decorative. Every element is `aria-hidden` and
 * `pointer-events-none`, so none of it reaches assistive technology or
 * interferes with the content it sits behind.
 *
 * Pattern ids must be unique per document, so each caller passes its own `id`
 * rather than the component generating one — the same approach the blob takes,
 * and what keeps these usable as server components.
 */

export type ImigongoMotif =
  "zigzag" | "lozenge" | "spiral" | "nested" | "herringbone";

type Tile = { size: number; paint: React.ReactNode };

/**
 * Which role the artwork paints in. The motifs are all drawn in
 * `currentColor`, so this is only ever a text-colour utility.
 *
 * `invert` is the one that needs explaining: it means "the colour this
 * surface's own text is in", which is what an inverted panel like the footer
 * needs. On such a panel `text` would resolve to the panel's own background
 * and the artwork would be invisible — and because the footer flips with the
 * theme, no fixed hue would work in both.
 */
export type ImigongoTone = "text" | "accent" | "invert";

function toneClass(tone: ImigongoTone) {
  return tone === "accent"
    ? "text-accent"
    : tone === "invert"
      ? "text-text-invert"
      : "text-text";
}

/**
 * One repeating unit per motif. Each is built so its edges meet its own
 * neighbours: the zigzag's peaks land on the tile boundary, the triangle grid
 * splits the tile diagonally, so a tiled field reads as continuous rather than
 * as a grid of stamps.
 */
export const TILES: Record<ImigongoMotif, Tile> = {
  // A continuous chevron band. Endpoints sit on the tile's left and right
  // edges at the same height, so rows join seamlessly in both directions.
  zigzag: {
    size: 40,
    paint: (
      <path
        d="M0 40 L10 20 L20 40 L30 20 L40 40 M0 20 L10 0 L20 20 L30 0 L40 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
    ),
  },
  // Concentric lozenges — the diamond-in-diamond that gives imigongo panels
  // their quilted look. Quarter diamonds at the corners continue the lattice
  // across tile boundaries.
  lozenge: {
    size: 48,
    paint: (
      <>
        <path
          d="M24 3 L45 24 L24 45 L3 24 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M24 14 L34 24 L24 34 L14 24 Z" fill="currentColor" />
        <path
          d="M0 -10 L10 0 L0 10 L-10 0 Z M48 -10 L58 0 L48 10 L38 0 Z M0 38 L10 48 L0 58 L-10 48 Z M48 38 L58 48 L48 58 L38 48 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </>
    ),
  },
  // The coiled square spiral, drawn as one unbroken stroke.
  spiral: {
    size: 56,
    paint: (
      <path
        d="M6 6 H50 V50 H14 V14 H42 V42 H22 V22 H34 V34"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    ),
  },
  // Offset diagonal planks — parquet laid in alternating columns, each column
  // shifted half a plank against its neighbour so that a plank's END butts the
  // SIDE of the next rather than meeting it at an apex. That offset is the
  // whole difference between a herringbone and a chevron, and it is why this
  // motif does not simply restate the zigzag above it.
  //
  // The tile is two 24-wide columns. Planks run one way in the left column and
  // the other in the right, spaced 24 apart, so at the seam the left column's
  // ends land on y ≡ 0 (mod 24) and the right column's on y ≡ 12 — half a
  // space out, which is what makes the two interlock.
  //
  // One plank is cut by the tile's own top edge and continues across the
  // bottom, so it is drawn as two segments. Every REAL plank end is inset by
  // 2, which is what keeps the planks reading as separate pieces rather than
  // as one unbroken line; the two ends that are a join rather than a plank end
  // are the only ones left flush, or the seam would show as a gap.
  herringbone: {
    size: 48,
    paint: (
      <path
        d="M1.4 1.4 L22.6 22.6 M1.4 25.4 L22.6 46.6 M25.4 34.6 L46.6 13.4 M25.4 10.6 L36 0 M36 48 L46.6 37.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
    ),
  },
  // Alternating solid triangles — the densest of the set, so it carries the
  // most weight at the same opacity.
  nested: {
    size: 40,
    paint: (
      <path
        d="M0 0 H20 L0 20 Z M20 20 H40 L20 40 Z M40 0 V20 L20 0 Z M0 40 V20 L20 40 Z"
        fill="currentColor"
      />
    ),
  },
};

/**
 * A full-bleed tiled field, sized to whatever it is placed inside. Meant to
 * sit behind a section at watermark strength: the pattern is texture you
 * notice on second glance, never something body copy has to fight.
 *
 * The parent must establish a positioning context, and content after it must
 * be positioned too, so it paints above.
 */
export function ImigongoWatermark({
  motif,
  id,
  className,
  opacity = 0.04,
  scale = 1,
  angle = 0,
  tone = "text",
}: {
  motif: ImigongoMotif;
  /** Must be unique in the document. */
  id: string;
  className?: string;
  /** Deliberately tiny by default. Above ~0.08 the pattern starts competing. */
  opacity?: number;
  scale?: number;
  /** Rotates the tiling, so two sections using one motif still differ. */
  angle?: number;
  tone?: ImigongoTone;
}) {
  const tile = TILES[motif];

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${toneClass(tone)} ${className ?? ""}`}
    >
      <defs>
        <pattern
          id={id}
          width={tile.size}
          height={tile.size}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle}) scale(${scale})`}
        >
          {tile.paint}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/**
 * A horizontal strip of sawtooth triangles — the edge banding that frames most
 * real panels. Used as a section divider and along the top of the footer,
 * where it has room to actually read.
 */
export function ImigongoBand({
  id,
  className,
  opacity = 0.25,
  flip = false,
}: {
  id: string;
  className?: string;
  opacity?: number;
  /** Points the teeth downward instead of up. */
  flip?: boolean;
}) {
  return (
    // No viewBox on purpose: user units are then CSS pixels, so the teeth keep
    // a constant size and simply repeat more times on a wider screen, rather
    // than one tooth stretching across the whole strip.
    <svg
      aria-hidden
      className={`pointer-events-none block h-3 w-full ${className ?? ""}`}
    >
      <defs>
        <pattern id={id} width="24" height="12" patternUnits="userSpaceOnUse">
          <path
            d={flip ? "M0 0 L12 12 L24 0 Z" : "M0 12 L12 0 L24 12 Z"}
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/**
 * The small zigzag that replaces the plain rule before a section's eyebrow
 * label. Sized in `em`, so it tracks whatever label it sits next to.
 */
export function ImigongoRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 8"
      className={`h-2 w-10 shrink-0 ${className ?? ""}`}
    >
      <path
        d="M0 7 L5 1 L10 7 L15 1 L20 7 L25 1 L30 7 L35 1 L40 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/**
 * A patch of pattern anchored in a corner, dissolving as it moves away from
 * it. The fade is a CSS mask rather than a gradient overlay, so it works over
 * whatever happens to be behind — no assumption that the backdrop is flat.
 *
 * The mask is stated twice: `mask-image` for current browsers and
 * `WebkitMaskImage` for older WebKit, which still needs the prefix.
 */
export function ImigongoCorner({
  motif,
  id,
  className,
  opacity = 0.16,
  scale = 1,
  /** How far across the patch the pattern survives before it has gone. */
  reach = "72%",
  tone = "text",
}: {
  motif: ImigongoMotif;
  id: string;
  className?: string;
  opacity?: number;
  scale?: number;
  reach?: string;
  /** `invert` for a placement on an inverted panel — see `ImigongoTone`. */
  tone?: ImigongoTone;
}) {
  const tile = TILES[motif];
  // Densest at the corner itself, gone by `reach` — hence "fading outwards".
  const mask = `radial-gradient(circle at 100% 100%, #000 0%, #000 18%, transparent ${reach})`;

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute ${toneClass(tone)} ${className ?? ""}`}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <defs>
        <pattern
          id={id}
          width={tile.size}
          height={tile.size}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          {tile.paint}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/**
 * A single motif at readable size, for tucking into a card corner.
 */
export function ImigongoMark({
  motif,
  className,
}: {
  motif: ImigongoMotif;
  className?: string;
}) {
  const tile = TILES[motif];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${tile.size} ${tile.size}`}
      className={`pointer-events-none ${className ?? ""}`}
    >
      {tile.paint}
    </svg>
  );
}
