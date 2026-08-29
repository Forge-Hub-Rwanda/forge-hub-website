import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
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
  themeColor: "#fbfaf7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jakarta.variable}`}>
        {/* Keyboard users can jump straight past the nav. */}
        <a
          href="#top"
          className="focus:bg-accent focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:px-5 focus:py-2.5 focus:font-semibold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
