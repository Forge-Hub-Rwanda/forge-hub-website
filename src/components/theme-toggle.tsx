"use client";

import { useEffect } from "react";
import { startThemeRuntime, toggleTheme } from "@/lib/theme";

/**
 * The theme switch: one circle, sized and styled exactly like the EN/RW
 * buttons beside it. The icon shows what a click will DO rather than where you
 * are — a sun while the page is dark, a moon while it is light.
 *
 * Nothing here is driven by React state. Both icons and both labels are always
 * rendered, and CSS keyed on `html[data-theme]` hides the pair that does not
 * apply — see the `[data-when-theme]` rules in `globals.css`. That attribute is
 * set by a blocking script before the first paint, whereas React state cannot
 * be correct until hydration has run, so a state-driven icon would show the
 * wrong one for a moment on every single load. For the same reason the click
 * handler reads the current theme off the document rather than from a prop.
 *
 * The component therefore never re-renders, and three of them can sit on the
 * page — the corner, the desktop nav row, the menu — without coordination.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Installs the OS-preference and cross-tab listeners, and squares up the
  // <meta name="theme-color"> tags that the pre-paint script leaves alone.
  // Refcounted inside, so the three instances share one set of listeners.
  useEffect(() => startThemeRuntime(), []);

  return (
    <button
      type="button"
      data-theme-toggle
      /* Marks this as fixed chrome that has to switch to white where it passes
         over a full-bleed colour band — see `data-chrome` in `globals.css` and
         the effect that sets it in `SiteHeader`. Harmless on the instance
         inside the menu overlay, which the flag is cleared for. */
      data-chrome-ink
      onClick={toggleTheme}
      className={`border-line-mid text-text-muted hover:border-text hover:bg-text hover:text-text-invert h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        className ?? ""
      }`}
    >
      {/* The accessible name, swapped by the same rules as the icon so it
          describes the action rather than the state. */}
      <span className="sr-only" data-when-theme="light">
        Switch to dark theme
      </span>
      <span className="sr-only" data-when-theme="dark">
        Switch to light theme
      </span>

      {/* Moon while the page is light — click for dark. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        data-when-theme="light"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>

      {/* Sun while the page is dark — click for light. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        data-when-theme="dark"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}
