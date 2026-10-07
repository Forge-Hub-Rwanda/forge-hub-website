"use client";

import { useEffect, useRef, useState } from "react";
import { ImigongoRule } from "@/components/imigongo";
import { MigongoArrow } from "@/components/migongo-arrow";
import { ProjectImage } from "@/components/project-image";
import { Reveal } from "@/components/reveal";
import { Scrub } from "@/components/scrub";
import { RollLetters, RollText, SplitWords } from "@/components/split-text";
import { getLenis } from "@/lib/lenis";
import { PHONE_QUERY } from "@/lib/motion-tier";
import { setGallery } from "@/lib/wheel";
import { portfolioEnd, projectTint, type Project } from "@/lib/site";

/**
 * The work, as a row of cards the page pans across.
 *
 * The heading sits in ordinary flow and scrolls away like any other section's.
 * Only the cards are pinned: once the row reaches the screen the page holds,
 * the cards travel sideways, and then the page carries on. So what is on screen
 * during the pin is the work, and nothing else.
 *
 * ## What this is not, and why
 *
 * It was, briefly, a run of full-screen panels — one project filling the whole
 * window. Two things were wrong with that, and they turned out to be the same
 * thing. A panel the width of the screen has to travel the width of the screen
 * to hand over, so four of them cost three and a half screens of scrolling to
 * get through: the section took far more of the page's length than it gave
 * back. And a panel that fills the window leaves no edge of the next one
 * showing, so nothing on screen said there was more to come — which is why it
 * needed a line of text telling people to keep scrolling.
 *
 * Cards fix both at once. They are narrow enough that the next one is always
 * cut by the right edge, which is the whole affordance: the standard advice for
 * a gallery is to leave part of the next item visible so the reader can see
 * there is more. And because the row only overhangs the screen by a card or two
 * rather than by three whole screens, the pin costs about one screen of
 * scrolling instead of four.
 *
 * ## No instructions
 *
 * There is deliberately no "keep scrolling" caption, no counter and no progress
 * rail. The usual argument for them is that a sideways rail is a hidden
 * interaction — a reader has to work out that a region drags at all. That does
 * not apply here, because there is nothing to work out: the reader keeps
 * scrolling down exactly as they already were, and the work moves. A caption
 * explaining that would have been explaining the scroll wheel.
 *
 * ## Motion
 *
 * Every frame is a pure function of the scroll position — nothing animates on a
 * timer, so the row is exactly where the visitor's own scrolling put it, in
 * either direction, however fast they move. The travel is eased per card rather
 * than mapped straight onto distance, which is what keeps it from reading as a
 * conveyor belt; see DWELL.
 *
 * Pinning is an enhancement, never the baseline. The markup renders as an
 * ordinary stacked grid, and only switches once the component has confirmed a
 * wide viewport, no reduced-motion preference and JavaScript actually running.
 *
 * ## On a phone
 *
 * Below lg the stacked grid is the design, not a fallback, and it takes
 * lusion.co's phone gallery as its model: each card leads with a large cover,
 * which opens out of an inset, rounded frame and settles from a slight zoom as
 * it comes up the screen, and the project's name slides in beneath it. Above
 * the stack a strip of the section's eyebrow runs sideways as the page is
 * scrolled. All of it is scrubbed against the scroll by `Scrub`, so it plays
 * backwards as well as forwards and costs nothing off screen; a lite device
 * (see src/lib/motion-tier.ts) gets the same layout, still. None of it renders
 * from lg up, where the pinned row above is unchanged.
 */

/**
 * Below this, the gallery stays a stacked grid. Narrow screens keep it
 * deliberately — a pinned sideways track on a touch device fights the reader's
 * own scroll direction — and so does anyone who has asked for less motion.
 */
const PIN_QUERY = "(min-width: 64rem) and (min-height: 38rem)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Vertical scroll per pixel of sideways travel.
 *
 * 1 is the convention these sections are usually built to — the page gives up
 * exactly as much of its own length as the row overhangs by, and no more. Above
 * it the section starts costing more page than the work it is showing, which is
 * the trap the full-screen version fell into.
 */
const DRAG = 1;

/** Share of the remaining distance the row covers each frame. */
const EASE = 0.16;

/**
 * How much of each card-to-card step is eased rather than linear, from 0 (a
 * constant rate the whole way) to 1 (a complete stop on every card).
 *
 * This is the difference between motion that reads as mechanical and motion
 * that reads as considered. Mapping scroll straight onto distance gives one
 * constant velocity, so the row slides at the same rate whether a card is
 * squarely on screen or half way off it, and nothing about the movement says
 * where it is going. Easing each step makes the row slow as a card arrives,
 * hold while it is read, and then carry on.
 *
 * Short of 1 on purpose: at 1 the row stops dead and starting it again feels
 * like it is resisting the wheel.
 */
const DWELL = 0.8;

/** Ease-in-out cubic. Symmetrical, so backwards reads the same as forwards. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Two digits, so a card's number never changes width. */
const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The band's tint per card — see `projectTint` in site.ts, and
 * `.pf[data-pinned]` in globals.css: it is only ever a tint of the band behind
 * the cards, never a colour any text sits on.
 */
const tintOf = projectTint;

type PortfolioProps = {
  projects: Project[];
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional link out, rendered with the lede. */
  action?: { label: string; href: string };
  id?: string;
};

export function Portfolio({
  projects,
  eyebrow,
  title,
  lede,
  action,
  id = "portfolio",
}: PortfolioProps) {
  const [pinned, setPinned] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  /**
   * Measurements shared between the scroll loop and the focus handler. A ref
   * rather than state: these change on resize, and none of it should re-render.
   */
  const metrics = useRef({
    /** Total sideways distance, in px — how far the row overhangs the strip. */
    travel: 0,
    /** Centre-to-centre distance between neighbouring cards, in px. */
    pitch: 0,
    /** How many card-steps that travel divides into, for the dwell. */
    steps: 1,
    top: 0,
  });

  // Decide whether pinning applies at all, and keep deciding: a visitor can
  // resize across the breakpoint, or turn reduced motion on, mid-visit.
  useEffect(() => {
    const wide = window.matchMedia(PIN_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);

    const sync = () => setPinned(wide.matches && !reduced.matches);

    sync();
    wide.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const view = viewRef.current;
    const track = trackRef.current;
    if (!pinned || !section || !pin || !view || !track) return;

    let frame = 0;
    /** Where the row is drawn this frame, and where the scroll wants it. */
    let current = 0;
    let target = 0;
    /** Which card the band is tinted for, so the property is written only on
        a change of card rather than on every frame. */
    let tinted = -1;
    /** The travel last handed to the wheel. */
    let published = NaN;

    const draw = () => {
      const { travel, steps, top } = metrics.current;
      if (travel <= 0) return;

      // Geometry comes from `metrics`, measured on resize — NOT from a
      // `getBoundingClientRect()` call here. A custom property is written to
      // this element every frame, so a rect read in the same loop would force
      // the style and layout it just invalidated to be recomputed
      // synchronously, every frame, for the whole pinned range. That forced
      // reflow is what turns the travel from a glide into a stutter.
      // `scrollY` is free to read, so the loop touches nothing else.
      const travelled = window.scrollY - top;
      const progress = Math.min(Math.max(travelled / (travel * DRAG), 0), 1);

      // Eased WITHIN each card-step rather than across the whole run. Easing
      // the whole run would only make its ends slower than its middle; easing
      // each step gives every card its own arrival.
      const position = progress * steps;
      const step = Math.min(Math.floor(position), steps - 1);
      const within = position - step;
      const eased =
        (step + within + (easeInOut(within) - within) * DWELL) / steps;

      target = -eased * travel;

      // A light ease on top. Lenis has already smoothed the scroll itself; this
      // takes the last of the step out of the travel, and is deliberately stiff
      // — looser reads as the work lagging behind the wheel.
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.05) current = target;

      pin.style.setProperty("--x", `${current}px`);

      // Tell the homepage's imigongo wheel how far the cards have come, so it
      // turns by exactly that much at its rim — the gear moving the row. Only
      // on a change, so a settled row never wakes it.
      if (current !== published) {
        published = current;
        setGallery({ travel: -current });
      }

      // The colour takeover. Progress across the run picks the card nearest
      // the middle — the closing card included, as the last of them — and
      // the band's tint follows it. The transition lives in the stylesheet.
      const card = Math.min(
        Math.round(progress * projects.length),
        projects.length,
      );
      if (card !== tinted) {
        tinted = card;
        section.style.setProperty("--pf-tint", tintOf(projects[card], card));
      }
    };

    /** Whether the row is near the screen; the loop only ever runs while it is. */
    let near = false;

    // One write per frame, in step with paint, for as long as the row is still
    // easing toward where the scroll wants it. Once it has arrived the loop
    // sleeps until the next scroll or resize wakes it, so a row at rest under
    // a still page costs nothing, and its motion is exactly what it was.
    const loop = () => {
      draw();
      frame = current !== target ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (near && !frame) frame = requestAnimationFrame(loop);
    };

    const measure = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      if (cards.length < 2) return;

      // How far the row overhangs the strip it is seen through. This is the
      // whole horizontal distance, and — at DRAG 1 — the exact amount of its
      // own length the page gives up for it.
      const travel = Math.max(0, track.scrollWidth - view.clientWidth);
      const pitch = cards[1].offsetLeft - cards[0].offsetLeft;

      metrics.current = {
        travel,
        pitch,
        // How many card-widths of travel there are. The dwell settles once per
        // step, so this is what sets the rhythm — and rounding means the last
        // step lands exactly on the end of the travel rather than leaving a
        // remainder to slide through.
        steps: Math.max(1, Math.round(travel / pitch)),
        top: window.scrollY + pin.getBoundingClientRect().top,
      };

      pin.style.setProperty(
        "--pin-height",
        `${window.innerHeight + travel * DRAG}px`,
      );

      // The pinned range, for the wheel: scroll inside it turns the wheel
      // through the cards' travel instead of through the scroll itself.
      setGallery({ top: metrics.current.top, length: travel * DRAG });
      wake();
    };

    // Card widths are in vw and the strip is the viewport, so a resize changes
    // both the travel and the range's height. A ResizeObserver catches the
    // cases a resize event does not — a scrollbar appearing, or the font
    // loading and re-flowing a card. It runs once on observe, which is the
    // first measure.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(view);

    // The pinned range's position in the document moves whenever anything above
    // it changes height, which no observer on this section would report.
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", wake, { passive: true });

    // Scroll wakes the loop only while the row is near the screen. Away from
    // it the loop is stopped outright, so the rest of the page costs nothing.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) wake();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "20% 0px" },
    );
    visibility.observe(pin);

    return () => {
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", wake);
      if (frame) cancelAnimationFrame(frame);
      pin.style.removeProperty("--pin-height");
      pin.style.removeProperty("--x");
      section.style.removeProperty("--pf-tint");
      setGallery({ top: 0, length: 0, travel: 0 });
    };
  }, [pinned, projects]);

  /**
   * Tabbing through the row would otherwise focus cards the visitor cannot
   * see: the browser tries to scroll a focused card into view, but the card is
   * held where it is by a transform, so nothing moves. This turns a focus
   * inside a card into the page scroll that actually brings it into the strip —
   * through Lenis where it is running, so the jump eases like every other
   * scroll on the site.
   */
  const onFocusCapture = (event: React.FocusEvent<HTMLUListElement>) => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pinned || !pin || !track) return;

    const card = (event.target as HTMLElement).closest("li");
    if (!card || card.parentElement !== track) return;

    const { travel, pitch } = metrics.current;
    if (travel <= 0) return;

    const index = Array.from(track.children).indexOf(card);
    if (index < 0) return;

    // Far enough to bring this card to the left edge, but never past the end of
    // the travel — the last cards share the final position.
    const x = Math.min(index * pitch, travel) * DRAG;
    const top = window.scrollY + pin.getBoundingClientRect().top + x;

    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top });
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      data-pinned={pinned}
      className="pf bg-surface-2 relative"
    >
      {/* Ordinary flow, so it scrolls away before the pin begins. The reader
          meets the heading once, on the way in, and then the screen belongs to
          the work — rather than the title holding a place on screen for the
          whole time the cards are moving. */}
      <div className="wheel-over px-6 pt-24 pb-14 lg:px-[3.6vw] lg:pt-36 lg:pb-20">
        <Reveal>
          <p className="text-label text-text-muted flex items-center gap-4">
            <ImigongoRule />
            {eyebrow}
          </p>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <Reveal delay={80} className="lg:col-span-7">
            <h2 className="font-display text-heading text-text text-[clamp(2rem,4.6vw,4rem)]">
              <SplitWords text={title} />
            </h2>
          </Reveal>

          <div className="lg:col-span-5">
            {lede ? (
              <Reveal delay={160}>
                <p className="text-text-muted text-lg leading-snug">{lede}</p>
              </Reveal>
            ) : null}

            {action ? (
              <Reveal delay={220}>
                <a
                  href={action.href}
                  className="group text-text mt-6 inline-flex items-center gap-3 font-bold"
                >
                  {action.label}
                  <span className="bg-text text-text-invert flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
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
                </a>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>

      {/* Phones: the section's eyebrow, repeated along a strip that runs
          sideways as the page scrolls down past it — lusion.co's "play reel"
          ribbon. Decorative; the eyebrow itself is read above. */}
      <Scrub
        span="full"
        from={1}
        to={0}
        query={PHONE_QUERY}
        liteQuery="not all"
        className="work-strip overflow-hidden pb-10 lg:hidden"
      >
        <p
          aria-hidden
          className="work-strip-track text-label text-text flex w-max gap-10 whitespace-nowrap"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className="flex items-center gap-3">
              <MigongoArrow className="text-accent" />
              {eyebrow}
            </span>
          ))}
        </p>
      </Scrub>

      {/* The pinned range. Its height is the one screen the stage holds plus
          the distance the row has to travel — written by the component, because
          only it can measure how far that is. */}
      {/* `wheel-over`: the cards pass in front of the homepage's imigongo
          wheel, which turns behind them as if it were moving them. */}
      <div ref={pinRef} className="pf-pin wheel-over">
        <div className="pf-stage">
          {/* The strip the row is seen through. The clip that makes it a strip
              lives in the pinned rules rather than here, for two reasons: the
              stage is the sticky element and a sticky element inside a clipped
              ancestor stops sticking, and a clip in the stacked layout would
              nip the bottom off the last row of cards as they rise into view. */}
          <div ref={viewRef} className="pf-viewport">
            <ul
              ref={trackRef}
              onFocusCapture={onFocusCapture}
              className="pf-track grid gap-px px-6 pb-24 md:grid-cols-2 lg:px-[3.6vw] lg:pb-36"
            >
              {projects.map((project, index) => (
                <Reveal
                  key={project.slug}
                  as="li"
                  // Stacked, the cards arrive together and want staggering.
                  // Pinned, each one arrives in its own moment as it travels
                  // in, and a delay on top of that reads as lag.
                  delay={pinned ? 0 : index * 70}
                  className="pf-card flex"
                >
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}

              <Reveal
                as="li"
                delay={pinned ? 0 : projects.length * 70}
                className="pf-card flex"
              >
                <ClosingCard />
              </Reveal>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One project.
 *
 * An `<article>` throughout rather than a card-wide link: the detail is there
 * to be read and selected, and a link is added at the foot only where there is
 * genuinely something to link to.
 */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    // `roll-host`: the title's letters ripple when the card is hovered, even
    // though the card itself is not a link.
    <article
      id={project.slug}
      className="roll-host bg-surface flex h-full w-full scroll-mt-24 flex-col p-8 lg:p-10"
    >
      {/* The cover leads, as in lusion.co's gallery. On a phone it opens out
          of an inset frame as it scrolls up; from lg it simply heads the card.

          A landscape strip rather than a tall frame: the work is websites and
          apps, and a screenshot of one needs width, not height. From lg its
          height is set outright — which overrides the ratio — so the card's
          copy still fits a short laptop's pinned row. */}
      <Scrub
        from={1}
        to={0.45}
        query={PHONE_QUERY}
        liteQuery="not all"
        className="-mx-8 -mt-8 mb-8 lg:-mx-10 lg:-mt-10 lg:mb-7"
      >
        <div className="cover-unmask overflow-hidden rounded-xl lg:rounded-none">
          <ProjectImage
            image={project.cover}
            ratio="16 / 10"
            className="lg:h-[clamp(6.5rem,21vh,12rem)]"
            sizes="(min-width: 64rem) 30rem, (min-width: 48rem) 50vw, 100vw"
            artId={`art-home-${project.slug}`}
            tint={projectTint(project, index)}
            variant={index}
          />
        </div>
      </Scrub>

      <div className="text-label text-text-muted flex items-center gap-4">
        <span className="font-display tabular-nums">{pad(index + 1)}</span>
        <span className="bg-line h-px w-8" aria-hidden />
        <span>{project.status}</span>
      </div>

      {/* Below lg the name carries lusion.co's arrow and slides in after its
          cover; from lg it is exactly as it was. */}
      <Scrub from={1} to={0.6} query={PHONE_QUERY} liteQuery="not all">
        <h3 className="title-slide font-display text-text mt-8 flex items-baseline gap-3 text-[clamp(1.5rem,2.2vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.03em] lg:mt-5 lg:block">
          <MigongoArrow className="text-accent self-center lg:hidden" />
          <RollLetters text={project.name} />
        </h3>
      </Scrub>

      <p className="text-text mt-4 text-lg leading-snug font-semibold">
        {project.blurb}
      </p>

      {project.detail ? (
        <p className="text-text-muted mt-4 leading-relaxed">{project.detail}</p>
      ) : null}

      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          className="text-text mt-5 inline-flex w-fit items-center gap-2 font-bold underline-offset-4 hover:underline"
        >
          Visit the site
          <MigongoArrow className="-rotate-45" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : null}

      {/* `mt-auto` pins the tags and the credit to the foot of the card, so the
          row lines up along the bottom however much copy each one carries. */}
      <ul className="mt-auto flex flex-wrap gap-2 pt-8">
        {project.disciplines.map((discipline) => (
          <li
            key={discipline}
            className="border-line text-label text-text-muted border px-3 py-1.5"
          >
            {discipline}
          </li>
        ))}
      </ul>

      <p className="text-label text-text-muted border-line mt-6 flex items-baseline justify-between gap-4 border-t pt-5">
        <span>{project.client}</span>
        <span>{project.year}</span>
      </p>
    </article>
  );
}

/** The invitation the row ends on. Inverted, so the run resolves. */
function ClosingCard() {
  return (
    <div className="bg-text text-text-invert flex h-full w-full flex-col p-8 lg:p-10">
      <p className="text-label text-text-invert/60">{portfolioEnd.eyebrow}</p>

      <h3 className="font-display mt-8 text-[clamp(1.5rem,2.2vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.03em]">
        {portfolioEnd.title}
      </h3>

      <p className="text-text-invert/75 mt-4 leading-relaxed">
        {portfolioEnd.body}
      </p>

      <a href={portfolioEnd.cta.href} className="btn-invert mt-auto w-fit">
        <RollText>{portfolioEnd.cta.label}</RollText>
      </a>
    </div>
  );
}
