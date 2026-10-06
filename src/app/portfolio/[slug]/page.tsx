import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blob } from "@/components/blob";
import { ClosingCta } from "@/components/closing-cta";
import { ImigongoCorner, ImigongoRule } from "@/components/imigongo";
import { ProjectImage } from "@/components/project-image";
import { Reveal } from "@/components/reveal";
import { Scrub } from "@/components/scrub";
import { Section } from "@/components/section-heading";
import { RollLetters, SplitWords } from "@/components/split-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProject, getProjects } from "@/lib/content";
import { projectPage } from "@/lib/site";

/**
 * One project, in full.
 *
 * CMS-backed: the project is read by slug at request time, so a project added
 * or edited in /admin shows here on the next load. Rendered dynamically rather
 * than prerendered, since the set of slugs is no longer known at build time.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/portfolio/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: `${project.name} — ForgeHub Rwanda`,
    description: project.blurb,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/portfolio/[slug]">,
) {
  // `params` is a promise in this version of Next — see
  // node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
  const { slug } = await props.params;
  const [project, projects] = await Promise.all([
    getProject(slug),
    getProjects(),
  ]);

  // A slug that is not a project is a 404, not an empty page. Reachable by a
  // stale link once a project is renamed or removed.
  if (!project) notFound();

  const index = projects.findIndex((entry) => entry.slug === project.slug);
  // Wraps, so the end of the work leads back to the start rather than to a
  // dead stop. With one project it points at itself, which is why it is only
  // rendered when there is more than one. A guard on `index` keeps the wrap
  // safe even if the list and the single fetch ever disagree.
  const next = projects[(Math.max(index, 0) + 1) % projects.length];

  return (
    <>
      {/* `main` opens before the hero so the page's `h1` sits inside the main
          landmark, which is also where the root layout's skip link lands. */}
      <main>
        {/* The page hero, hand-rolled rather than `PageHeroLine`: that component
          sets its title in one nowrap line at 9.1vw, which is right for a
          one-word page name like "Portfolio" and would run off the screen for
          a project called "forgehubrwanda.com". This one wraps. */}
        <div className="relative">
          <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />

          <div className="relative z-20 px-6 pt-24 sm:pt-28 lg:px-[3.6vw] lg:pt-32">
            <p
              className="rise text-label text-text-muted flex items-center gap-4"
              style={{ "--delay": "80ms" } as React.CSSProperties}
            >
              <ImigongoRule />
              {project.status}
            </p>

            <h1
              // A project name can be a single unbreakable word — a domain, a
              // product name — and at the bottom of this clamp one of those is
              // wider than a phone. Breaking inside it is better than letting it
              // run off the side, where `body { overflow-x: clip }` would silently
              // cut the end off rather than scroll to it.
              className="font-display text-heading text-text mt-8 max-w-[18ch] text-[clamp(2.5rem,7.5vw,6.5rem)] [overflow-wrap:anywhere]"
              style={{ "--delay": "160ms" } as React.CSSProperties}
            >
              <SplitWords text={project.name} mode="load" />
            </h1>
          </div>

          <SiteHeader />

          {/* Carries `id="hero-intro"` and `tabIndex={-1}` so the root layout's
            skip link lands here, exactly as it does on every other page. */}
          <div
            id="hero-intro"
            tabIndex={-1}
            className="relative z-20 px-6 pt-10 pb-20 lg:px-[3.6vw] lg:pt-16 lg:pb-28"
          >
            <p
              className="rise text-text max-w-[46ch] text-lg leading-snug sm:text-xl lg:text-[1.4rem]"
              style={{ "--delay": "280ms" } as React.CSSProperties}
            >
              {project.blurb}
            </p>

            <dl
              className="rise text-label border-line mt-12 grid gap-6 border-t pt-6 sm:grid-cols-3 lg:max-w-[64rem]"
              style={{ "--delay": "380ms" } as React.CSSProperties}
            >
              <div>
                <dt className="text-text-muted">Client</dt>
                <dd className="text-text mt-2">{project.client}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Year</dt>
                <dd className="text-text mt-2">{project.year}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Disciplines</dt>
                <dd className="text-text mt-2">
                  {project.disciplines.join(", ")}
                </dd>
              </div>
            </dl>
          </div>

          <ImigongoCorner
            id={`imigongo-${project.slug}`}
            motif="lozenge"
            opacity={0.13}
            className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
          />
        </div>

        {/* The one image on the page that is worth loading eagerly.

            It grows out of an inset card to its full width as it comes up the
            screen — lusion.co's showreel expanding from its thumbnail. The
            scale is on the inner wrapper, so the section's own box, and
            everything below it, never moves. */}
        <Section className="border-line border-t">
          <Reveal>
            <Scrub query="(min-width: 48rem)" from={1} to={0.35}>
              <div className="reel-grow">
                <ProjectImage image={project.cover} ratio="16 / 9" priority />
              </div>
            </Scrub>
          </Reveal>

          {project.href ? (
            <Reveal delay={80}>
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="text-text mt-8 inline-flex items-center gap-2 text-lg font-bold underline-offset-4 hover:underline"
              >
                Visit the site
                <span aria-hidden>↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Reveal>
          ) : null}
        </Section>

        {project.story?.length ? (
          <Section className="border-line border-t">
            <Reveal>
              <p className="text-label text-text-muted flex items-center gap-4">
                <ImigongoRule />
                {projectPage.storyEyebrow}
              </p>
            </Reveal>

            {/* Two columns at width, so the heading of each part sits beside
                its own paragraph rather than above a line of text running the
                full width of the page. */}
            <div className="mt-14 lg:mt-20">
              {project.story.map((part, partIndex) => (
                <Reveal
                  key={part.heading}
                  delay={partIndex * 70}
                  className="border-line border-t"
                >
                  <div className="grid gap-4 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                    <h2 className="font-display text-text text-[clamp(1.4rem,2.2vw,2rem)] font-extrabold tracking-[-0.03em] lg:col-span-5">
                      {part.heading}
                    </h2>
                    <p className="text-text-muted max-w-[62ch] text-lg leading-relaxed lg:col-span-7">
                      {part.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        ) : null}

        {project.gallery?.length ? (
          <Section className="border-line border-t">
            <Reveal>
              <p className="text-label text-text-muted flex items-center gap-4">
                <ImigongoRule />
                {projectPage.galleryEyebrow}
              </p>
            </Reveal>

            <ul className="mt-14 grid gap-px md:grid-cols-2 lg:mt-20">
              {project.gallery.map((picture, pictureIndex) => (
                <Reveal
                  as="li"
                  key={picture.src}
                  delay={pictureIndex * 70}
                  className="flex"
                >
                  <ProjectImage
                    image={picture}
                    ratio="4 / 3"
                    sizes="(min-width: 48rem) 50vw, 100vw"
                  />
                </Reveal>
              ))}
            </ul>
          </Section>
        ) : null}

        {projects.length > 1 ? (
          <Section className="border-line border-t">
            <Reveal>
              <p className="text-label text-text-muted flex items-center gap-4">
                <ImigongoRule />
                {projectPage.nextEyebrow}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <Link
                href={`/portfolio/${next.slug}`}
                className="group text-text mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3"
              >
                {/* Ripples letter by letter on hover rather than underlining:
                    at this size an underline cut through the descenders. */}
                <span className="font-display text-[clamp(2rem,5vw,4rem)] leading-none font-extrabold tracking-[-0.035em]">
                  <RollLetters text={next.name} />
                </span>
                <span className="bg-text text-text-invert flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      d="M4 12h15m0 0-6-6m6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </Reveal>

            <Reveal delay={160}>
              <Link
                href="/portfolio"
                className="text-label text-text-muted hover:text-text mt-12 inline-block transition-colors"
              >
                ← {projectPage.backLabel}
              </Link>
            </Reveal>
          </Section>
        ) : null}

        <ClosingCta />
      </main>

      <SiteFooter />
    </>
  );
}
