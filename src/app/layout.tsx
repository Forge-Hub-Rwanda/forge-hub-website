import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import { CursorLabel } from "@/components/cursor-label";
import { ForgeLoader } from "@/components/forge-loader";
import { ScrollProgress } from "@/components/scroll-progress";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeScript } from "@/components/theme-script";
import { loaderScriptSource } from "@/lib/loader";
import "./globals.css";

/**
 * One family across the whole site, mirroring the reference design, which runs
 * a single sans from 400 to 900 plus a heavy oblique for the display line.
 * Satoshi, self-hosted from Fontshare (ITF Free Font License — see
 * `fonts/Satoshi-LICENSE.txt`). The two variable files cover every weight from
 * 300 to 900; the italic file is loaded because the hero needs it. The files
 * are used exactly as distributed — the licence forbids modifying them.
 */
const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
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

/**
 * One tag per scheme, so the browser's own chrome starts out matching the page
 * for a visitor who has made no choice. A visitor who HAS chosen overrides both
 * from the client — see `apply()` in `src/lib/theme.ts`. Values must stay in
 * step with `--color-surface` in `globals.css`.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variable goes on <html>, not <body>: --font-body is declared on
    // :root and references it, and a custom property is substituted on the
    // element that DECLARES it. On <body> the reference would be unresolvable
    // from :root, making --font-body invalid and silently dropping the family.
    // `suppressHydrationWarning` is for ONE attribute: `data-theme`, which the
    // script below writes before React exists and so is deliberately absent
    // from the server-rendered markup. It suppresses warnings on this element
    // only, not on the tree beneath it.
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body>
        {/* First thing in the body, and blocking: it sets the theme before a
            single pixel is painted, so a visitor who chose dark never sees the
            page flash white first. */}
        <ThemeScript />
        {/* Keyboard users can jump straight past the nav to the hero copy. */}
        <a
          href="#hero-intro"
          className="focus:bg-text focus:text-text-invert sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-5 focus:py-2.5 focus:font-semibold"
        >
          Skip to content
        </a>
        {/* Every scroll reveal starts at `opacity: 0` and is raised by an
            IntersectionObserver once it enters the viewport. With scripting
            unavailable that observer never runs, and since the reveals now
            carry most of the page — every section heading, every card, the
            whole footer — the result would be a correctly-structured document
            that renders as a blank sheet.

            This is the one case where the CSS has to know about JavaScript.
            The rule is scoped to <noscript>, so it costs nothing to everyone
            else and cannot interfere with the animations when they do run. */}
        {/* The theme toggle joins it here: switching theme is entirely a
            client-side act, so without scripting the control is a button that
            cannot do anything. The page still honours the visitor's OS setting
            through the media query in `globals.css` — what is missing is only
            the ability to contradict it. */}
        {/* The motion pass adds two more things that wait on a script: split
            words that rise when revealed, and odometer columns that roll to
            their digit. Without scripting both are parked on their finished
            state here, exactly as the reveals are. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}[data-theme-toggle]{display:none!important}.split-inner{transform:none!important;animation:none!important}.odo-col{transform:translate3d(0,calc(var(--to,0)*-1em),0)!important}`}</style>
        </noscript>

        {/* Decides before first paint whether this is the session's first
            page view, and so whether the loader plays. See src/lib/loader.ts. */}
        <script dangerouslySetInnerHTML={{ __html: loaderScriptSource }} />
        <ForgeLoader />

        {/* Renders nothing; starts Lenis for every page. */}
        <SmoothScroll />
        <ScrollProgress />
        <CursorLabel />

        {/* Client-side navigations (Next `Link`s) wipe the page in with the
            same sawtooth edge the browser's cross-document transition uses for
            plain anchors — see "Page transitions" in globals.css. `update`
            fires because this boundary persists while the page inside it is
            swapped. */}
        <ViewTransition update="page-wipe" default="none">
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
