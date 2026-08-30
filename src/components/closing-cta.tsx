import { Blob } from "@/components/blob";
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
      <Blob
        id="closing-blob"
        className="top-[8%] right-[6vw] h-[60%] w-[46vw] opacity-90 sm:w-[26vw] lg:w-[20vw]"
      />

      <div className="relative mx-auto max-w-[110rem]">
        <Reveal>
          <p className="text-label text-text-muted flex items-center gap-4">
            <span aria-hidden className="bg-text h-px w-8" />
            {closing.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h2 className="font-display text-oblique text-text mt-8 text-[clamp(2.25rem,7vw,6rem)]">
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
              className="bg-text text-text-invert hover:bg-accent inline-flex items-center justify-center px-8 py-4 font-bold transition-colors duration-300"
            >
              {closing.primaryCta.label}
            </a>
            <a
              href={closing.secondaryCta.href}
              className="border-text text-text hover:bg-text hover:text-text-invert inline-flex items-center justify-center border px-8 py-4 font-bold transition-colors duration-300"
            >
              {closing.secondaryCta.label}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
