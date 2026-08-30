import { site } from "@/lib/site";

/**
 * ForgeHub logo tile.
 *
 * The reference design anchors the page with a small solid square carrying a
 * stacked two-line wordmark, centred at the very top. This reproduces that
 * DEVICE with ForgeHub's own name and colour.
 *
 * NOTE: this is a stand-in. A square oxblood tile is close enough to the
 * reference brand's own mark that ForgeHub should replace it with a distinct
 * identity before launch — drop the official vector in here and nothing else
 * on the site needs to change.
 */

type LogoProps = {
  /** "tile" is the stacked square mark; "inline" is a single-line wordmark. */
  variant?: "tile" | "inline";
  className?: string;
};

export function Logo({ variant = "tile", className }: LogoProps) {
  const label = `${site.name} ${site.region}`;

  if (variant === "inline") {
    return (
      <span
        className={`font-display text-[1.05rem] leading-none font-black tracking-[-0.02em] uppercase ${className ?? ""}`}
      >
        <span className="sr-only">{label}</span>
        <span aria-hidden>Forge Hub</span>
      </span>
    );
  }

  return (
    <span
      className={`bg-accent text-text-invert flex aspect-square flex-col items-center justify-center leading-[0.94] font-black tracking-[0.01em] uppercase ${className ?? ""}`}
      role="img"
      aria-label={label}
    >
      <span aria-hidden className="block text-[0.62em]">
        Forge
      </span>
      <span aria-hidden className="block text-[0.82em]">
        Hub
      </span>
    </span>
  );
}
