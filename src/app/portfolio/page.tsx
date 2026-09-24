import type { Metadata } from "next";
import Link from "next/link";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner } from "@/components/imigongo";
import { PageHeroLine, PageIntro } from "@/components/page-hero";
import { ProjectImage } from "@/components/project-image";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { portfolioPage, projects } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio — ForgeHub Rwanda",
  description: portfolioPage.lede,
};

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
export default function PortfolioPage() {
  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
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
            className="right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
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
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group hover:bg-text grid items-center gap-6 px-2 py-8 transition-colors duration-300 lg:grid-cols-12 lg:gap-8 lg:px-6 lg:py-10"
                >
                  <p className="font-display text-label text-text-muted group-hover:text-text-invert/70 transition-colors lg:col-span-1">
                    {pad(index + 1)}
                  </p>

                  {/* A small still, so the list is not a wall of type. It is
                      the same component the project's own page uses, so an
                      image landing there shows up here too. */}
                  <div className="lg:col-span-2">
                    <ProjectImage
                      image={project.cover}
                      ratio="4 / 3"
                      sizes="(min-width: 64rem) 16vw, 100vw"
                    />
                  </div>

                  <div className="lg:col-span-5">
                    <h2 className="font-display text-text group-hover:text-text-invert text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold tracking-[-0.03em] transition-colors">
                      {project.name}
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

        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  );
}
