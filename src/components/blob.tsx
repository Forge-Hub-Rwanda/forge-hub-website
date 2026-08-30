/**
 * The organic gradient shape behind the hero.
 *
 * Drawn as an SVG path rather than an animated border-radius: the reference
 * silhouette is an asymmetric teardrop — bulbous along the top, tapering to a
 * soft point at the lower left — and a border-radius can only ever describe a
 * rounded rectangle tending toward an ellipse.
 *
 * `preserveAspectRatio="none"` lets the caller set the proportions purely with
 * width/height classes, so the same path serves the tall desktop shape and the
 * squatter mobile one. Decorative only: the hero's meaning is all in the text.
 */

type BlobProps = {
  className?: string;
  /** Distinguishes the gradient's id if more than one blob is ever rendered. */
  id?: string;
};

export function Blob({ className, id = "blob-gradient" }: BlobProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 240"
      preserveAspectRatio="none"
      className={`blob pointer-events-none absolute -z-10 will-change-transform ${className ?? ""}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0%"
            className="blob-stop-a"
            stopColor="var(--color-blob-amber)"
          />
          <stop
            offset="100%"
            className="blob-stop-b"
            stopColor="var(--color-blob-coral)"
          />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M104 4c48 0 92 34 94 86 2 54-24 88-56 116-30 26-72 36-98 14C16 198 4 158 14 116 24 74 30 34 52 18 68 6 84 4 104 4Z"
      />
    </svg>
  );
}
