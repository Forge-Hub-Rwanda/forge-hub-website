import type { Metadata, Viewport } from "next";
import { Chivo } from "next/font/google";
import "./globals.css";

/**
 * One family across the whole site, mirroring the reference design, which runs
 * a single grotesque from 400 to 900 plus a heavy oblique for the display line.
 * Chivo rather than a geometric sans: it is a true grotesque with flat
 * terminals and real weight at 900, which is what the oversized oblique needs
 * to read as a poster line rather than as merely large text. Its straight-sided
 * letterforms also rhyme with the imigongo geometry. The italic axis is loaded
 * because the hero needs it.
 */
const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ForgeHub Rwanda — Build · Innovate · Empower",
  description:
    "A coworking floor, a maker studio and a launchpad in Kigali for the founders, engineers and creators turning ideas into things that ship.",
  openGraph: {
    title: "ForgeHub Rwanda",
    description:
      "Where Rwanda's builders come to work. Coworking, programs and community in Kigali.",
    type: "website",
    locale: "en_RW",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variable goes on <html>, not <body>: --font-body is declared on
    // :root and references it, and a custom property is substituted on the
    // element that DECLARES it. On <body> the reference would be unresolvable
    // from :root, making --font-body invalid and silently dropping the family.
    <html lang="en" className={chivo.variable}>
      <body>
        {/* Keyboard users can jump straight past the nav to the hero copy. */}
        <a
          href="#hero-intro"
          className="focus:bg-text focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-5 focus:py-2.5 focus:font-semibold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
