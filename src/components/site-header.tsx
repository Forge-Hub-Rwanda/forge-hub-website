"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { hero, navItems } from "@/lib/site";

/**
 * Sticky site header.
 *
 * Transparent over the hero, then it picks up a blurred bar and a hairline
 * rule once the page scrolls so the links stay anchored against the content
 * moving underneath.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-line bg-surface/85 border-b backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[92rem] items-center justify-between gap-6 px-6 lg:px-10">
        <a
          href="#top"
          className="text-text shrink-0 transition-opacity hover:opacity-70"
        >
          {/* The full lockup needs horizontal room; below `sm` the glyph alone
              carries the brand without crowding the hamburger. */}
          <Logo variant="mark" className="h-9 w-auto sm:hidden" />
          <Logo className="hidden h-9 w-auto sm:block" />
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group text-text-muted hover:text-text relative block px-4 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                  {/* Underline draws in from the left on hover. */}
                  <span className="bg-accent absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={hero.primaryCta.href}
            className="bg-text text-text-invert hover:bg-accent hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 sm:block"
          >
            {hero.primaryCta.label}
          </a>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="border-line text-text flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border lg:hidden"
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="border-line bg-surface/95 border-t backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="px-6 py-4">
          <ul className="divide-line divide-y">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col gap-1 py-4"
                >
                  <span className="font-display text-text text-2xl font-medium">
                    {item.label}
                  </span>
                  {item.blurb ? (
                    <span className="text-text-muted text-sm">
                      {item.blurb}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={hero.primaryCta.href}
            onClick={() => setMenuOpen(false)}
            className="bg-text text-text-invert mt-5 mb-2 block rounded-full px-5 py-3.5 text-center font-semibold"
          >
            {hero.primaryCta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
