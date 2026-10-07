/**
 * The visitor's cookie choice, kept in localStorage under one key.
 *
 * Nothing optional runs on the site yet: every item on /cookies is strictly
 * necessary. The choice is recorded now so that analytics, when it is added,
 * has a consent signal to wait on from day one. Gate any such script on
 * `hasAnalyticsConsent()`, and listen for `CONSENT_EVENT` to start it the
 * moment a visitor accepts without a reload.
 *
 * A choice expires after twelve months, after which the card asks again.
 */

export const CONSENT_STORAGE_KEY = "forgehub-consent";
export const CONSENT_EVENT = "forgehub:consent";

const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

type StoredConsent = { analytics: boolean; at: number };

/** `unset` means no valid choice is stored, so the card should show. */
export type ConsentStatus = "accepted" | "rejected" | "unset";

/** Holds the choice for this page view when storage is unavailable. */
let fallback: StoredConsent | null = null;

function read(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.at !== "number")
      return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    return { analytics: parsed.analytics, at: parsed.at };
  } catch {
    // Storage blocked (private mode, strict settings): use whatever was
    // chosen during this page view, if anything.
    return fallback;
  }
}

export function consentStatus(): ConsentStatus {
  const stored = read();
  if (!stored) return "unset";
  return stored.analytics ? "accepted" : "rejected";
}

export function hasAnalyticsConsent(): boolean {
  return read()?.analytics === true;
}

function announce() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function setConsent(analytics: boolean) {
  fallback = { analytics, at: Date.now() };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fallback));
  } catch {
    // Storage unavailable: the choice holds for this page view only.
  }
  announce();
}

/** Forgets the choice, which brings the card back. */
export function clearConsent() {
  fallback = null;
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Nothing stored to clear.
  }
  announce();
}

/** For `useSyncExternalStore`: this tab's changes, and other tabs'. */
export function subscribeConsent(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
