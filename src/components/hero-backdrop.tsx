/**
 * Layered hero background, light theme.
 *
 * With no photography available this composes a backdrop from primitives: an
 * imigongo-inspired tile, two soft accent washes, and a fade into the section
 * below. Pass `image` to sit a photograph under the same overlays — the
 * treatment on top is identical either way, so dropping in a real photo of the
 * space does not change the composition.
 */

import Image from "next/image";

type HeroBackdropProps = {
  /**
   * Optional background photograph. Purely decorative — the whole backdrop is
   * `aria-hidden`, so it takes no alt text: describing it would put a second
   * copy of the hero's meaning into the accessibility tree.
   */
  image?: { src: string };
};

export function HeroBackdrop({ image }: HeroBackdropProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="bg-surface absolute inset-0" />

      {/* Optional photograph ----------------------------------------------- */}
      {image ? (
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
      ) : null}

      {/* Accent washes ------------------------------------------------------ */}
      <div
        className="drift absolute -top-1/4 -right-1/5 h-[75vh] w-[65vw] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-accent-soft) 0%, transparent 68%)",
          opacity: 0.9,
        }}
      />
      <div
        className="absolute -bottom-1/3 -left-1/4 h-[65vh] w-[60vw] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-accent-soft) 0%, transparent 70%)",
          opacity: 0.6,
        }}
      />

      {/* Imigongo tile ------------------------------------------------------ */}
      <svg className="text-accent absolute inset-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern
            id="imigongo"
            width="128"
            height="128"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.15">
              {/* Nested diamonds */}
              <path d="M64 4 L124 64 L64 124 L4 64 Z" />
              <path d="M64 28 L100 64 L64 100 L28 64 Z" />
              <path d="M64 50 L78 64 L64 78 L50 64 Z" />
              {/* Corner chevrons knit adjacent tiles together */}
              <path d="M0 0 L20 20 M128 0 L108 20 M0 128 L20 108 M128 128 L108 108" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#imigongo)" />
      </svg>

      {/* Clear the pattern out behind the copy so type stays crisp. Two stops
          rather than one: a solid core under the text, then a long tail so the
          pattern returns gradually instead of showing a visible edge. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_26%_46%,var(--color-surface)_0%,var(--color-surface)_28%,transparent_72%)]" />

      {/* Bottom fade into the next section --------------------------------- */}
      <div className="to-surface absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent" />
    </div>
  );
}
