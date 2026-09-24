/**
 * Whether a real mouse (or pen) is in use, decided from the input itself
 * rather than from a media query.
 *
 * `(hover: hover)` and `(pointer: fine)` cannot be trusted for this. Windows
 * touchscreen laptops report `hover: none` and `pointer: coarse` in Chrome and
 * Edge even with a mouse or trackpad attached — the same problem the note at
 * the top of globals.css describes for hover styles — so a pointer-only effect
 * gated on those queries simply never runs on the laptops this site is most
 * often read on. A `pointermove` whose `pointerType` is "mouse" is proof; a
 * phone never sends one.
 */

/** True for a pointer event that came from a mouse or a pen. */
export const isFinePointer = (event: PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

/**
 * Runs `callback` once, on the first mouse or pen movement. Returns a cleanup
 * that removes the listener if it has not fired yet.
 */
export function onFirstFinePointer(callback: (event: PointerEvent) => void) {
  const listener = (event: PointerEvent) => {
    if (!isFinePointer(event)) return;
    window.removeEventListener("pointermove", listener);
    callback(event);
  };
  window.addEventListener("pointermove", listener, { passive: true });
  return () => window.removeEventListener("pointermove", listener);
}
