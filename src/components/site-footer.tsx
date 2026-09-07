import { ImigongoBand } from "@/components/imigongo";
import { Logo } from "@/components/logo";
import { contact, footerColumns, site, socials } from "@/lib/site";

/**
 * Inverted footer: contact block on the left, four link columns on the right,
 * legal rail underneath.
 *
 * ⚠️  The address, phone number, email and opening hours in `contact` are
 * invented placeholders. Replace them before this page is published.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-text text-text-invert relative px-6 pt-24 pb-10 lg:px-[3.6vw] lg:pt-32"
    >
      {/* Edge banding along the top, the way a real panel is framed. Light on
          the dark ground rather than oxblood, which would disappear here. */}
      <ImigongoBand
        id="imigongo-footer"
        flip
        opacity={0.18}
        className="absolute inset-x-0 top-0"
      />

      <div className="mx-auto max-w-[110rem]">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Contact block */}
          <div className="lg:col-span-4">
            <Logo variant="lockup" className="w-56" />

            <address className="mt-8 space-y-6 not-italic">
              <div>
                <p className="text-label text-text-invert/50">Visit</p>
                <p className="mt-2 leading-snug">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div>
                <p className="text-label text-text-invert/50">Contact</p>
                <p className="mt-2 flex flex-col gap-1">
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
                </p>
              </div>

              <div>
                <p className="text-label text-text-invert/50">Open</p>
                <dl className="mt-2 space-y-1">
                  {contact.hours.map((slot) => (
                    <div key={slot.days} className="flex gap-4">
                      <dt className="text-text-invert/70 w-24 shrink-0">
                        {slot.days}
                      </dt>
                      <dd>{slot.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </address>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-label text-text-invert/50">
                  {column.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        className="hover:text-text-invert/60 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Legal rail: credits, centred tagline, socials */}
        <div className="border-text-invert/20 mt-20 flex flex-col items-center gap-6 border-t pt-8 sm:grid sm:grid-cols-3 sm:items-center">
          <p className="text-text-invert/50 order-3 text-sm sm:order-none sm:justify-self-start">
            © {year} {site.name} {site.region}.
          </p>
          <p className="text-label text-text-invert/70 order-1 text-center sm:order-none sm:justify-self-center">
            {site.tagline.join(" · ")}
          </p>
          <ul className="order-2 flex flex-wrap justify-center gap-6 sm:order-none sm:justify-self-end">
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
        </div>
      </div>
    </footer>
  );
}
