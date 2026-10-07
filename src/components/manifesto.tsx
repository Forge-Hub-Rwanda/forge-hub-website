import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { Scrub } from "@/components/scrub";
import { Section } from "@/components/section-heading";
import { RollText, SplitWords } from "@/components/split-text";
import { PhoneWheel } from "@/components/phone-wheel";
import { WheelNudge } from "@/components/wheel-nudge";
import { manifesto } from "@/lib/site";

/**
 * Full-width statement band. No cards, no images — one long sentence set large
 * enough that it has to be read, which is the whole point of the section.
 *
 * The sentence inks in word by word as it is scrolled through, from the pale
 * rule colour to full ink, so it reads as being written while it is read. On a
 * lite phone (see src/lib/motion-tier.ts) or under reduced motion it is simply
 * the finished sentence.
 */
export function Manifesto() {
  return (
    <Section
      id="about"
      className="border-line border-t"
      watermark={
        <>
          {/* Ripples as the homepage's imigongo wheel passes over it. */}
          <WheelNudge>
            <ImigongoWatermark
              id="imigongo-manifesto"
              motif="spiral"
              scale={1.4}
            />
          </WheelNudge>
          {/* Phones: the wheel, turning as the band scrolls past. */}
          <PhoneWheel top="12%" />
        </>
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
        {/* Every width; a lite phone keeps the finished sentence. */}
        <Scrub query="all" liteQuery="(min-width: 48rem)" from={0.85} to={0.3}>
          <h2 className="font-display text-heading text-text mt-10 max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.25rem)]">
            <SplitWords text={manifesto.statement} mode="scrub" />
          </h2>
        </Scrub>
      </Reveal>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Reveal delay={200} className="lg:max-w-[46ch]">
          <p className="text-text-muted text-lg leading-snug">
            {manifesto.body}
          </p>
        </Reveal>
        <Reveal delay={280}>
          <a href={manifesto.cta.href} className="btn">
            <RollText>{manifesto.cta.label}</RollText>
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
