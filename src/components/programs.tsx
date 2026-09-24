import { ImigongoWatermark } from "@/components/imigongo";
import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { RollText } from "@/components/split-text";
import { programs, programsSection } from "@/lib/site";

/**
 * Programs as full-width rows rather than cards: each one has a status and two
 * spec fields, which read better on a line than stacked in a tile. The whole
 * row inverts on hover, so the hit target is the row itself.
 *
 * `tone="band"` paints the section in oxblood edge to edge. It is opt-in per
 * placement rather than baked in because this component appears twice — on the
 * homepage, where it is the page's one raised voice, and again on /services,
 * where it follows the services list and a second full-bleed colour would be
 * one statement too many on a page that is already dense.
 *
 * Nothing below reads `tone` beyond passing it on. The band's colours come
 * from the semantic roles redefined under `[data-tone="oxblood"]` in
 * `globals.css`, so the markup is identical either way: `text-text` is white
 * on the band and near-black off it, and the row's hover fill — `bg-text` with
 * `text-text-invert` — comes out white-on-oxblood as near-black-on-white.
 */
export function Programs({ tone = "plain" }: { tone?: "plain" | "band" }) {
  const band = tone === "band";

  return (
    <Section
      id="programs"
      tone={band ? "oxblood" : undefined}
      /* The colour IS the separation, so the band drops the hairline rule that
         divides one white section from the next. */
      className={band ? undefined : "border-line border-t"}
      watermark={
        band ? (
          /* Herringbone rather than the triangle field this started as: the
             band's own geometry should not simply restate the sawtooth the
             footer is edged with, and solid triangles read as blocks of tone
             at any opacity. Planks are strokes, so the motif stays linework —
             large enough to read as parquet, faint enough that it is texture
             you notice on second glance rather than a layer the rows have to
             sit on top of. */
          <ImigongoWatermark
            id="imigongo-programs"
            motif="herringbone"
            tone="accent"
            angle={-8}
            scale={3.5}
            opacity={0.05}
          />
        ) : undefined
      }
    >
      <SectionHeading {...programsSection} />

      <ul className="border-line border-t">
        {programs.map((program, index) => (
          <Reveal
            key={program.name}
            as="li"
            delay={index * 70}
            className="border-line border-b"
          >
            {/* `fill-rise`: the inverted fill sweeps up the row behind a row
                of imigongo teeth rather than switching on — see globals.css. */}
            <a
              href={programsSection.cta.href}
              data-cursor="Join"
              className="group fill-rise grid gap-4 px-2 py-8 lg:grid-cols-12 lg:items-baseline lg:gap-8 lg:px-6 lg:py-10"
            >
              <h3 className="font-display text-text group-hover:text-text-invert text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold tracking-[-0.03em] transition-colors lg:col-span-4">
                <RollText>{program.name}</RollText>
              </h3>

              <p className="text-text-muted group-hover:text-text-invert/70 leading-snug transition-colors lg:col-span-4">
                {program.blurb}
              </p>

              <dl className="text-label text-text-muted group-hover:text-text-invert/70 flex gap-6 transition-colors lg:col-span-3 lg:flex-col lg:gap-2">
                <div>
                  <dt className="sr-only">Format</dt>
                  <dd>{program.format}</dd>
                </div>
                <div>
                  <dt className="sr-only">Duration</dt>
                  <dd>{program.duration}</dd>
                </div>
              </dl>

              <p className="text-text group-hover:text-text-invert text-sm font-bold transition-colors lg:col-span-1 lg:text-right">
                {program.status}
              </p>
            </a>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
