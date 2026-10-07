"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Unsaved-work protection for the admin forms.
 *
 * Every edit to a form is saved to this browser's `localStorage` as you type,
 * and restored when the form is opened again — after a page reload, a closed
 * tab, or a sign-out and sign-in. It is cleared once the form has been saved.
 *
 * Two things made this necessary rather than nice-to-have:
 *  - Signing out (or being signed out) loses whatever was typed.
 *  - React resets a form after its action runs, success or not. So a save that
 *    failed — "Not authorized.", a validation message — used to wipe the form
 *    back to its saved values. The `reset` listener below puts the draft back.
 *
 * File inputs (photos, cover images) cannot be stored and must be re-chosen.
 *
 * ## How "saved" is detected
 *
 * Every successful save redirects to a different page. On submit the form
 * records `{ key, from: <this page> }` in `sessionStorage`; `DraftJanitor`, in
 * the admin layout, clears that draft as soon as the admin is on any other
 * admin page. A save that fails returns to the same page, and the form drops
 * the marker, so its draft survives.
 */

const PREFIX = "forgehub-draft:";
const PENDING = "forgehub-draft-pending";

type Draft = Record<string, string | boolean>;
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Storage can be blocked (private mode, site data cleared): never throw. */
const storage = {
  get(area: Storage | undefined, key: string) {
    try {
      return area?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(area: Storage | undefined, key: string, value: string) {
    try {
      area?.setItem(key, value);
    } catch {
      // Full or blocked — the form still works, just without a draft.
    }
  },
  remove(area: Storage | undefined, key: string) {
    try {
      area?.removeItem(key);
    } catch {
      // Nothing to do.
    }
  },
};

const local = () => (typeof window === "undefined" ? undefined : localStorage);
const session = () =>
  typeof window === "undefined" ? undefined : sessionStorage;

const SKIP = new Set(["file", "hidden", "submit", "button", "password"]);

function fieldsOf(form: HTMLFormElement): Field[] {
  return Array.from(form.elements).filter(
    (el): el is Field =>
      (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement) &&
      Boolean(el.name) &&
      !SKIP.has(el.type),
  );
}

function readForm(form: HTMLFormElement): Draft {
  const draft: Draft = {};
  for (const field of fieldsOf(form)) {
    draft[field.name] =
      field instanceof HTMLInputElement && field.type === "checkbox"
        ? field.checked
        : field.value;
  }
  return draft;
}

function applyDraft(form: HTMLFormElement, draft: Draft) {
  for (const field of fieldsOf(form)) {
    if (!(field.name in draft)) continue;
    const value = draft[field.name];
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.checked = Boolean(value);
    } else {
      field.value = String(value);
    }
  }
}

function loadDraft(storageKey: string): Draft | null {
  const raw = storage.get(local(), storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

/* Which forms are showing a restored draft — a tiny external store, so the
   notice can appear without setting React state inside an effect. */
const restored = new Set<string>();
const listeners = new Set<() => void>();
function setRestored(key: string, on: boolean) {
  if (on) restored.add(key);
  else restored.delete(key);
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Wire a form to its draft. `key` identifies the record, e.g. `event:new` or
 * `event:<id>`; `state` is the form's `useActionState` state.
 */
export function useFormDraft(key: string, state: { status: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const discarding = useRef(false);
  const storageKey = PREFIX + key;

  const isRestored = useSyncExternalStore(
    subscribe,
    () => restored.has(key),
    () => false,
  );

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const draft = loadDraft(storageKey);
    if (draft) {
      applyDraft(form, draft);
      setRestored(key, true);
    }

    let timer: number | undefined;
    const saveNow = () => {
      window.clearTimeout(timer);
      timer = undefined;
      storage.set(local(), storageKey, JSON.stringify(readForm(form)));
    };
    const saveSoon = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(saveNow, 300);
    };
    const onSubmit = () => {
      saveNow();
      storage.set(
        session(),
        PENDING,
        JSON.stringify({ key: storageKey, from: window.location.pathname }),
      );
    };
    // React resets the form after every action. Put the draft back afterwards
    // unless the reset was the admin discarding it.
    const onReset = () => {
      if (discarding.current) {
        discarding.current = false;
        return;
      }
      window.setTimeout(() => {
        const saved = loadDraft(storageKey);
        if (saved) applyDraft(form, saved);
      }, 0);
    };

    form.addEventListener("input", saveSoon);
    form.addEventListener("change", saveSoon);
    form.addEventListener("submit", onSubmit);
    form.addEventListener("reset", onReset);
    return () => {
      // Leaving mid-pause: keep the last keystrokes.
      if (timer !== undefined) saveNow();
      form.removeEventListener("input", saveSoon);
      form.removeEventListener("change", saveSoon);
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("reset", onReset);
      setRestored(key, false);
    };
  }, [key, storageKey]);

  // A failed save stays on this page; keep its draft.
  useEffect(() => {
    if (state.status === "error") storage.remove(session(), PENDING);
  }, [state]);

  const discard = () => {
    storage.remove(local(), storageKey);
    setRestored(key, false);
    discarding.current = true;
    formRef.current?.reset();
  };

  return { formRef, restored: isRestored, discard };
}

/** Shown at the top of a form whose unsaved changes were restored. */
export function DraftNotice({
  restored,
  onDiscard,
}: {
  restored: boolean;
  onDiscard: () => void;
}) {
  if (!restored) return null;
  return (
    <div
      role="status"
      className="border-accent bg-surface-2 flex flex-wrap items-center justify-between gap-3 border-l-2 px-4 py-3 text-sm"
    >
      <span className="text-text">
        Your unsaved changes from earlier have been restored.
      </span>
      <button
        type="button"
        onClick={onDiscard}
        className="text-text-muted hover:text-text font-medium underline-offset-4 hover:underline"
      >
        Discard them
      </button>
    </div>
  );
}

/**
 * A form's error line. "Not authorized." means the session ended while the
 * form was open, so say that plainly and offer the way back — the draft is
 * already safe.
 */
export function FormError({ message }: { message?: string }) {
  const pathname = usePathname();
  if (!message) return null;

  if (message === "Not authorized.") {
    return (
      <p role="alert" className="text-accent text-sm">
        You&apos;ve been signed out. Your changes are saved in this browser —{" "}
        <a
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="font-semibold underline underline-offset-4"
        >
          sign in again
        </a>{" "}
        to carry on.
      </p>
    );
  }

  return (
    <p role="alert" className="text-accent text-sm">
      {message}
    </p>
  );
}

/** Clears a form's draft once its save has navigated to another page. */
export function DraftJanitor() {
  const pathname = usePathname();

  useEffect(() => {
    const raw = storage.get(session(), PENDING);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { key: string; from: string };
      if (pending.from === pathname) return;
      storage.remove(local(), pending.key);
    } catch {
      // Unreadable marker — just drop it.
    }
    storage.remove(session(), PENDING);
  }, [pathname]);

  return null;
}
