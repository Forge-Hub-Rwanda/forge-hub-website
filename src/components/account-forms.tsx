"use client";

import { useState } from "react";
import { ImigongoRule } from "@/components/imigongo";
import { Magnetic } from "@/components/magnetic";
import { RollText } from "@/components/split-text";
import { accountPage } from "@/lib/site";

/**
 * The sign-in / create-account forms on `/login`: two tabs over one panel,
 * framed as a card in the left column of `AccountScreen`, where the menu's
 * rows sit.
 * Every part carries a `menu-*` class and an `--i` step, so it enters with
 * the menu's rule, rise and fade.
 *
 * Fields follow the contact form — square-cornered, rule-bordered, a label
 * that rolls while its input has focus — so the site keeps one input pattern.
 *
 * There is no auth backend yet, so submitting stops here and the note under
 * the button says so plainly rather than pretending anything happened.
 */

type Mode = "signIn" | "signUp";

const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-2 w-full border px-4 py-2.5 text-base transition-colors hover:border-text focus:border-text";

/** One accent bracket per corner of the card, like the ticks on a frame. */
const CORNERS = [
  "-top-px -left-px border-t-2 border-l-2",
  "-top-px -right-px border-t-2 border-r-2",
  "-bottom-px -left-px border-b-2 border-l-2",
  "-bottom-px -right-px border-b-2 border-r-2",
];

const FIELDS = {
  signIn: [
    {
      id: "signin-email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@forgehubrwanda.com",
    },
    {
      id: "signin-password",
      label: "Password",
      type: "password",
      autoComplete: "current-password",
      placeholder: "Your password",
    },
  ],
  signUp: [
    {
      id: "signup-name",
      label: "Full name",
      type: "text",
      autoComplete: "name",
      placeholder: "Your name",
    },
    {
      id: "signup-email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: "you@forgehubrwanda.com",
    },
    {
      id: "signup-password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      placeholder: "At least 8 characters",
    },
  ],
} as const;

const MODES: Mode[] = ["signIn", "signUp"];

export function AccountForms() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [submitted, setSubmitted] = useState(false);
  const copy = accountPage[mode];

  const switchTo = (next: Mode) => {
    setMode(next);
    setSubmitted(false);
  };

  return (
    // A framed card, so the form reads apart from the design and motto beside
    // it: a mid-strength rule, a raised surface and accent brackets at the
    // corners. Kept narrow on purpose — two or three fields need no more.
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

      {/* --- Tabs --- */}
      <div
        role="tablist"
        aria-label="Account"
        className="menu-fade border-line mb-6 flex gap-8 border-b"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {MODES.map((key) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={active}
              aria-controls="account-panel"
              onClick={() => switchTo(key)}
              className={`group relative -mb-px pb-3 text-base font-medium transition-colors ${
                active ? "text-text" : "text-text-muted hover:text-text"
              }`}
            >
              <RollText>{accountPage[key].tab}</RollText>
              {/* The same imigongo zigzag the nav links draw on hover, held on
                  for the tab that is open. */}
              <span
                aria-hidden
                className={`imigongo-underline absolute inset-x-0 bottom-0 h-[5px] bg-current ${
                  active
                    ? "imigongo-underline-on"
                    : "group-hover:imigongo-underline-on"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div id="account-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}>
        <p
          className="menu-fade text-label text-text-muted flex items-center gap-4"
          style={{ "--i": 2 } as React.CSSProperties}
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
              style={{ "--i": 3 } as React.CSSProperties}
            >
              {copy.heading}
            </span>
          </span>
        </h1>
        <p
          className="menu-fade text-text-muted mt-2 max-w-[42ch] text-base leading-snug"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          {copy.lede}
        </p>

        {/* `key` remounts the form on a tab switch, so fields typed into one
            tab never carry over into the other. */}
        <form
          key={mode}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="mt-6 flex flex-col gap-5"
        >
          {FIELDS[mode].map((field, index) => (
            <div
              key={field.id}
              className="field menu-fade"
              style={{ "--i": 5 + index } as React.CSSProperties}
            >
              <label htmlFor={field.id} className="text-label text-text-muted">
                <RollText>{field.label}</RollText>
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                minLength={field.type === "password" ? 8 : undefined}
                required
                className={FIELD_CLASS}
              />
            </div>
          ))}

          <div
            className="menu-fade mt-1 flex flex-col gap-4"
            style={{ "--i": 8 } as React.CSSProperties}
          >
            <Magnetic className="w-fit">
              <button
                type="submit"
                data-cursor={copy.submit}
                className="btn btn-strong w-fit"
              >
                <RollText>{copy.submit}</RollText>
              </button>
            </Magnetic>
            <p
              role="status"
              className={`max-w-[42ch] text-xs leading-snug ${
                submitted ? "text-accent font-semibold" : "text-text-muted"
              }`}
            >
              {accountPage.note}
            </p>
          </div>
        </form>

        <p
          className="menu-fade text-text-muted relative mt-6 pt-5 text-sm"
          style={{ "--i": 9 } as React.CSSProperties}
        >
          <span
            aria-hidden
            className="menu-line bg-line absolute inset-x-0 top-0 h-px"
            style={{ "--i": 9 } as React.CSSProperties}
          />
          {mode === "signIn"
            ? "New to the team? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchTo(mode === "signIn" ? "signUp" : "signIn")}
            className="text-text font-semibold underline-offset-4 hover:underline"
          >
            {mode === "signIn"
              ? accountPage.signUp.tab
              : accountPage.signIn.tab}
          </button>
        </p>
      </div>
    </div>
  );
}
