import type Lenis from "lenis";

/**
 * The live Lenis instance, if smooth scrolling is running.
 *
 * A module singleton rather than a React context: the only consumer is
 * `SiteHeader`, which has to scroll the page programmatically, and threading a
 * provider through the root layout to serve one component would mean wrapping
 * every page's children in a client component for no other gain.
 *
 * `null` whenever Lenis is not running — before hydration, with JavaScript
 * unavailable, or on a page where `<SmoothScroll />` is not mounted. Callers
 * must treat that as the normal case and fall back to native scrolling, not as
 * an error.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
