import { ImigongoRule, ImigongoWatermark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section-heading";
import { impact, impactSection } from "@/lib/site";

/**
 * About copy paired with a figures rail.
 *
 * ⚠️  Every number in `impact` is an invented placeholder. Replace them with
 * verified figures — or drop the rail — before this page is published.
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
              {impactSection.title}
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
            <a
              href={impactSection.cta.href}
              className="btn mt-10"
            >
              {impactSection.cta.label}
            </a>
          </Reveal>
        </div>

        <dl className="grid grid-cols-2 gap-px self-start">
          {impact.map((figure, index) => (
            <Reveal key={figure.label} delay={index * 80}>
              <div className="bg-surface flex h-full flex-col justify-between p-8 lg:p-10">
                <dt className="text-label text-text-muted order-2 mt-4">
                  {figure.label}
                </dt>
                <dd className="font-display text-text order-1 text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold tracking-[-0.04em]">
                  {figure.value}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
