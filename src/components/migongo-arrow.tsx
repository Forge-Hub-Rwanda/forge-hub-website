/**
 * A right-pointing arrow in the imigongo manner: a square-ended shaft into a
 * solid triangular head, the hard geometry of the panels' teeth rather than a
 * rounded UI glyph.
 *
 * Drawn as an SVG on purpose. Characters such as ▶, → and ↗ are rendered as
 * colour emoji by many phones, which is exactly what this replaces. Static —
 * it never animates. Sized in `em`, so it follows the text it sits beside;
 * rotate it with a class for the diagonal "opens elsewhere" variant.
 */
export function MigongoArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 14"
      fill="currentColor"
      className={`inline-block h-[0.6em] w-auto shrink-0 ${className ?? ""}`}
    >
      <path d="M0 5.5h14v3H0z" />
      <path d="M12 0 24 7 12 14z" />
    </svg>
  );
}
