/**
 * Shared constants for the hero's scroll-linked motion.
 *
 * These live outside the components because two separate pieces have to agree
 * on them: the display line and the logo shrink over the same scroll distance,
 * and the display line has to find the element it releases at. Keeping them in
 * a plain module also lets HeroIntro — a server component — import the id
 * without reaching into a "use client" file, where exports arrive as client
 * references rather than the values themselves.
 */

/** Scroll distance, in px, over which the display line's shrink completes. */
export const HERO_SCROLL_TRAVEL = 200;

/**
 * Scroll distance, in px, over which the logo tile's shrink completes.
 *
 * Deliberately longer than the display line's: the logo carries on easing
 * after the line has released and the nav has tucked away, so the header
 * settles on its own rather than everything resolving at the same moment.
 */
export const LOGO_SCROLL_TRAVEL = 400;

/**
 * Marks the element the sticky display line releases at. Set by HeroIntro on
 * its headline, read by HeroDisplay.
 */
export const HERO_RELEASE_ID = "hero-release-anchor";

/**
 * Marks the display line itself. Set by HeroDisplay on its heading, read by
 * SiteHeader, which tucks the nav away as the line rides down onto it.
 */
export const HERO_DISPLAY_ID = "hero-display-line";

/**
 * How far the nav has to rise into the display line, in px, before it is fully
 * tucked away. The two sit flush at rest, so this is measured from first touch.
 */
export const NAV_TUCK_TRAVEL = 96;

/**
 * Scroll distance, in px, over which the language toggle fades out. Longer
 * than the nav tuck so it reads as a slow fade rather than a snap.
 */
export const LOCALE_FADE_TRAVEL = 320;
