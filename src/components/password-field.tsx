"use client";

import { useState } from "react";

type Props = {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  className: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/**
 * A password input with a reveal toggle. The eye icon only shows while the
 * field is focused, so it stays out of the way otherwise — a plain password
 * box until someone actually clicks in to type.
 */
export function PasswordField({ className, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${className} pr-11`}
      />
      {focused && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-text-muted hover:text-text absolute inset-y-0 right-0 flex w-11 items-center justify-center"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {visible ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                <path d="M9.88 5.09A9.77 9.77 0 0 1 12 5c6 0 9.5 6 9.5 6a16.3 16.3 0 0 1-3.1 3.9M6.6 6.6C3.9 8.3 2.5 11 2.5 11s3.5 6 9.5 6a9.7 9.7 0 0 0 2.28-.27" />
              </>
            ) : (
              <>
                <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
