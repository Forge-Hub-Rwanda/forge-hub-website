import { Blob } from "@/components/blob";
import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { ImigongoTunnel } from "@/components/imigongo-tunnel";
import { Magnetic } from "@/components/magnetic";
import { Reveal } from "@/components/reveal";
import { RollLetters, RollText } from "@/components/split-text";
import { closing } from "@/lib/site";

/**
 * Closing call to action. Brings the hero's blob back at the foot of the page
 * so the two ends of the scroll rhyme.
 *
 * Rendered at the foot of six pages, so its height is six pages' worth of
 * decision: the band below was a third of a screen of padding around four
 * short elements. The measurements it now carries — 96px of padding a side on
 * a wide screen rather than 160, and the gaps between eyebrow, title, body and
 * buttons pulled in with it — take roughly a quarter off it without turning a
 * closing statement into a strip.
 */
export function ClosingCta() {
  return (
    <section
      id="tour"
      className="border-line relative border-t px-6 py-20 lg:px-[3.6vw] lg:py-24"
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

      {/* The fly-through: concentric lozenges the scroll carries the page
          through on its way to the headline. Behind the blob and the copy. */}
      <ImigongoTunnel />

      <Blob
        id="closing-blob"
        className="top-[8%] right-[6vw] h-[60%] w-[46vw] opacity-90 sm:w-[26vw] lg:w-[20vw]"
      />

      {/* Narrower than the 110rem every other band runs to. This one is a
          single short invitation rather than a grid of content, and at full
          page width the line, the paragraph and the two buttons end up as
          three separate things stranded across a very wide row. Pulling the
          container in gathers them back into one block. */}
      <div className="relative mx-auto max-w-[88rem]">
        <Reveal>
          <p className="text-label text-text-muted flex items-center gap-4">
            <ImigongoRule />
            {closing.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={90}>
          {/* Wraps, unlike the hero: even shortened, the size that would fit
              this on one line would stop it reading as display type. The 16ch
              measure breaks it across two roughly even lines. */}
          {/* `roll-host`: pointing at the invitation ripples it letter by
              letter, as lusion.co's "Let's work together!" does. */}
          <h2 className="roll-host font-display text-oblique text-text mt-6 max-w-[16ch] text-[clamp(2.25rem,6.4vw,5.5rem)] text-balance">
            <RollLetters text={closing.title} />
          </h2>
        </Reveal>

        <Reveal delay={180}>
          <p className="text-text-muted mt-7 max-w-[48ch] text-lg leading-snug lg:text-xl">
            {closing.body}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Magnetic>
              <a href={closing.primaryCta.href} className="btn btn-strong">
                <RollText>{closing.primaryCta.label}</RollText>
              </a>
            </Magnetic>
            <a href={closing.secondaryCta.href} className="btn">
              <RollText>{closing.secondaryCta.label}</RollText>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
