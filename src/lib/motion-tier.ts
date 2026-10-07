/**
 * How much motion this device gets, decided once, before the first paint.
 *
 * Most of this site's visitors are on phones, and many of those are modest
 * Android handsets. The phone animations are built to be cheap, but a phone
 * with a gigabyte or two of memory, or a visitor who has turned on data saver,
 * still gets a lighter version of them:
 *
 *   - "full" — everything.
 *   - "lite" — entrances and static art, but nothing pinned or scrubbed on a
 *              phone. Desktop is unaffected: every desktop effect keeps its own
 *              gate, so a weak laptop sees exactly what it always did.
 *   - "none" — a reduced-motion preference. Every effect already honours that
 *              on its own; the tier just says so in one place for CSS.
 *
 * The signals are only those a browser reports without asking: data saver,
 * `deviceMemory` (Chrome only — Safari reports nothing, so an iPhone is "full",
 * which suits it) and `hardwareConcurrency`. A blocking inline script in the
 * root layout writes the answer to `<html data-motion>`, so CSS can gate on it
 * from the first frame, exactly as the theme and the loader are decided.
 */

export type MotionTier = "full" | "lite" | "none";

/** Phones and portrait tablets: below the width every desktop effect needs. */
export const PHONE_QUERY = "(max-width: 63.99rem)";

export const motionTierScriptSource = `(function(){try{var t="full",n=navigator,c=n.connection;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)t="none";else if((c&&c.saveData)||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2))t="lite";document.documentElement.setAttribute("data-motion",t)}catch(e){}})();`;

/** The tier the inline script chose; "full" if it never ran. */
export function getMotionTier(): MotionTier {
  if (typeof document === "undefined") return "full";
  const tier = document.documentElement.dataset.motion;
  return tier === "lite" || tier === "none" ? tier : "full";
}
