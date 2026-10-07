import Image from "next/image";
import {
  ImigongoMark,
  ImigongoWatermark,
  type ImigongoMotif,
} from "@/components/imigongo";
import { projectPage, type ProjectImage as Picture } from "@/lib/site";

/**
 * A project image, or imigongo artwork where one will go.
 *
 * There is no photography on this site yet and none of the projects has a
 * screenshot cleared for publication, so every slot on the portfolio pages is
 * currently empty. The two things this must NOT do are leave a collapsed gap
 * that makes the layout look broken, and fill the space with a stand-in that
 * could be mistaken for the work. It draws an imigongo panel instead — plainly
 * pattern, never a picture of a product — in the project's own colour and in
 * the same proportions the real image will take, so nothing moves when one
 * arrives through /admin.
 *
 * The artwork is decorative, so a screen reader is told what a sighted visitor
 * can infer: that the image is still to come, in the same words, rather than
 * being given a description of a picture that does not exist.
 */

/** The motifs the artwork cycles through, so neighbouring projects differ. */
const ART_MOTIFS: ImigongoMotif[] = ["lozenge", "nested", "spiral", "zigzag"];

export function ProjectImage({
  image,
  /** Aspect ratio as a CSS value, e.g. "16 / 9". Applies to both states. */
  ratio = "16 / 9",
  /**
   * Set on the one image above the fold. Everything else stays lazy, which is
   * `next/image`'s default and the right one for a page of screenshots.
   */
  priority = false,
  className,
  sizes = "(min-width: 64rem) 70vw, 100vw",
  artId = "project-image-art",
  tint = "var(--color-blob-amber)",
  variant = 0,
}: {
  image?: Picture;
  /**
   * Unique per document: the artwork is an SVG pattern, and two patterns with
   * one id would both paint in the first one's colour. Callers pass the
   * project's slug plus a suffix.
   */
  artId?: string;
  /** The artwork's colour, as a CSS value — `projectTint` in site.ts. */
  tint?: string;
  /** Which motif the artwork uses; the project's index is a good choice. */
  variant?: number;
  ratio?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  if (!image) {
    const motif = ART_MOTIFS[variant % ART_MOTIFS.length];
    return (
      <div
        style={
          {
            aspectRatio: ratio,
            "--art-tint": tint,
            backgroundColor:
              "color-mix(in srgb, var(--art-tint) 22%, var(--color-surface-2))",
            color: "color-mix(in srgb, var(--art-tint) 70%, var(--color-text))",
          } as React.CSSProperties
        }
        className={`project-art relative w-full overflow-hidden ${className ?? ""}`}
      >
        {/* `project-art-inner` is what the phone gallery's scroll scales. */}
        <div aria-hidden className="project-art-inner absolute inset-0">
          <ImigongoWatermark
            id={artId}
            motif={motif}
            tone="current"
            opacity={0.22}
            scale={2.4}
            angle={-8}
          />
          <ImigongoMark
            motif="lozenge"
            className="absolute top-1/2 left-1/2 h-auto w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-40"
          />
        </div>
        <p className="sr-only">{projectPage.imagePending}</p>
      </div>
    );
  }

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={`bg-surface-2 relative w-full overflow-hidden ${className ?? ""}`}
    >
      {/* `fill` rather than the intrinsic size: the ratio above owns the box,
          so the image only has to cover it. `sizes` is what lets Next pick a
          file narrow enough for the column it actually lands in. */}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="project-art-inner object-cover"
      />
    </div>
  );
}
