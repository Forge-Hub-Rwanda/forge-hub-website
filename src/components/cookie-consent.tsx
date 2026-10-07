"use client";

import { useSyncExternalStore } from "react";
import { ImigongoRule } from "@/components/imigongo";
import { RollText } from "@/components/split-text";
import {
  clearConsent,
  consentStatus,
  setConsent,
  subscribeConsent,
} from "@/lib/consent";
import { cookieConsent } from "@/lib/legal";

/**
 * The cookie card: a small panel in the bottom-left corner, full width less
 * the page gutter on phones. Shown until the visitor accepts or rejects, and
 * again once that choice expires (see src/lib/consent.ts).
 *
 * Renders nothing on the server: the choice lives in the visitor's storage, so
 * the server cannot know it, and rendering the card there would flash it at
 * everyone who has already chosen.
 *
 * Above the pinned nav (z-60) and below the menu overlay (z-70) and the
 * loader (z-90), so it never covers either. Does not take focus: it is a
 * notice, not a dialog, and the page stays usable while it is open.
 */
export function CookieConsent() {
  const status = useSyncExternalStore(
    subscribeConsent,
    consentStatus,
    () => "pending" as const,
  );

  if (status !== "unset") return null;

  return (
    <section
      aria-labelledby="cookie-consent-title"
      className="consent-card border-line-strong bg-surface text-text fixed inset-x-4 bottom-4 z-65 border p-6 sm:inset-x-auto sm:left-6 sm:max-w-sm lg:left-[3.6vw]"
    >
      <h2
        id="cookie-consent-title"
        className="text-label text-text-muted flex items-center gap-4"
      >
        <ImigongoRule />
        {cookieConsent.eyebrow}
      </h2>
      <p className="mt-4 text-base leading-snug">
        {cookieConsent.body}{" "}
        <a
          href={cookieConsent.link.href}
          className="font-semibold underline underline-offset-4"
        >
          {cookieConsent.link.label}
        </a>
        .
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setConsent(true)}
          className="btn btn-strong"
        >
          <RollText>{cookieConsent.accept}</RollText>
        </button>
        <button type="button" onClick={() => setConsent(false)} className="btn">
          <RollText>{cookieConsent.reject}</RollText>
        </button>
      </div>
    </section>
  );
}

/** On /cookies: forgets the stored choice so the card comes back. */
export function CookieSettingsButton() {
  return (
    <button type="button" onClick={clearConsent} className="btn w-fit">
      <RollText>{cookieConsent.change}</RollText>
    </button>
  );
}
