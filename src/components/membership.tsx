"use client";

import { useEffect, useRef, useState } from "react";
import { ImigongoMark, ImigongoRule } from "@/components/imigongo";
import { LionArt, LionEye } from "@/components/lion-art";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section-heading";
import { RollText, SplitWords } from "@/components/split-text";
import { getLenis } from "@/lib/lenis";
import { getMotionTier } from "@/lib/motion-tier";
import { isFinePointer } from "@/lib/pointer";
import { membershipSection, plans } from "@/lib/site";

/**
 * Three ways in, read against a standing index.
 *
 * The left column carries the section's heading and an index of the three
 * ways in, and stays where it is while the right column's panels scroll
 * past. The entry for whichever panel is crossing the middle of the window goes
 * solid and takes the rule with it, so the column answers "which one am I
 * reading" without a counter, a progress bar or a word of instruction.
 *
 * Behind the column an imigongo lion, in side profile, comes out of the
 * left edge of the window — the counterpart to the homepage wheel on the right, in
 * the same ink at the same strength. It is sticky with the index, so the two
 * hold still together while the panels pass; see `.mb-lion` in globals.css.
 * Its foot is held to the foot of the window, so the mane runs down and fades
 * out there, as in the photograph, instead of stopping halfway down the page.
 *
 * Moving a mouse across it lights the lion's dark imigongo in oxblood, in a
 * soft pool round the pointer: a second copy of the drawing, holding only its
 * solid shapes, sits exactly over the first and is shown through a radial
 * mask centred on the pointer. See the effect below. And while the page is
 * scrolling, its eye lights up in oxblood, going dark again a moment after the
 * scrolling stops.
 *
 * It costs the page no extra scrolling, and that is the point rather than an
 * accident. There is no pinned range, no transform driven by scroll position
 * and nothing listening to the wheel: `position: sticky` adds no height of its
 * own, so the band is exactly as tall as its own panels and the page moves at
 * its normal rate throughout. The pinned gallery two sections up already trades
 * a screen of scrolling for a screen of gallery; a second section doing the
 * same would read as the page taking the scroll away rather than using it.
 *
 * The highlight is an enhancement and nothing depends on it. What renders on
 * the server is a complete heading, a working jump list and three complete
 * panels; this component then sets ONE attribute once it has confirmed a window
 * that can hold the column, no reduced-motion preference and an
 * IntersectionObserver to track with — and every rule that dims or highlights
 * anything is scoped to that attribute in globals.css. A narrow screen, a short
 * window, a reduced-motion visitor and a browser that never ran this file all
 * land in the same fallback of three equally solid links, and none of them
 * needed one written for them.
 *
 * ## On a phone: a deck of three cards
 *
 * Below lg the index and the lion step aside, and the three panels become a
 * deck: each one sticks just under the header as it arrives, a little lower
 * than the one before, and the next slides up over it. The card being covered
 * sinks back - a touch smaller, a touch darker - as the next one rises, so
 * the stack reads as depth, after lusion.co's stacked project cards.
 *
 * It costs no extra scrolling, for the reason given above: `position: sticky`
 * adds no height, so the page moves at its normal rate and nothing is pinned
 * or taken over. The stacking itself is plain CSS. Only the sinking is script
 * - one custom property per covered card, written in a rAF while the band is
 * in view - and it sits behind `data-deck`, which is set only on a
 * full-motion device. A lite phone, reduced motion and a browser without
 * scripting get the same stack, standing still.
 */

/**
 * Below this the index is a plain list rather than a standing one. The width is
 * Tailwind's `lg`, where two columns exist at all. The height is there because
 * a sticky element taller than the space beneath the header pins its top and
 * hides its foot — and its foot is the index. 38rem is measured, not guessed:
 * the column runs to roughly 435px once its rhythm has closed up (see the
 * `vh`-based spacing in globals.css), against 528px of room at that height.
 *
 * Deliberately lower than the pinned gallery's 45rem. That band constrains its
 * cards' height and clips them when it runs out of room; nothing here is
 * height-constrained, so the only question is whether the column fits — and a
 * real 1366x768 laptop has about 640px of viewport once browser chrome is
 * taken off, which a 45rem gate would have excluded for no reason.
 */
const TRACK_QUERY = "(min-width: 64rem) and (min-height: 38rem)";

/** Where the panels stack as a deck. The same breakpoint as the CSS. */
const DECK_QUERY = "(max-width: 63.99rem)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The reading line: a band across the middle of the window, 10% of its height.
 * A panel is "the one being read" while it crosses this band, which is a far
 * steadier test than "most visible" — it changes hands once, at one boundary,
 * and at the same boundary going up as going down.
 */
const READING_LINE = "-45% 0px -45% 0px";

/** Render order, so a tie can be settled by document position. */
const ORDER = plans.map((plan) => plan.slug);

/** Share of the remaining distance the oxblood pool covers each frame. */
const LION_EASE = 0.18;

/** How far outside the drawing the pointer can be and still light its edge. */
const LION_REACH = 60;

/** How long after the last scroll the lion's eye stays lit, in ms. */
const EYE_HOLD = 280;

/** Two digits, so the index never changes width as it counts. */
const pad = (value: number) => String(value).padStart(2, "0");

export function Membership() {
  const [tracked, setTracked] = useState(false);
  /** Whether the deck's sinking runs. See "On a phone" above. */
  const [deck, setDeck] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);
  /**
   * The first way in stands until the second takes over — including before any
   * observer has reported, which is the state a visitor arrives to.
   */
  const [active, setActive] = useState(ORDER[0]);
  const rootRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);

  // Light the lion's dark imigongo in oxblood round the pointer. Listened for
  // on the whole band rather than the drawing, which takes no pointer events
  // so the links over it keep working. The pool is eased after the pointer in
  // a rAF loop that stops itself once it has caught up, the same way the
  // cursor label is, so a still mouse costs nothing — and under reduced motion
  // it simply sits where the pointer is.
  useEffect(() => {
    const lion = lionRef.current;
    const band = lion?.closest("section");
    if (!lion || !band) return;

    const reduced = window.matchMedia(REDUCED_QUERY);
    const target = { x: 0, y: 0 };
    const at = { x: 0, y: 0 };
    let frame = 0;
    let placed = false;

    const paint = () => {
      frame = 0;
      const ease = reduced.matches ? 1 : LION_EASE;
      at.x += (target.x - at.x) * ease;
      at.y += (target.y - at.y) * ease;
      lion.style.setProperty("--mx", `${at.x.toFixed(1)}px`);
      lion.style.setProperty("--my", `${at.y.toFixed(1)}px`);
      if (Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > 0.5) {
        frame = requestAnimationFrame(paint);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      const box = lion.getBoundingClientRect();
      // Hidden below the breakpoint: nothing to light.
      if (box.width === 0) return;
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      const near =
        target.x > -LION_REACH &&
        target.y > -LION_REACH &&
        target.x < box.width + LION_REACH &&
        target.y < box.height + LION_REACH;
      lion.dataset.lit = String(near);
      // The first time in, start the pool under the pointer rather than
      // sweeping it in from a corner.
      if (!placed) {
        at.x = target.x;
        at.y = target.y;
        placed = true;
      }
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      lion.dataset.lit = "false";
      placed = false;
    };

    // The eye: lit on any scroll, and dimmed once the scrolling has been
    // still for EYE_HOLD. Setting an attribute that already holds the value
    // is a no-op, so doing it on every scroll event costs nothing.
    //
    // Only while the band is near the window: the eye cannot be seen from
    // anywhere else, so a scroll elsewhere on the page leaves it alone. The
    // margin wakes it before the band arrives, so it lights exactly as before.
    let dim = 0;
    let near = typeof IntersectionObserver === "undefined";
    const watch = near
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            near = entry.isIntersecting;
          },
          { rootMargin: "20% 0px" },
        );
    watch?.observe(band);

    const onScroll = () => {
      if (!near) return;
      lion.dataset.scrolling = "true";
      window.clearTimeout(dim);
      dim = window.setTimeout(() => {
        lion.dataset.scrolling = "false";
      }, EYE_HOLD);
    };

    band.addEventListener("pointermove", onMove, { passive: true });
    band.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      watch?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(dim);
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Decide whether the index tracks at all, and keep deciding: a visitor can
  // resize across either breakpoint, or turn reduced motion on, mid-visit.
  useEffect(() => {
    // No observer, no tracking — and so no dimming either. A third route into
    // the same fallback, which cost nothing to arrive at.
    if (typeof IntersectionObserver === "undefined") return;

    const fits = window.matchMedia(TRACK_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);

    // Reduced motion switches the tracking off rather than just flattening its
    // transition. The global reduced-motion block already cuts every transition
    // to 0.01ms, so a tracked index would snap between states as the page moved
    // — motion the visitor asked not to have, expressed as a flashing list.
    // The sticky layout itself stays: holding still is not motion.
    const sync = () => setTracked(fits.matches && !reduced.matches);

    sync();
    fits.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fits.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  // Follow the reading line. An observer rather than a rAF loop: nothing here
  // is a function of the exact scroll offset, so between the two or three
  // moments a panel actually changes hands there is nothing to compute, and a
  // loop would be paying sixty times a second to learn that.
  useEffect(() => {
    const root = rootRef.current;
    if (!tracked || !root) return;

    const panels = root.querySelectorAll<HTMLElement>("[data-plan]");
    if (panels.length === 0) return;

    /**
     * Which panels are across the line right now. A callback only reports what
     * CHANGED, so a running set is the only way to answer "and what else is
     * still there" at a boundary, where two panels share the band at once.
     */
    const crossing = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = (entry.target as HTMLElement).dataset.plan;
          if (!slug) continue;
          if (entry.isIntersecting) crossing.add(slug);
          else crossing.delete(slug);
        }

        // Last in DOCUMENT order wins, not last in the entries array: `entries`
        // arrives in neither document nor scroll order, so picking from it
        // directly makes the index flicker between two names for the whole
        // ~10vh of a crossing. Reading the set in render order instead hands
        // the index to the panel arriving rather than the one leaving, and does
        // it at the same line in both directions.
        let next: string | undefined;
        for (const slug of ORDER) if (crossing.has(slug)) next = slug;

        // Nothing across the line — above the band, below it, or between two
        // panels on a very tall window — leaves the index as it was. The active
        // entry is only ever handed on, never cleared, so the column never
        // blinks blank at the edges of the section.
        if (next) setActive(next);
      },
      {
        rootMargin: READING_LINE,
        // MUST be 0. `intersectionRatio` is measured against the SHRUNKEN root,
        // so a panel 70% of the window tall can never exceed 0.10 / 0.70 =
        // 0.143 of it. Any threshold above that never fires at all, and 0.1
        // fires on a tall monitor but dies on a laptop, where a panel that
        // outgrows its floor pushes the ratio below the threshold. Explicit
        // rather than left to the default, because the default is the only
        // correct value and that is not obvious.
        threshold: 0,
      },
    );

    for (const panel of panels) observer.observe(panel);
    return () => observer.disconnect();
  }, [tracked]);

  // Decide whether the deck sinks, and keep deciding, as the tracking does: a
  // phone can rotate, a window can resize, reduced motion can change.
  useEffect(() => {
    if (getMotionTier() !== "full") return;
    const fits = window.matchMedia(DECK_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => setDeck(fits.matches && !reduced.matches);

    sync();
    fits.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fits.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  // Sink each card as the next one rises over it. How far the next card has
  // come is read from where it actually is - its top edge travelling from the
  // foot of the window to the line it sticks at - so the effect follows the
  // finger exactly, backwards as well as forwards.
  useEffect(() => {
    const track = trackRef.current;
    const band = track?.closest("section");
    if (!deck || !track || !band) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-plan]"),
    );
    if (cards.length < 2) return;

    // Where each card sticks, in px from the top of the window. Measured on
    // resize rather than per frame: it only changes when the window does.
    // A card taller than the room under its sticking line is moved up by
    // `--stick` until its foot is in view, so its call to action is never
    // held below the fold while the next card covers it.
    let stops: number[] = [];
    const measure = () => {
      const room = window.innerHeight;
      stops = cards.map((card) => {
        card.style.removeProperty("--stick");
        const line = parseFloat(getComputedStyle(card).top) || 0;
        const fit = room - card.offsetHeight - 16;
        if (fit < line) card.style.setProperty("--stick", `${fit}px`);
        return Math.min(line, fit);
      });
    };
    measure();

    const covers = cards.map(() => -1);
    let frame = 0;
    const paint = () => {
      frame = 0;
      const viewport = window.innerHeight;
      // Every read before any write, so a frame costs one layout at most.
      const tops = cards.map((card) => card.getBoundingClientRect().top);
      for (let i = 1; i < cards.length; i++) {
        const travel = Math.max(viewport - stops[i], 1);
        const progress = Math.min(
          Math.max((viewport - tops[i]) / travel, 0),
          1,
        );
        const next = Math.round(progress * 1000) / 1000;
        if (next !== covers[i - 1]) {
          covers[i - 1] = next;
          cards[i - 1].style.setProperty("--cover", String(next));
        }
      }
    };

    // Only while the band is near the window, as the lion's eye does.
    let near = typeof IntersectionObserver === "undefined";
    const watch = near
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            near = entry.isIntersecting;
            if (!frame) frame = requestAnimationFrame(paint);
          },
          { rootMargin: "20% 0px" },
        );
    watch?.observe(band);

    const onScroll = () => {
      if (near && !frame) frame = requestAnimationFrame(paint);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      watch?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      for (const card of cards) {
        card.style.removeProperty("--cover");
        card.style.removeProperty("--stick");
      }
    };
  }, [deck]);

  /**
   * Eases an index click to its panel.
   *
   * A handler is needed despite Lenis running with `anchors: true`. Lenis's own
   * click handler calls `scrollTo` and returns WITHOUT calling
   * `preventDefault`, so the browser's native fragment jump fires as well: the
   * page teleports, Lenis — already mid-animation and so ignoring what it reads
   * as its own scroll — yanks it back, and then eases to the same place. The
   * visitor sees a flash. Taking the click ourselves also keeps three index
   * entries from stacking three history entries between the visitor and the
   * page they arrived from.
   */
  const onIndexClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    // Let the browser do it natively if anything is missing — a jump that is
    // not smooth beats a link that does nothing.
    const lenis = getLenis();
    const target = document.getElementById(slug);
    if (!lenis || !target) return;

    event.preventDefault();
    lenis.scrollTo(target, {
      immediate: window.matchMedia(REDUCED_QUERY).matches,
    });
    history.replaceState(null, "", `#${slug}`);
  };

  return (
    <Section
      id="membership"
      className="bg-surface-2"
      watermark={
        <div aria-hidden className="mb-lion">
          <div>
            <div ref={lionRef} className="mb-lion-art">
              <LionArt className="mb-lion-ink" />
              <div className="mb-lion-ox">
                <LionArt id="lion-ox" solids />
              </div>
              <LionEye className="mb-lion-eye" />
            </div>
          </div>
        </div>
      }
    >
      {/* The ref and the attribute sit here rather than on the <section>: this
          is the nearest ancestor the two columns share, and Section owns its
          own element.

          NOTHING from here up to <Section> may be wrapped in <Reveal>. `.reveal`
          carries a transform, and a transform on an ancestor of a sticky
          element makes that ancestor its containing block — which stops the
          sticking outright, with no error and no clue beyond the column
          scrolling away. Reveal INSIDE the column is fine: a descendant's
          transform has no say in the matter. */}
      <div
        ref={rootRef}
        data-tracked={tracked}
        data-deck={deck || undefined}
        className="mb grid gap-14 lg:grid-cols-12 lg:gap-10"
      >
        {/* ---- The index. THIS ELEMENT IS THE STICKY ONE. ---------------- */}
        <div className="mb-aside lg:col-span-4">
          <Reveal>
            <p className="text-label text-text-muted flex items-center gap-4">
              <ImigongoRule />
              {membershipSection.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2
              id="membership-title"
              className="mb-title font-display text-heading text-text mt-6 text-[clamp(2rem,4.6vw,4rem)]"
            >
              <SplitWords text={membershipSection.title} />
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="mb-lede text-text-muted mt-6 text-lg leading-snug">
              {membershipSection.lede}
            </p>
          </Reveal>

          {/* Labelled by the section's own heading rather than a new string:
              without a label a screen reader meets three links named Learner,
              Builder and Partner immediately followed by three headings of the
              same names, with nothing to explain the relationship. Named as a
              landmark it reads as a table of contents, and can be skipped. */}
          <nav aria-labelledby="membership-title" className="mb-nav mt-10">
            <ol className="border-line border-t">
              {plans.map((plan, index) => (
                <Reveal as="li" key={plan.slug} delay={240 + index * 70}>
                  <a
                    href={`#${plan.slug}`}
                    onClick={(event) => onIndexClick(event, plan.slug)}
                    data-active={active === plan.slug}
                    // Only claimed while the tracking is actually running.
                    // Untracked, every entry is equally current, and saying
                    // otherwise tells a screen reader something the page is not
                    // doing. `location` rather than `true` or `page`: it is
                    // defined as the current place within a context, which is
                    // exactly what an index marking the section being read is.
                    aria-current={
                      tracked && active === plan.slug ? "location" : undefined
                    }
                    className="mb-step border-line text-text flex items-baseline border-b border-l-2 py-4 pl-5 transition-colors duration-300 ease-[var(--ease-out-expo)]"
                  >
                    <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">
                      {plan.name}
                    </span>
                  </a>
                </Reveal>
              ))}
            </ol>
          </nav>
        </div>

        {/* ---- The panels. Ordinary flow; nothing here sticks. ----------- */}
        {/* Below lg, a deck: see "On a phone" above and `.mb-track` in
            globals.css. */}
        <ul
          ref={trackRef}
          className="mb-track grid gap-px lg:col-span-7 lg:col-start-6"
        >
          {plans.map((plan, index) => (
            <li
              key={plan.slug}
              id={plan.slug}
              data-plan={plan.slug}
              // So a fragment jump can put focus where it put the page.
              tabIndex={-1}
              // Its place in the deck: how far below the one before it
              // sticks on a phone.
              style={{ "--i": index } as React.CSSProperties}
              className={`mb-panel relative flex flex-col justify-center overflow-hidden p-9 lg:p-12 ${
                plan.featured
                  ? "bg-text text-text-invert"
                  : "bg-surface text-text"
              }`}
            >
              {/* Marks the featured way in without adding another badge: the
                  motif sits in the corner and bleeds off two edges. */}
              {plan.featured ? (
                <ImigongoMark
                  motif="lozenge"
                  className="text-text-invert absolute -top-6 -right-6 h-28 w-28 opacity-25"
                />
              ) : null}

              {/* Phones: the card's number, set huge and in outline and
                        bled off its corner - the deck's way of saying which
                        card is on top without a counter. */}
              <span aria-hidden className="mb-num lg:hidden">
                {pad(index + 1)}
              </span>

              {/* Reveal wraps the CONTENTS, not the panel. A panel is most of a
                  screen tall, and Reveal's lead-in test only clears for an
                  element that size once a third of the window is already
                  showing it — the copy would fade in long after its own box
                  had arrived. The contents are an ordinary few hundred pixels,
                  so they behave like every other revealed block on the page.
                  No stagger for the same reason: two panels this tall are never
                  on screen together, so a delay reads as lag, not rhythm. */}
              {/* `relative` lifts the copy over the number above. */}
              <Reveal className="relative flex flex-col">
                <p
                  className={`text-label ${
                    plan.featured ? "text-text-invert/60" : "text-text-muted"
                  }`}
                >
                  {plan.cadence}
                </p>

                <div className="mt-6 flex items-baseline gap-5">
                  <span
                    className={`font-display text-label tabular-nums ${
                      plan.featured ? "text-text-invert/60" : "text-text-muted"
                    }`}
                  >
                    {pad(index + 1)}
                  </span>
                  <h3 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-extrabold tracking-[-0.03em]">
                    {plan.name}
                  </h3>
                </div>

                {/* A measure, not a column width: the panel is wide enough that
                    a full line at this size runs past the point the eye can
                    track back to the start of the next one. */}
                <p className="mt-5 max-w-[26ch] text-[clamp(1.25rem,1.9vw,1.75rem)] leading-snug font-semibold">
                  {plan.blurb}
                </p>

                <ul
                  className={`mb-features mt-10 space-y-3 border-t pt-8 ${
                    plan.featured ? "border-text-invert/25" : "border-line"
                  }`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 leading-snug">
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="mt-1 h-4 w-4 shrink-0"
                      >
                        <path
                          d="M4 12.5l5.5 5.5L20 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className={
                          plan.featured
                            ? "text-text-invert/85"
                            : "text-text-muted"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* `w-fit` because a flex column stretches its children across:
                    without it the pill runs the full width of the panel. */}
                <a
                  href={plan.cta.href}
                  className={`mb-cta mt-10 w-fit ${
                    // Mirrored on the dark featured panel: a white outline
                    // filling white, since an ink hover would vanish against it.
                    plan.featured ? "btn-invert" : "btn"
                  }`}
                >
                  <RollText>{plan.cta.label}</RollText>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
