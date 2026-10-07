"use client";

import { useState, useSyncExternalStore } from "react";
import { useActionState } from "react";
import {
  signIn,
  signUp,
  type SignInState,
  type SignUpState,
} from "@/app/login/actions";
import { ImigongoRule } from "@/components/imigongo";
import { Magnetic } from "@/components/magnetic";
import { PasswordField } from "@/components/password-field";
import { accountPage } from "@/lib/site";

/**
 * The sign-in / sign-up forms on `/login`: one panel, framed as a card in the
 * left column of `AccountScreen`, where the menu's rows sit.
 * Every part carries a `menu-*` class and an `--i` step, so it enters with
 * the menu's rule, rise and fade.
 *
 * Fields follow the contact form — square-cornered and rule-bordered — so the
 * site keeps one input pattern. Unlike the rest of the site, nothing here
 * rolls on hover: the labels and button keep a single, still label.
 *
 * Sign-in submits to the `signIn` server action, which checks the password
 * against Supabase Auth and the email against the `admins` allowlist, then
 * redirects to the `?next=` admin page if there is one (the page the person
 * was on when their session ended), else `/admin`. Sign-up submits to
 * `signUp`, which only creates a
 * Supabase Auth account — it does not add the email to `admins`, so a fresh
 * account still needs an existing admin to grant it access from
 * Admin → Admins before it can sign in and reach `/admin`.
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

const signInInitial: SignInState = { status: "idle" };
const signUpInitial: SignUpState = { status: "idle" };

export function AccountForms() {
  const [tab, setTab] = useState<"signIn" | "signUp">("signIn");

  return (
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

      <div
        className="menu-fade mt-4 flex gap-6"
        style={{ "--i": 2 } as React.CSSProperties}
        role="tablist"
      >
        {(["signIn", "signUp"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`text-label pb-1 ${
              tab === key
                ? "text-text border-accent border-b-2"
                : "text-text-muted"
            }`}
          >
            {accountPage[key].tab}
          </button>
        ))}
      </div>

      {tab === "signIn" ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}

/**
 * The `?next=` page from the URL, read on the client so `/login` can stay a
 * static page. Empty on the server, which is harmless: the field only matters
 * once someone submits.
 */
const noSubscribe = () => () => {};
const readNext = () =>
  new URLSearchParams(window.location.search).get("next") ?? "";

function SignInForm() {
  const [state, action, pending] = useActionState(signIn, signInInitial);
  const copy = accountPage.signIn;
  const errors = state.errors ?? {};
  // Where to return after signing in; `signIn` only accepts `/admin` paths.
  const next = useSyncExternalStore(noSubscribe, readNext, () => "");

  return (
    <>
      {/* Capped by height as well as width, so the card still fits one
          screen on a short laptop. */}
      <h1 className="font-display text-heading text-text mt-4 text-[clamp(1.75rem,min(6vw,4.5svh),2.25rem)]">
        {copy.heading}
      </h1>
      <p className="text-text-muted mt-2 max-w-[42ch] text-base leading-snug">
        {copy.lede}
      </p>

      <form action={action} noValidate className="mt-6 flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <div className="field">
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

        <div className="field">
          <label htmlFor="password" className="text-label text-text-muted">
            Password
          </label>
          <PasswordField
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
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

        <div className="mt-1 flex flex-col gap-4">
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
    </>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, signUpInitial);
  const copy = accountPage.signUp;
  const errors = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="mt-4" role="status">
        <h1 className="font-display text-heading text-text text-[clamp(1.75rem,min(6vw,4.5svh),2.25rem)]">
          Account created
        </h1>
        <p className="text-text-muted mt-2 max-w-[42ch] text-base leading-snug">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-heading text-text mt-4 text-[clamp(1.75rem,min(6vw,4.5svh),2.25rem)]">
        {copy.heading}
      </h1>
      <p className="text-text-muted mt-2 max-w-[42ch] text-base leading-snug">
        {copy.lede}
      </p>

      <form action={action} noValidate className="mt-6 flex flex-col gap-5">
        <div className="field">
          <label htmlFor="signup-email" className="text-label text-text-muted">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@forgehubrwanda.com"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className={FIELD_CLASS}
          />
          {errors.email && (
            <p id="signup-email-error" className="text-text mt-2 text-sm">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label
            htmlFor="signup-password"
            className="text-label text-text-muted"
          >
            Password
          </label>
          <PasswordField
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            className={FIELD_CLASS}
          />
          {errors.password && (
            <p id="signup-password-error" className="text-text mt-2 text-sm">
              {errors.password}
            </p>
          )}
        </div>

        <div className="field">
          <label
            htmlFor="confirm-password"
            className="text-label text-text-muted"
          >
            Confirm password
          </label>
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Type it again"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            className={FIELD_CLASS}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-text mt-2 text-sm">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="mt-1 flex flex-col gap-4">
          <Magnetic className="w-fit">
            <button
              type="submit"
              disabled={pending}
              data-cursor={copy.submit}
              className="btn btn-strong w-fit"
            >
              {pending ? "Creating…" : copy.submit}
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
    </>
  );
}
