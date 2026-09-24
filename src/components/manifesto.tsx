import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section-heading";
import { manifesto } from "@/lib/site";

/**
 * Full-width statement band. No cards, no images — one long sentence set large
 * enough that it has to be read, which is the whole point of the section.
 */
export function Manifesto() {
  return (
    <Section
      id="about"
      className="border-line border-t"
      watermark={
        <ImigongoWatermark id="imigongo-manifesto" motif="spiral" scale={1.4} />
      }
    >
      <Reveal>
        <p className="text-label text-text-muted flex items-center gap-4">
          <ImigongoRule />
          {manifesto.eyebrow}
        </p>
      </Reveal>

      <Reveal delay={100}>
        {/* An `h2`, not a `p`. The classes are unchanged, so this renders
            exactly as before — but the band previously had no heading of any
            kind, which left the whole "why we exist" section missing from the
            document outline and unreachable by heading navigation. */}
        <h2 className="font-display text-heading text-text mt-10 max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.25rem)]">
          {manifesto.statement}
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Reveal delay={200} className="lg:max-w-[46ch]">
          <p className="text-text-muted text-lg leading-snug">
            {manifesto.body}
          </p>
        </Reveal>
        <Reveal delay={280}>
          <a href={manifesto.cta.href} className="btn">
            {manifesto.cta.label}
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
