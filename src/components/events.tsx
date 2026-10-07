import { Reveal } from "@/components/reveal";
import { Section, SectionHeading } from "@/components/section-heading";
import { eventsSection, type SiteEvent } from "@/lib/site";

/**
 * Upcoming events as a date-led list. The date block is the anchor, so it is
 * set as a solid square to the left of each row.
 *
 * `events` is passed in rather than imported: the homepage reads it from the
 * CMS (falling back to the `site.ts` holding row when none are set), so this
 * component only decides how a row looks.
 */
export function Events({ events }: { events: SiteEvent[] }) {
  return (
    <Section id="events" className="bg-text text-text-invert">
      {/* This band is inverted, so the shared heading's tokens are overridden
          locally rather than adding a variant to SectionHeading. */}
      {/* `drift`: the title slides in from the left and the lede from the
          right as the band comes up the screen, meeting in the middle. */}
      <div className="[&_.bg-text]:bg-text-invert [&_h2]:text-text-invert [&_p]:text-text-invert/70">
        <SectionHeading {...eventsSection} drift />
      </div>

      <ul className="border-text-invert/20 border-t">
        {events.map((event, index) => (
          <Reveal
            key={event.name}
            as="li"
            delay={index * 70}
            className="border-text-invert/20 border-b"
          >
            <a
              href={eventsSection.cta.href}
              className="group flex flex-col gap-5 py-7 transition-opacity hover:opacity-70 sm:flex-row sm:items-center sm:gap-8 lg:py-8"
            >
              {/* A plain box, not `<time>`: the only entry is "TBA" with no
                  month, and `<time>` requires a parseable date in either its
                  content or a `dateTime` attribute — neither exists yet, and
                  inventing one would be worse than not marking it up.
                  TODO: once events carry real dates, add an ISO date to
                  `SiteEvent` and restore `<time dateTime={...}>`. */}
              <div className="bg-text-invert text-text flex h-20 w-20 shrink-0 flex-col items-center justify-center leading-none">
                <span className="font-display text-2xl font-extrabold">
                  {event.date.day}
                </span>
                <span className="text-label mt-1 text-[0.6rem]">
                  {event.date.month}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-label text-text-invert/60">{event.kind}</p>
                <h3 className="font-display mt-2 text-[clamp(1.25rem,2.2vw,1.9rem)] font-extrabold tracking-[-0.03em]">
                  {event.name}
                </h3>
              </div>

              <dl className="text-text-invert/70 flex gap-8 text-sm sm:flex-col sm:gap-1 sm:text-right">
                <div>
                  <dt className="sr-only">Time</dt>
                  <dd>{event.time}</dd>
                </div>
                <div>
                  <dt className="sr-only">Location</dt>
                  <dd>{event.location}</dd>
                </div>
              </dl>
            </a>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
