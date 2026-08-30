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
      className="bg-text text-text-invert px-6 pt-24 pb-10 lg:px-[3.6vw] lg:pt-32"
    >
      <div className="mx-auto max-w-[110rem]">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Contact block */}
          <div className="lg:col-span-4">
            <Logo className="w-16 text-[1.35rem]" />

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

        {/* Legal rail */}
        <div className="border-text-invert/20 mt-20 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text-invert/50 text-sm">
            © {year} {site.name} {site.region}. {site.tagline.join(" · ")}.
          </p>
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
        </div>
      </div>
    </footer>
  );
}
