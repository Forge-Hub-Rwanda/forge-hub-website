import Image from "next/image";
import { ImigongoMark } from "@/components/imigongo";
import { projectPage, type ProjectImage as Picture } from "@/lib/site";

/**
 * A project image, or an honest space where one will go.
 *
 * There is no photography on this site yet and none of the projects has a
 * screenshot cleared for publication, so every slot on the portfolio pages is
 * currently empty. The two things this must NOT do are leave a collapsed gap
 * that makes the layout look broken, and fill the space with a stand-in that
 * could be mistaken for the work. It draws a labelled block instead: the same
 * proportions the real image will take, so nothing moves when one arrives, and
 * a line of text saying plainly what it is.
 *
 * The placeholder is a `<div>`, never an `<img>` with invented alt text. A
 * screen reader is told there is an image pending in the same words a sighted
 * visitor reads, rather than being given a description of a picture that does
 * not exist.
 */
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
}: {
  image?: Picture;
  ratio?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  if (!image) {
    return (
      <div
        style={{ aspectRatio: ratio }}
        className={`border-line bg-surface-2 relative flex w-full items-end overflow-hidden border ${className ?? ""}`}
      >
        {/* Decorative, and marked so: the block's meaning is in its label. */}
        <ImigongoMark
          motif="lozenge"
          aria-hidden
          className="text-text absolute -top-8 -right-8 h-36 w-36 opacity-[0.07]"
        />
        <p className="text-label text-text-muted p-6 lg:p-8">
          {projectPage.imagePending}
        </p>
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
        className="object-cover"
      />
    </div>
  );
}
