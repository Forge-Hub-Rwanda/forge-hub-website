import { Blob } from "@/components/blob";
import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { closing } from "@/lib/site";

/**
 * Closing call to action. Brings the hero's blob back at the foot of the page
 * so the two ends of the scroll rhyme.
 */
export function ClosingCta() {
  return (
    <section
      id="tour"
      className="border-line relative border-t px-6 py-28 lg:px-[3.6vw] lg:py-40"
    >
      {/* The only oxblood pattern on the page: a closing nod to the logo tile
          before the footer, kept at watermark strength like the rest. */}
      <ImigongoWatermark
        id="imigongo-closing"
        motif="nested"
        tone="accent"
        angle={-8}
        scale={1.6}
        opacity={0.05}
      />

      <Blob
        id="closing-blob"
        className="top-[8%] right-[6vw] h-[60%] w-[46vw] opacity-90 sm:w-[26vw] lg:w-[20vw]"
      />

      <div className="relative mx-auto max-w-[110rem]">
        <Reveal>
          <p className="text-label text-text-muted flex items-center gap-4">
            <ImigongoRule />
            {closing.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={90}>
          {/* Wraps, unlike the hero: this is a full sentence, and the size that
              would fit it on one line would stop it reading as display type. */}
          <h2 className="font-display text-oblique text-text mt-8 max-w-[16ch] text-[clamp(2.25rem,6.4vw,5.5rem)] text-balance">
            {closing.title}
          </h2>
        </Reveal>

        <Reveal delay={180}>
          <p className="text-text-muted mt-10 max-w-[48ch] text-lg leading-snug lg:text-xl">
            {closing.body}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={closing.primaryCta.href}
              className="btn"
            >
              {closing.primaryCta.label}
            </a>
            <a
              href={closing.secondaryCta.href}
              className="btn"
            >
              {closing.secondaryCta.label}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
