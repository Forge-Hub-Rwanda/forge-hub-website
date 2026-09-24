"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure that rolls into place digit by digit, like a mechanical counter —
 * the same counter lusion.co runs on its loader and its team index.
 *
 * Each digit is a column of 0–9 stacked vertically inside a one-character
 * window; showing the figure is translating each column to its own digit, with
 * the columns staggered so the number settles from left to right. Anything
 * that is not a digit ("ALU", "Soon") has no column to spin through, so it
 * rises into its window from below instead.
 *
 * The real value is in the document once, visually hidden, and the columns are
 * `aria-hidden`: a screen reader reads "2026", never "0123456789" four times.
 *
 * Like `Reveal`, this component only decides WHEN — it sets `data-shown` once
 * the figure is on screen, and globals.css does the rest. With scripting
 * unavailable the noscript rule in the root layout parks every column on its
 * final digit, so the figure still reads correctly.
 */

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function Odometer({
  value,
  className,
  /** Play as soon as it mounts rather than waiting to be scrolled to. */
  immediate = false,
}: {
  value: string;
  className?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Deferred a frame either way, so the columns paint once at rest and the
    // transition then has a starting state to leave from.
    if (immediate || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <span ref={ref} className={`odo ${className ?? ""}`} data-shown={shown}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="odo-row">
        {Array.from(value).map((char, index) => {
          const digit = DIGITS.indexOf(char);
          const style = {
            "--i": index,
            "--to": digit < 0 ? 0 : digit,
          } as React.CSSProperties;

          return (
            <span key={index} className="odo-window">
              {digit < 0 ? (
                <span className="odo-col odo-glyph" style={style}>
                  {char === " " ? " " : char}
                </span>
              ) : (
                <span className="odo-col" style={style}>
                  {DIGITS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
