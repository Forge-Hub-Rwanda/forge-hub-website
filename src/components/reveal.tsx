"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Reveals its children once they scroll into view.
 *
 * A single IntersectionObserver per instance, disconnected the moment it has
 * fired — these are one-shot entrances, so there is no reason to keep watching
 * an element that has already played. Elements that never intersect (because
 * the browser lacks support) are shown immediately.
 */
type RevealProps = {
  children: ReactNode;
  /** Stagger, in milliseconds, applied via the `--delay` custom property. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Extra inline style, merged under `--delay`. */
  style?: React.CSSProperties;
};

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer support: show the content outright rather than leaving it
    // permanently hidden. Deferred by a frame because setting state
    // synchronously inside an effect body triggers a cascading render.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const { top, bottom } = entry.boundingClientRect;
        const viewport = window.innerHeight;

        // Fire a little before the element is fully on screen, so the motion
        // reads as the page arriving rather than as a delayed reaction. This
        // is the original 12%-of-viewport lead, expressed as a position test
        // rather than a negative root margin.
        //
        // The second clause is not redundant. An element sitting within that
        // 12% of the END of the document can never satisfy the first test —
        // the page runs out of scroll before its top edge gets that high — so
        // on a margin alone the last line or two of a page stays at opacity 0
        // forever. Treating "already fully on screen" as qualifying covers it.
        if (top > viewport * 0.88 && bottom > viewport) return;

        setShown(true);
        observer.disconnect();
      },
      // Several thresholds rather than one, so the callback runs again as the
      // element travels in: at first contact neither test above is met yet.
      { threshold: [0, 0.1, 0.5, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      className={`reveal ${className ?? ""}`}
      style={{ ...style, "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
