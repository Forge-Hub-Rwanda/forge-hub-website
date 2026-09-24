import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { Odometer } from "@/components/odometer";
import { Reveal } from "@/components/reveal";
import { RollText, SplitWords } from "@/components/split-text";
import { Section } from "@/components/section-heading";
import { impact, impactSection } from "@/lib/site";

/**
 * About copy paired with a figures rail.
 *
 * The figures in `impact` are deliberately only what can be stated for certain
 * — founding year, team size, where we trained, and "Soon" for results. Keep
 * that bar: add a number here only once it is verified.
 */
export function Impact() {
  return (
    <Section
      className="bg-surface-2"
      watermark={
        <ImigongoWatermark
          id="imigongo-impact"
          motif="lozenge"
          angle={12}
          opacity={0.05}
        />
      }
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <p className="text-label text-text-muted flex items-center gap-4">
              <ImigongoRule />
              {impactSection.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="font-display text-heading text-text mt-6 text-[clamp(2rem,4vw,3.5rem)]">
              <SplitWords text={impactSection.title} />
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-8 space-y-5">
              {impactSection.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-text-muted text-lg leading-snug"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={240}>
            <a href={impactSection.cta.href} className="btn mt-10">
              <RollText>{impactSection.cta.label}</RollText>
            </a>
          </Reveal>
        </div>

        {/* Each Reveal IS a card, rather than wrapping one. A `dl` may contain
            `dt`/`dd` directly or wrapped in a single `div`; two nested divs —
            the Reveal plus a card inside it — put them a level too deep and
            make the list invalid. Merging the card's classes onto the Reveal
            keeps exactly the same box and fixes the nesting. */}
        <dl className="grid grid-cols-2 gap-px self-start">
          {impact.map((figure, index) => (
            <Reveal
              key={figure.label}
              delay={index * 80}
              className="bg-surface flex h-full flex-col justify-between p-8 lg:p-10"
            >
              <dt className="text-label text-text-muted order-2 mt-4">
                {figure.label}
              </dt>
              {/* Rolls into place digit by digit once it is on screen, like
                  the counter on lusion.co's loader. The value is still in the
                  document once, as text — see `Odometer`. */}
              <dd className="font-display text-text order-1 text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold tracking-[-0.04em]">
                <Odometer value={figure.value} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
