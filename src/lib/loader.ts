/**
 * The first-visit loader's gate, shared between the blocking inline script in
 * the root layout and the `ForgeLoader` component that plays it.
 *
 * The decision has to be made BEFORE the first paint — otherwise the page
 * would flash up and then be covered by the loader — so it is taken by a tiny
 * inline script, exactly as the theme is. That script sets
 * `data-loader="play"` on <html> for the first page view of a browser session
 * and nothing otherwise; the overlay is `display: none` unless that attribute
 * is present. So a returning visitor, a reduced-motion visitor and a browser
 * with scripting unavailable never see it at all.
 *
 * The session flag is written by the script itself, at decision time, so a
 * reload in the middle of the sequence goes straight to the page.
 */

export const LOADER_STORAGE_KEY = "forgehub-loader";

export const loaderScriptSource = `(function(){try{if(sessionStorage.getItem(${JSON.stringify(
  LOADER_STORAGE_KEY,
)})||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem(${JSON.stringify(
  LOADER_STORAGE_KEY,
)},"1");document.documentElement.setAttribute("data-loader","play")}catch(e){}})();`;
