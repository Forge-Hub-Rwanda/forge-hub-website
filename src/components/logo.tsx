import { site } from "@/lib/site";

/**
 * ForgeHub lockup, drawn as inline SVG so it inherits `currentColor` and stays
 * crisp at any size.
 *
 * The mark pairs an imigongo-inspired pattern column with the angular FH
 * monogram. It is a faithful-in-spirit reconstruction — drop the official
 * vector in here when it's available and the rest of the site is unaffected.
 */

type LogoProps = {
  /** "full" includes the wordmark and tagline; "mark" is the glyph alone. */
  variant?: "full" | "mark";
  className?: string;
};

function Mark() {
  return (
    <g>
      {/* Imigongo pattern column ------------------------------------------ */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Column outline, softened at the top-left like the original. */}
        <path d="M4 22 A18 18 0 0 1 22 4 H30 V96 H4 Z" />
        {/* Stacked chevrons */}
        <path d="M8 20 L17 12 L26 20" />
        <path d="M8 30 L17 22 L26 30" />
        {/* Concentric spiral at the column's waist */}
        <path d="M17 40 a8 8 0 1 1 -8 8 a5.5 5.5 0 1 0 5.5 -5.5 a3 3 0 1 1 3 3" />
        {/* Diamond lattice */}
        <path d="M8 70 L17 62 L26 70 L17 78 Z" />
        <path d="M8 88 L17 80 L26 88" />
      </g>

      {/* FH monogram ------------------------------------------------------- */}
      <g fill="currentColor">
        {/* Left stem */}
        <path d="M44 10 L64 16 V94 L44 88 Z" />
        {/* Diagonal crossbar */}
        <path d="M64 52 L98 40 V60 L64 72 Z" />
        {/* Right stem, resolving to a point at the foot */}
        <path d="M98 4 L118 10 V70 L108 98 L98 70 Z" />
      </g>
    </g>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  const label = `${site.name} ${site.region}`;

  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 122 100"
        role="img"
        aria-label={label}
        className={className}
      >
        <Mark />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 500 100"
      role="img"
      aria-label={label}
      className={className}
    >
      <Mark />
      <text
        x={150}
        y={62}
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize={58}
        fontWeight={600}
        letterSpacing="-0.02em"
      >
        {site.name}
      </text>
      {/* textLength pins the tagline's width so it can never overflow the
          viewBox, whatever metrics the display font resolves to. */}
      <text
        x={152}
        y={87}
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize={15}
        fontWeight={500}
        textLength={322}
        lengthAdjust="spacing"
        opacity={0.72}
      >
        {site.tagline.join(" · ").toUpperCase()}
      </text>
    </svg>
  );
}
