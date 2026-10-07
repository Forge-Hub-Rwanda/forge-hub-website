"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  ImigongoBand,
  ImigongoMark,
  ImigongoWatermark,
} from "@/components/imigongo";
import { Odometer } from "@/components/odometer";
import { RollLetters } from "@/components/split-text";
import { teamPage, type TeamMember } from "@/lib/site";

/** Three digits, as lusion.co numbers its people. */
const pad3 = (value: number) => String(value).padStart(3, "0");

/**
 * The founding team, as an offset row of portraits.
 *
 * Three things are happening, and they are deliberately separate mechanisms so
 * that any one of them failing leaves the other two intact:
 *
 *   1. THE WIPE. Each portrait starts under a block of the page's own surface
 *      colour with a sawtooth lower edge. An observer marks the card shown as
 *      it comes up the screen and the block slides off the top of the frame,
 *      staggered along the row. This is a CSS transition on a `data-` attribute
 *      — the same contract `Reveal` uses — so the styling lives in globals.css
 *      and this file only decides WHEN.
 *
 *   2. THE PARALLAX. While the row is on screen, each picture drifts inside
 *      its own frame at a slightly different rate, and the pattern panel behind
 *      the row drifts against all of them. One scroll handler writes custom
 *      properties; nothing here reads layout except the section's own rect,
 *      once per frame.
 *
 *   3. THE NAME. Always on the picture below the hover breakpoint, rising out
 *      of the bottom edge on hover or focus above it. Entirely CSS — there is
 *      no hover state in this component, because a hover state in JavaScript is
 *      one that a keyboard cannot reach.
 *
 * WHY THE ROW IS OFFSET rather than aligned: four equal portraits on one
 * baseline read as a directory, which is what the previous version of this page
 * looked like. Staggering them turns the row into a composition and — because
 * the cards no longer enter the viewport at the same moment — gives the wipe
 * its rhythm for free, independent of the stagger delay below.
 */

/**
 * Per-card vertical offset and parallax depth.
 *
 * The offsets are Tailwind classes written out in full rather than composed,
 * because the scanner reads source text and would not find a class built from
 * a template string. They only apply from `lg` up; below that the row stacks
 * and an offset would just be uneven gaps.
 *
 * `depth` is a multiplier on the ±6% the handler writes. Keeping the two in
 * step matters: the card sitting lowest in the row travels least, so the row
 * settles rather than shears as it crosses the screen.
 */
const CARDS = [
  { offset: "lg:mt-0", depth: 1 },
  { offset: "lg:mt-24", depth: 0.55 },
  { offset: "lg:mt-10", depth: 0.85 },
  { offset: "lg:mt-32", depth: 0.4 },
] as const;

/** How far, in percent of its own height, a picture may travel in its frame. */
const PARALLAX_RANGE = 6;

/** The same, for the pattern panel — slower, so it reads as further away. */
const DRIFT_RANGE = 4;

export function TeamShowcase({ members }: { members: TeamMember[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-tm-card]"),
    );

    /* ---- 1. The wipe ---------------------------------------------------- */

    // No observer support means no reveal trigger, so the blocks would sit on
    // the portraits permanently. Show everything outright instead — the same
    // fallback `Reveal` makes, and for the same reason.
    if (typeof IntersectionObserver === "undefined") {
      for (const card of cards) card.dataset.shown = "true";
      return;
    }

    const wipe = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "true";
          wipe.unobserve(entry.target);
        }
      },
      // A tenth of the card, and a margin that pulls the trigger line up off
      // the bottom edge of the window: the block should already be leaving by
      // the time the card is properly in view, not start moving once it has
      // been sitting there.
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" },
    );

    for (const card of cards) wipe.observe(card);

    /* ---- 2. The parallax ------------------------------------------------ */

    // Asked not to animate: the wipe still runs (the stylesheet has already
    // parked it off-frame, and the observer above only sets an attribute), but
    // nothing scroll-driven is attached at all. This is the cheap path as well
    // as the considerate one.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) return () => wipe.disconnect();

    const backdrop =
      section.querySelector<HTMLElement>("[data-tm-backdrop]") ?? null;

    let frame = 0;
    let visible = false;

    const paint = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;

      // 0 as the section's top edge reaches the bottom of the window, 1 as its
      // bottom edge leaves the top. Re-centred to −1…1, so the middle of the
      // pass is the resting position and a card is never at an extreme while
      // it is the thing being looked at.
      const travelled = viewport - rect.top;
      const span = viewport + rect.height;
      const position = Math.min(Math.max(travelled / span, 0), 1) * 2 - 1;

      for (const card of cards) {
        const depth = Number(card.dataset.depth ?? 1);
        card.style.setProperty(
          "--parallax",
          `${(-position * PARALLAX_RANGE * depth).toFixed(2)}%`,
        );
      }

      backdrop?.style.setProperty(
        "--drift",
        `${(position * DRIFT_RANGE).toFixed(2)}%`,
      );
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(paint);
    };

    // The handler is attached for the life of the component but does nothing
    // while the row is off screen, which is most of the page. Gating on the
    // flag rather than adding and removing the listener keeps the two states
    // from racing on a fast scroll past the section.
    const watch = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { threshold: 0 },
    );

    watch.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    paint();

    return () => {
      wipe.disconnect();
      watch.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {/* Decorative and marked so inside the component itself. Sits behind
          everything, drifts with the scroll, and is clipped by the section's
          own overflow rather than by a wrapper of its own. */}
      <div data-tm-backdrop className="tm-backdrop">
        <ImigongoWatermark
          id="imigongo-team-field"
          motif="herringbone"
          opacity={0.05}
          scale={1.4}
          angle={12}
        />
      </div>

      <ul className="relative z-1 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
        {members.map((member, index) => {
          const { offset, depth } = CARDS[index % CARDS.length];

          return (
            <li key={member.name} className={offset}>
              {/* `tabindex` rather than a link: there is nowhere for a portrait
                  to go yet, but the name has to be reachable without a mouse.
                  The card is a group of its own so the heading order on the
                  page stays flat. */}
              <article
                data-tm-card
                data-depth={depth}
                data-cursor="Hello"
                tabIndex={0}
                className="tm-card roll-host"
                style={{ "--delay": `${index * 130}ms` } as React.CSSProperties}
              >
                <div className="tm-frame">
                  {/* lusion.co's `[[ 001 ]]` team index, rolling to its number
                      once the card is on screen. Over the frame's top-left
                      corner, so it takes no room of its own. */}
                  <p className="tm-tag text-label" aria-hidden>
                    <Odometer value={`[[ ${pad3(index + 1)} ]]`} />
                  </p>

                  <div className="tm-media">
                    {member.photo ? (
                      <Image
                        src={member.photo.src}
                        alt={member.photo.alt}
                        fill
                        sizes="(min-width: 64rem) 24vw, (min-width: 40rem) 46vw, 92vw"
                        className="object-cover"
                      />
                    ) : (
                      /* No portrait yet. A `div`, never an `img` with invented
                         alt text — the same rule `ProjectImage` follows: a
                         screen reader is told a picture is pending in the words
                         a sighted visitor reads, not handed a description of a
                         photograph that does not exist. */
                      <div className="bg-surface-2 relative flex items-end">
                        <ImigongoMark
                          motif="lozenge"
                          className="text-text absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
                        />
                        <p className="text-label text-text-muted relative p-6">
                          {teamPage.photoPending}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="tm-scrim" aria-hidden />

                  <div className="tm-meta">
                    <h3 className="font-display text-2xl leading-[1.1] font-extrabold tracking-[-0.02em]">
                      <RollLetters text={member.name} />
                    </h3>
                    <p className="text-label mt-3 border-t border-white/25 pt-3 text-white/70">
                      {member.role}
                    </p>
                  </div>

                  {/* The block that uncovers the portrait. `aria-hidden`
                      because it is a piece of choreography, not content, and
                      it is the last child so it paints over the meta panel
                      while it is still on the frame. */}
                  <div className="tm-wipe" aria-hidden>
                    <div className="tm-wipe-body" />
                    <ImigongoBand
                      id={`imigongo-team-teeth-${index}`}
                      flip
                      opacity={1}
                    />
                    <ImigongoBand
                      id={`imigongo-team-edge-${index}`}
                      flip
                      opacity={0.9}
                      className="tm-wipe-edge absolute inset-x-0 bottom-[-0.3rem]"
                    />
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
