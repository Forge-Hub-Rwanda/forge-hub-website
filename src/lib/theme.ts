/**
 * Colour theme — light or dark.
 *
 * The visitor's choice is the only thing stored. Absence of a stored choice
 * means "follow the OS", which is the default a first-time visitor gets; the
 * CSS in `globals.css` expresses that same rule, so the two agree even before
 * any of this module has run.
 *
 * The single source of truth at runtime is `data-theme` on <html>. Nothing
 * here keeps a parallel copy of the current theme in a module variable: the
 * pre-paint script below sets that attribute before React exists, so a second
 * copy could only ever disagree with it.
 */

export type Theme = "light" | "dark";

/** Where a MANUAL choice is stored. Nothing stored means "follow the OS". */
export const THEME_STORAGE_KEY = "forgehub-theme";

/**
 * Drives <meta name="theme-color">, so the browser's own chrome — the address
 * bar on mobile, the title bar of an installed PWA — matches the page rather
 * than staying white behind a dark site. Must stay in step with the
 * `--color-surface` values in `globals.css`.
 */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs synchronously, before the browser paints anything, so a visitor who has
 * chosen dark never sees a white page flash first.
 *
 * It has to be an inline blocking script rather than a React effect: an effect
 * runs after hydration, which is several paints too late. It is also the only
 * reason <html> carries `suppressHydrationWarning` — the attribute it sets is,
 * by design, not in the server-rendered markup.
 *
 * Deliberately minimal. It reads storage and sets one attribute; everything
 * else — the meta tags, the OS-change listener — is left to `subscribeTheme`,
 * because none of it affects the first paint. Wrapped in try/catch because
 * `localStorage` throws outright in some privacy modes, and a theme preference
 * is never worth taking the page down for.
 */
export const themeScriptSource = `(function(){try{var d=document.documentElement,s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});d.setAttribute("data-theme",s==="light"||s==="dark"?s:(window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light"))}catch(e){}})();`;

/* -------------------------------------------------------------------------- */
/*  Runtime                                                                    */
/* -------------------------------------------------------------------------- */

/** Refcount, so the three toggles on a page share one set of listeners. */
let running = 0;

/** Held only while the runtime is up, so the listener is cleaned up. */
let media: MediaQueryList | null = null;

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Writes the theme to the document — the attribute plus the browser chrome. */
function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  // Two tags are emitted, one per `prefers-color-scheme`. Both are set to the
  // resolved colour rather than one being picked: whichever the browser matches
  // then reports the theme actually on screen, including when a manual choice
  // contradicts the OS.
  document.querySelectorAll('meta[name="theme-color"]').forEach((tag) => {
    tag.setAttribute("content", THEME_COLORS[theme]);
  });
}

function onSystemChange() {
  // A manual choice outranks the OS, and outlives the OS changing.
  if (storedTheme()) return;
  apply(systemTheme());
}

/** Another tab changed the preference — follow it, so windows stay in step. */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
  apply(storedTheme() ?? systemTheme());
}

/**
 * Brings up the parts that cannot be done before paint and are not worth doing
 * there: following the OS while no choice is stored, following other tabs, and
 * squaring up the meta tags. Returns a teardown, so it drops straight into a
 * `useEffect`. Refcounted, which also makes it safe under StrictMode's
 * double-invoked effects.
 */
export function startThemeRuntime(): () => void {
  if (running === 0) {
    media = window.matchMedia(DARK_QUERY);
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    // The pre-paint script sets the attribute but deliberately not the meta
    // tags. This is where they catch up, once it can cost nothing.
    apply(getTheme());
  }
  running += 1;

  return () => {
    running -= 1;
    if (running > 0 || !media) return;
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
    media = null;
  };
}

/** Reads the document, which the pre-paint script has already made correct. */
export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the choice still applies, it just will not persist.
  }
  apply(theme);
}

/** Reads the live theme rather than taking one, so it cannot act on a stale value. */
export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}
