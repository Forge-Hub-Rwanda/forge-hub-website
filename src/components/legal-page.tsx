import { Blob } from "@/components/blob";
import { ImigongoCorner } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { Section } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { LegalBlock, LegalDocument } from "@/lib/legal";
import { contact } from "@/lib/site";

/**
 * The shared layout for /privacy and /cookies: the same hero every subpage
 * carries, then the policy as one readable column beside a contents list.
 *
 * Deliberately plainer than the other pages below the hero. No reveals, drifts
 * or cards: this is text people read closely, often to find one clause, so it
 * is on screen at once and nothing moves under the reader.
 *
 * `extras` places a component at the end of a section, keyed by section id.
 */
export function LegalPage({
  doc,
  extras,
}: {
  doc: LegalDocument;
  extras?: Record<string, React.ReactNode>;
}) {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(38.4vh,40vw)] lg:left-[11vw]" />
          <PageHeroLine title={doc.title} />
          <SiteHeader />
          <PageIntro eyebrow={doc.eyebrow} lede={doc.lede} />

          <ImigongoCorner
            id={`imigongo-${doc.title.toLowerCase()}-corner`}
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        <Section className="border-line border-t">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="text-label text-text-muted">Last updated</p>
                <p className="text-text mt-2 text-lg font-semibold">
                  {doc.updated}
                </p>

                <nav aria-label="On this page" className="mt-10">
                  <p className="text-label text-text-muted">On this page</p>
                  <ol className="mt-4 flex flex-col gap-2">
                    {doc.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-text-muted hover:text-text text-base underline-offset-4 transition-colors hover:underline"
                        >
                          {section.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>

            <div className="flex max-w-[68ch] flex-col gap-14 lg:col-span-8">
              {doc.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-28"
                >
                  <h2
                    id={`${section.id}-heading`}
                    className="font-display text-text text-2xl font-extrabold tracking-[-0.02em] lg:text-[1.75rem]"
                  >
                    {section.heading}
                  </h2>
                  <div className="mt-5 flex flex-col gap-5">
                    {section.blocks.map((block, index) => (
                      <Block key={index} block={block} />
                    ))}
                    {extras?.[section.id]}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Section>
      </main>

      {/* The homepage's imigongo wheel, turning down this page too. After
          `main` for the same layering reason given in src/app/page.tsx. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "p") {
    return (
      <p className="text-text-muted text-lg leading-snug">
        <Linked text={block.text} />
      </p>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="text-text-muted flex list-disc flex-col gap-2 pl-5 text-lg leading-snug">
        {block.items.map((item) => (
          <li key={item}>
            <Linked text={item} />
          </li>
        ))}
      </ul>
    );
  }

  // Scrolls sideways inside its own box on a phone rather than pushing the
  // page wider than the screen.
  return (
    <div className="border-line overflow-x-auto border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-base leading-snug">
        <thead className="bg-surface-2">
          <tr>
            {block.head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="text-label text-text-muted border-line border-b px-4 py-3"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]} className="border-line border-b last:border-b-0">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={`px-4 py-3 align-top ${index === 0 ? "text-text font-semibold" : "text-text-muted"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Phrases in the copy that become links wherever they appear. */
const LINKS: Record<string, string> = {
  [contact.email]: `mailto:${contact.email}`,
  "privacy policy": "/privacy",
  "cookie policy": "/cookies",
};

const LINK_PATTERN = new RegExp(
  `(${Object.keys(LINKS)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
);

function Linked({ text }: { text: string }) {
  // Splitting on a capturing group keeps the matches, at every odd index.
  return text.split(LINK_PATTERN).map((part, index) =>
    index % 2 ? (
      <a
        key={index}
        href={LINKS[part]}
        className="text-text font-semibold underline underline-offset-4"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}
