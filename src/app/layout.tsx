import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

/**
 * One family across the whole site, mirroring the reference design, which runs
 * a single geometric grotesque from 400 to 900 plus a heavy oblique for the
 * display line. The italic axis is loaded because the hero needs it.
 */
const figtree = Figtree({
  variable: "--font-figtree",
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
    <html lang="en">
      <body className={figtree.variable}>
        {/* Keyboard users can jump straight past the nav. */}
        <a
          href="#top"
          className="focus:bg-text focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-5 focus:py-2.5 focus:font-semibold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
