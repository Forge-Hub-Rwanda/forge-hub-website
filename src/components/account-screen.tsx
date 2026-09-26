"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountForms } from "@/components/account-forms";
import {
  ImigongoBand,
  ImigongoMark,
  ImigongoRule,
} from "@/components/imigongo";
import { ThemeToggle } from "@/components/theme-toggle";
import { accountPage, site } from "@/lib/site";

/**
 * The whole of `/login`: the full-screen menu, with the forms where the rows
 * would be. Same top bar, same 8/4 grid, same sawtooth foot, and the same
 * curtain and stagger — the `menu-*` classes in `globals.css` key off
 * `#account-screen[data-open]` as well as `#site-menu`.
 *
 * It mounts closed and opens on the next frame, so arriving here from the
 * account button plays the menu's opening in full. The close button plays the
 * closing before it leaves for home.
 */

// How long the close curtain takes — `.menu-panel`'s closing transition.
const CLOSE_MS = 450;

export function AccountScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const leave = useCallback(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setOpen(false);
    window.setTimeout(() => router.push("/"), reduced ? 0 : CLOSE_MS);
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leave]);

  const onClose = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Leave modified clicks alone, so "open in new tab" still behaves.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    leave();
  };

  return (
    <div id="account-screen" data-open={open} className="fixed inset-0 z-70">
      <div aria-hidden className="menu-veil" />

      <div data-lenis-prevent className="menu-panel">
        <div className="mx-auto flex min-h-full max-w-[110rem] flex-col px-6 lg:px-10">
          {/* --- Top bar --- */}
          <div className="flex h-16 shrink-0 items-center justify-between lg:h-20">
            <p
              className="menu-fade text-label text-text-muted flex items-center gap-3"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              <ImigongoRule className="text-accent" />
              {accountPage.title}
            </p>

            <div className="flex items-center gap-4 lg:gap-6">
              <ThemeToggle className="flex" />

              <Link
                href="/"
                onClick={onClose}
                className="text-text -mr-1.5 flex h-11 w-11 items-center justify-center transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] hover:rotate-90 hover:opacity-70"
              >
                <span className="sr-only">Close and return to home</span>
                <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
                  <path
                    d="M5 5l14 14M19 5L5 19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <main className="flex flex-1 flex-col justify-between gap-12 pb-6 lg:grid lg:grid-cols-12 lg:content-center lg:gap-x-12 lg:pb-8 xl:gap-x-16">
            {/* --- The form, where the menu's rows sit --- */}
            <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center">
              <AccountForms />
            </div>

            {/* --- The side, the foot below lg ---
                Wider than the menu's side column, so the narrow card leaves
                no gap in the middle. Type carries it rather than a large
                pattern: a rule sets it off from the form, small framed motifs
                and the tagline sit at the top, the motto fills the foot. Grid
                items stretch, so the column runs the card's full height. */}
            <aside className="lg:border-line flex flex-col justify-between gap-10 lg:col-span-7 lg:border-l lg:pl-12 xl:pl-16">
              <div className="flex flex-col gap-6">
                <ul
                  aria-hidden
                  className="menu-fade flex gap-3"
                  style={{ "--i": 2 } as React.CSSProperties}
                >
                  {(
                    ["zigzag", "lozenge", "spiral", "herringbone"] as const
                  ).map((motif, index) => (
                    <li
                      key={motif}
                      className="border-line flex h-12 w-12 items-center justify-center border"
                    >
                      <ImigongoMark
                        motif={motif}
                        className={`h-6 w-6 ${
                          index === 1 ? "text-accent" : "text-text-muted"
                        }`}
                      />
                    </li>
                  ))}
                </ul>

                <p
                  className="menu-fade text-text-muted max-w-[34ch] text-lg leading-snug"
                  style={{ "--i": 3 } as React.CSSProperties}
                >
                  {accountPage.lede}
                </p>
              </div>

              {/* The brand's three words, one to a line, as in the menu —
                  larger here, where they have the column to themselves. */}
              <p className="font-display text-heading text-[clamp(2.25rem,min(4.5vw,7svh),3.5rem)] lg:text-[clamp(2.75rem,min(5.5vw,10svh),5.5rem)]">
                {site.tagline.map((word, index) => (
                  <span key={word} className="menu-slot">
                    <span
                      className={`menu-rise ${
                        index === site.tagline.length - 1
                          ? "text-accent"
                          : "text-text-muted"
                      }`}
                      style={{ "--i": 8 + index } as React.CSSProperties}
                    >
                      {word}.
                    </span>
                  </span>
                ))}
              </p>
            </aside>
          </main>

          {/* The same sawtooth banding that closes the menu. */}
          <div
            aria-hidden
            className="menu-line text-text shrink-0"
            style={{ "--i": 12 } as React.CSSProperties}
          >
            <ImigongoBand id="account-band" opacity={0.18} />
          </div>
        </div>
      </div>
    </div>
  );
}
