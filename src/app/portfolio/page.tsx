import type { Metadata } from "next";
import Link from "next/link";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner } from "@/components/imigongo";
import { ImigongoWheel } from "@/components/imigongo-wheel";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { ProjectImage } from "@/components/project-image";
import { Reveal } from "@/components/reveal";
import { Scrub } from "@/components/scrub";
import { Section } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RollLetters } from "@/components/split-text";
import { getProjects } from "@/lib/content";
import { PHONE_QUERY } from "@/lib/motion-tier";
import { portfolioPage, projectTint } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio | ForgeHub Rwanda",
  description: portfolioPage.lede,
};

// CMS-backed and cached; admin edits expire the cache, so new items appear on
// the next load. See `src/lib/content.ts`.

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The index of the work — deliberately NOT the homepage's gallery.
 *
 * The homepage band is a showpiece: it takes the screen, pans one project at a
 * time and is there to make someone stop. This page is the opposite job. Anyone
 * who reaches it has already decided they want to see the work, so it owes them
 * a list they can read in one pass and a way into whichever entry they want —
 * not another sequence that has to be scrolled through in order.
 *
 * So it is brief, and the depth lives one click away on each project's own
 * page. Rows rather than cards for the same reason the services page uses them:
 * a row can be scanned down a column of names, where a grid of cards has to be
 * read cell by cell.
 */
export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] aspect-[3/5] h-auto w-[min(38.4vh,40vw)] lg:left-[11vw]" />
          <PageHeroLine title={portfolioPage.title} />
          <SiteHeader />
          <PageIntro
            eyebrow={portfolioPage.eyebrow}
            lede={portfolioPage.lede}
          />

          <ImigongoCorner
            id="imigongo-portfolio-corner"
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        <Section id="work" className="border-line border-t">
          <ul className="border-line border-t">
            {projects.map((project, index) => (
              <Reveal
                key={project.slug}
                as="li"
                delay={index * 70}
                className="border-line border-b"
              >
                {/* The whole row is the link. A row carries a number, a name, a
                    line of summary and a year — four things that all mean "open
                    this project", so making any one of them the only target
                    would be arbitrary and would leave the rest dead to a
                    pointer. */}
                {/* The fill sweeps up the row behind imigongo teeth, the
                    name ripples letter by letter, and the pointer is marked
                    "View" — three cues, one gesture. */}
                <Link
                  href={`/portfolio/${project.slug}`}
                  data-cursor="View"
                  className="group fill-rise grid items-center gap-6 px-2 py-8 lg:grid-cols-12 lg:gap-8 lg:px-6 lg:py-10"
                >
                  <p className="font-display text-label text-text-muted group-hover:text-text-invert/70 transition-colors lg:col-span-1">
                    {pad(index + 1)}
                  </p>

                  {/* A small still, so the list is not a wall of type. It is
                      the same component the project's own page uses, so an
                      image landing there shows up here too. */}
                  {/* Phones: a short rounded strip that opens out of an inset
                      frame as it scrolls up, as the homepage's gallery does. */}
                  <Scrub
                    from={1}
                    to={0.45}
                    query={PHONE_QUERY}
                    liteQuery="not all"
                    className="lg:col-span-2"
                  >
                    <div className="cover-unmask overflow-hidden rounded-xl lg:rounded-none">
                      <ProjectImage
                        image={project.cover}
                        ratio="16 / 10"
                        lgRatio="4 / 3"
                        sizes="(min-width: 64rem) 16vw, 100vw"
                        artId={`art-${project.slug}`}
                        tint={projectTint(project, index)}
                        variant={index}
                      />
                    </div>
                  </Scrub>

                  <div className="lg:col-span-5">
                    <h2 className="font-display text-text group-hover:text-text-invert text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold tracking-[-0.03em] transition-colors">
                      <RollLetters text={project.name} />
                    </h2>
                    <p className="text-text-muted group-hover:text-text-invert/70 mt-2 leading-snug transition-colors">
                      {project.blurb}
                    </p>
                  </div>

                  <ul className="flex flex-wrap gap-2 lg:col-span-3">
                    {project.disciplines.map((discipline) => (
                      <li
                        key={discipline}
                        className="border-line text-label text-text-muted group-hover:border-text-invert/30 group-hover:text-text-invert/70 border px-3 py-1.5 transition-colors"
                      >
                        {discipline}
                      </li>
                    ))}
                  </ul>

                  <p className="text-label text-text-muted group-hover:text-text-invert/70 transition-colors lg:col-span-1 lg:text-right">
                    {project.year}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Section>

        <ClosingCta wheel />
      </main>

      {/* The homepage's imigongo wheel, turning down this page too. After
          `main` for the same layering reason given in src/app/page.tsx. */}
      <ImigongoWheel />

      <SiteFooter />
    </>
  );
}
