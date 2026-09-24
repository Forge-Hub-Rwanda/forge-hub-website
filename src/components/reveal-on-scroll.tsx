"use client";

import { useEffect, useRef } from "react";

/**
 * Holds its children invisible until the visitor first scrolls, then shows
 * them outright — no transition — and leaves them shown for good.
 *
 * `visibility` rather than `display`, so the space is reserved from the start
 * and nothing below jumps when the content appears. A page that loads already
 * scrolled (a refresh mid-page, an anchor link) reveals straight away, and so
 * does the first Tab press: hidden content cannot take focus, and a keyboard
 * user would otherwise tab straight past the hero's CTAs. Without JavaScript
 * the `noscript` rule keeps everything visible.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Written straight to the node rather than through state: it flips once and
  // never back, so there is nothing for React to re-render.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => {
      node.style.visibility = "visible";
    };

    if (window.scrollY > 0) {
      reveal();
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") reveal();
    };

    window.addEventListener("scroll", reveal, { once: true, passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <noscript>
        <style>{"[data-reveal-on-scroll]{visibility:visible!important}"}</style>
      </noscript>
      <div
        ref={ref}
        data-reveal-on-scroll
        className={className}
        style={{ visibility: "hidden" }}
      >
        {children}
      </div>
    </>
  );
}
