"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountForms } from "@/components/account-forms";
import {
  ImigongoBand,
  ImigongoMark,
  ImigongoRule,
  ImigongoWatermark,
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
                Wider than the menu's side column: the card is narrow, so the
                side takes the rest of the row rather than leaving a gap in
                the middle. Grid items stretch, so from xl the panel and the
                text column both run the card's full height. */}
            <aside className="flex flex-col gap-8 lg:col-span-7 xl:flex-row xl:gap-10">
              {/* A panel of pattern with one motif at readable size. Desktop
                  only: on a phone the height is worth more to the form. */}
              <div
                aria-hidden
                className="menu-fade border-line relative hidden h-[min(30svh,18rem)] overflow-hidden border lg:block xl:h-auto xl:min-h-[20rem] xl:flex-1"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                <ImigongoWatermark
                  id="imigongo-account-field"
                  motif="lozenge"
                  opacity={0.1}
                  scale={1.2}
                />
                <ImigongoMark
                  motif="nested"
                  className="text-accent absolute right-6 bottom-6 h-20 w-20 xl:right-8 xl:bottom-8 xl:h-28 xl:w-28"
                />
                <p className="text-label text-text-muted bg-surface absolute top-0 left-0 px-4 py-3">
                  Imigongo
                </p>
              </div>

              <div className="flex flex-col gap-8 lg:justify-between xl:w-[18rem] xl:shrink-0">
                <div className="flex flex-col gap-6">
                  <div
                    className="menu-fade flex items-center gap-5"
                    style={{ "--i": 3 } as React.CSSProperties}
                  >
                    {(["zigzag", "spiral", "herringbone"] as const).map(
                      (motif) => (
                        <ImigongoMark
                          key={motif}
                          motif={motif}
                          className="text-text-muted h-8 w-8"
                        />
                      ),
                    )}
                  </div>

                  <p
                    className="menu-fade text-text-muted max-w-[34ch] text-lg leading-snug"
                    style={{ "--i": 4 } as React.CSSProperties}
                  >
                    {accountPage.lede}
                  </p>
                </div>

                {/* The brand's three words, one to a line, as in the menu. */}
                <p className="font-display text-heading text-[clamp(2rem,min(3vw,6svh),3.25rem)] xl:text-[clamp(2.5rem,min(3.6vw,7svh),4rem)]">
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
              </div>
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
