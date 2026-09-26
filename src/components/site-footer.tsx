import { ImigongoBand, ImigongoCorner } from "@/components/imigongo";
import { Logo } from "@/components/logo";
import { contact, footerLinks, site, socials } from "@/lib/site";

/**
 * Inverted footer, kept deliberately short.
 *
 * It used to run four link columns, a full address block and a hours table —
 * seventeen links and most of a screen. Nearly all of it repeated the menu,
 * which is reachable from the top of every page at every scroll position, so
 * the sitemap at the foot of the page was a second copy of navigation nobody
 * had to scroll to find. What is left is the three things a footer is actually
 * for: who we are, how to reach us, and the legal line.
 *
 * The opening hours are not dropped so much as relocated — they are still on
 * /contact, next to the address, which is where someone looking for them goes.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      data-panel="footer"
      className="bg-text text-text-invert relative px-6 pt-14 pb-8 lg:px-[3.6vw] lg:pt-16 lg:pb-10"
    >
      {/* Edge banding along the top, the way a real panel is framed. Light on
          the dark ground rather than oxblood, which would disappear here.

          Softened from the strength it used to carry so that it and the corner
          patch below read as one quiet treatment rather than two competing
          ones — it is still the strongest imigongo on the page, because it is
          marking the footer's edge rather than texturing its surface. */}
      <ImigongoBand
        id="imigongo-footer"
        flip
        opacity={0.1}
        className="absolute inset-x-0 top-0"
      />

      {/* A patch of herringbone dissolving out of the bottom-right corner, the
          same treatment every page's hero carries in the same corner — so the
          two ends of the scroll rhyme. Deliberately near the threshold of
          visibility: it is a change in the surface you notice on second
          glance, not a pattern you read.

          `tone="invert"` because the footer is an inverted panel. The default
          would paint the artwork in the footer's own background colour, and
          because the panel flips with the theme no fixed hue would do. */}
      <ImigongoCorner
        id="imigongo-footer-corner"
        motif="herringbone"
        tone="invert"
        scale={1.75}
        opacity={0.04}
        className="right-0 bottom-0 h-full w-[72vw] sm:w-[52vw] lg:w-[34vw]"
      />

      {/* Positioned, so it shares a stacking context with the corner patch
          above and document order alone puts the content on top. An absolutely
          positioned sibling otherwise paints over the text of a static one. */}
      <div className="relative mx-auto max-w-[110rem]">
        {/* Identity and contact on the left, links on the right — one row on
            wide screens, stacked below. Both sides are short enough that the
            row needs no columns to hold its shape. */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div>
            <Logo variant="lockup" className="w-44" />

            {/* The address block reduced to one line: the details that can be
                acted on, side by side rather than stacked under headings. */}
            <address className="mt-6 flex flex-col gap-x-6 gap-y-1 text-sm not-italic sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={`mailto:${contact.email}`}
                className="underline-offset-4 hover:underline"
              >
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="underline-offset-4 hover:underline"
              >
                {contact.phone}
              </a>
              <span className="text-text-invert/60">
                {contact.addressLines.join(", ")}
              </span>
            </address>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 lg:justify-end">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-text-invert/60 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal rail: credit on one end, tagline on the other. */}
        <div className="border-text-invert/20 mt-10 flex flex-col items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
          {/* /70 rather than /50: in dark mode the footer's ink is near-black
              on a near-white ground, where 50% composites to about 3.5:1 —
              under the 4.5:1 minimum. /70 clears it in both themes. */}
          <p className="text-text-invert/70 text-sm">
            © {year} {site.name} {site.region}.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {/* Rendered only when there are real profiles to link to, so an
                empty list leaves no stray gap in the rail. */}
            {socials.length > 0 ? (
              <ul className="flex flex-wrap gap-6">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="text-label text-text-invert/70 hover:text-text-invert transition-colors"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="text-label text-text-invert/70">
              {site.tagline.join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
