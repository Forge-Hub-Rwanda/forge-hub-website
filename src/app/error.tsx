"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { errorPage } from "@/lib/site";

/**
 * The route error boundary — an unexpected throw while rendering any page.
 *
 * `retry` rather than `reset`: as of Next 16.3 `retry()` re-fetches and
 * re-renders the boundary's children, where `reset()` only clears the error
 * state without re-fetching. Both exist; the docs are explicit that `retry` is
 * the one to reach for.
 *
 * Error boundaries must be Client Components, so this file stays small and
 * pulls in nothing heavy — no footer, no header, no scroll machinery. Whatever
 * broke may well have been one of those, and a fallback that depends on the
 * thing that failed is not a fallback.
 */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No error reporting service is wired up yet, so the console is the only
    // place a digest can be recovered from to match a server-side log.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col px-6 pt-10 pb-24 lg:px-[3.6vw] lg:pt-12">
      <Link
        href="/"
        className="w-fit transition-opacity hover:opacity-85"
        aria-label="ForgeHub Rwanda, home"
      >
        <Logo className="w-[3.1rem] sm:w-[3.875rem] lg:w-[4.4rem]" />
      </Link>

      <div className="mt-16 lg:mt-24">
        <p className="text-label text-text-muted">{errorPage.eyebrow}</p>

        <h1 className="font-display text-heading text-text mt-6 max-w-[18ch] text-[clamp(2rem,5vw,4rem)]">
          {errorPage.title}
        </h1>

        <p className="text-text-muted mt-8 max-w-[52ch] text-lg leading-snug">
          {errorPage.body}
        </p>

        {/* The digest is the only handle anyone has for matching this to a
            server log, so it is shown rather than hidden — quietly, and only
            when Next actually produced one. */}
        {error.digest ? (
          <p className="text-text-muted mt-4 font-mono text-sm">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => retry()}
            className="btn btn-strong"
          >
            {errorPage.retry}
          </button>
          <Link href="/" className="btn">
            {errorPage.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
