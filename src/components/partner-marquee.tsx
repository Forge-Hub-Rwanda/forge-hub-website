import { partners } from "@/lib/site";

/**
 * Continuous partner strip directly under the hero.
 *
 * The list renders twice inside a track sized to its content; translating the
 * track by -50% lands the second copy exactly where the first began, so the
 * loop is seamless without measuring anything at runtime.
 *
 * ⚠️  The names in `partners` are illustrative, not confirmed supporters.
 */
export function PartnerMarquee() {
  return (
    <section
      aria-label="Partners and supporters"
      className="border-line bg-surface relative border-y py-7"
    >
      {/* Edges fade so items enter and leave instead of popping. */}
      <div
        aria-hidden
        className="from-surface pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent"
      />
      <div
        aria-hidden
        className="from-surface pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent"
      />

      <div className="flex overflow-hidden">
        <ul className="marquee flex w-max shrink-0 items-center">
          {[...partners, ...partners].map((partner, index) => (
            <li
              key={`${partner}-${index}`}
              // The duplicated half is decorative; keep it out of the a11y tree.
              aria-hidden={index >= partners.length}
              className="flex items-center gap-10 px-10 whitespace-nowrap"
            >
              <span className="text-label text-text-muted">{partner}</span>
              <span aria-hidden className="bg-text h-1 w-1" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
