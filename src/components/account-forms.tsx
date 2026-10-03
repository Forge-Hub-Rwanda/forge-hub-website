"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/login/actions";
import { ImigongoRule } from "@/components/imigongo";
import { Magnetic } from "@/components/magnetic";
import { accountPage } from "@/lib/site";

/**
 * The sign-in form on `/login`: one panel, framed as a card in the left
 * column of `AccountScreen`, where the menu's rows sit.
 * Every part carries a `menu-*` class and an `--i` step, so it enters with
 * the menu's rule, rise and fade.
 *
 * Fields follow the contact form — square-cornered and rule-bordered — so the
 * site keeps one input pattern. Unlike the rest of the site, nothing here
 * rolls on hover: the labels and button keep a single, still label.
 *
 * Submits to the `signIn` server action, which checks the password against
 * Supabase Auth and the email against the `admins` allowlist, then redirects
 * to `/admin`. There is no sign-up here: admins are created directly in
 * Supabase by an existing admin.
 */

const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-2 w-full border px-4 py-2.5 text-base transition-colors hover:border-text focus:border-text";

/** One accent bracket per corner of the card, like the ticks on a frame. */
const CORNERS = [
  "-top-px -left-px border-t-2 border-l-2",
  "-top-px -right-px border-t-2 border-r-2",
  "-bottom-px -left-px border-b-2 border-l-2",
  "-bottom-px -right-px border-b-2 border-r-2",
];

const initial: SignInState = { status: "idle" };

export function AccountForms() {
  const [state, action, pending] = useActionState(signIn, initial);
  const copy = accountPage.signIn;
  const errors = state.errors ?? {};

  return (
    // A framed card, so the form reads apart from the design and motto beside
    // it: a mid-strength rule, a raised surface and accent brackets at the
    // corners. Kept narrow on purpose — two fields need no more.
    <div
      className="menu-fade border-line-mid bg-surface-2 relative w-full max-w-[34rem] border p-6 sm:p-8"
      style={{ "--i": 0 } as React.CSSProperties}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={`border-accent pointer-events-none absolute h-4 w-4 ${corner}`}
        />
      ))}

      <p
        className="menu-fade text-label text-text-muted flex items-center gap-4"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <ImigongoRule className="text-accent" />
        {accountPage.eyebrow}
      </p>
      {/* Capped by height as well as width, so the card still fits one
          screen on a short laptop. */}
      <h1 className="font-display text-heading text-text mt-4 text-[clamp(1.75rem,min(6vw,4.5svh),2.25rem)]">
        <span className="menu-slot">
          <span
            className="menu-rise"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {copy.heading}
          </span>
        </span>
      </h1>
      <p
        className="menu-fade text-text-muted mt-2 max-w-[42ch] text-base leading-snug"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        {copy.lede}
      </p>

      <form action={action} noValidate className="mt-6 flex flex-col gap-5">
        <div
          className="field menu-fade"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <label htmlFor="email" className="text-label text-text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@forgehubrwanda.com"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={FIELD_CLASS}
          />
          {errors.email && (
            <p id="email-error" className="text-text mt-2 text-sm">
              {errors.email}
            </p>
          )}
        </div>

        <div
          className="field menu-fade"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <label htmlFor="password" className="text-label text-text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={FIELD_CLASS}
          />
          {errors.password && (
            <p id="password-error" className="text-text mt-2 text-sm">
              {errors.password}
            </p>
          )}
        </div>

        <div
          className="menu-fade mt-1 flex flex-col gap-4"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          <Magnetic className="w-fit">
            <button
              type="submit"
              disabled={pending}
              data-cursor={copy.submit}
              className="btn btn-strong w-fit"
            >
              {pending ? "Signing in…" : copy.submit}
            </button>
          </Magnetic>
          {state.status === "error" && state.message && (
            <p
              role="alert"
              className="text-accent max-w-[42ch] text-xs leading-snug font-semibold"
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
