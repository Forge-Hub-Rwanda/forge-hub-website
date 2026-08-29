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
};

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
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
        setShown(true);
        observer.disconnect();
      },
      // Fire a little before the element is fully on screen, so the motion
      // reads as the page arriving rather than as a delayed reaction.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      className={`reveal ${className ?? ""}`}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
