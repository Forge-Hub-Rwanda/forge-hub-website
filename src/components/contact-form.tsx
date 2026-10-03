"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { Magnetic } from "@/components/magnetic";
import { RollText } from "@/components/split-text";

const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-3 w-full border px-4 py-3 text-lg transition-colors hover:border-text focus:border-text";

const initial: ContactState = { status: "idle" };

type Props = { submit: string; note: string };

export function ContactForm({ submit, note }: Props) {
  const [state, action, pending] = useActionState(sendMessage, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="border-line bg-surface-2 border p-8">
        <p className="text-text text-lg font-semibold">Message sent.</p>
        <p className="text-text-muted mt-2">
          Thank you. We read everything that comes in and will reply soon.
        </p>
      </div>
    );
  }

  const errors = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="field">
        <label htmlFor="name" className="text-label text-text-muted">
          <RollText>Name</RollText>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          maxLength={120}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={FIELD_CLASS}
        />
        {errors.name && (
          <p id="name-error" className="text-text mt-2 text-sm">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="email" className="text-label text-text-muted">
          <RollText>Email</RollText>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
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
        <label htmlFor="message" className="text-label text-text-muted">
          <RollText>Message</RollText>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="What are you building, or what would you like to learn?"
          required
          maxLength={5000}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${FIELD_CLASS} resize-y leading-snug`}
        />
        {errors.message && (
          <p id="message-error" className="text-text mt-2 text-sm">
            {errors.message}
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-text text-sm">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <Magnetic className="w-fit">
          <button
            type="submit"
            disabled={pending}
            data-cursor="Send"
            className="btn btn-strong w-fit"
          >
            <RollText>{pending ? "Sending…" : submit}</RollText>
          </button>
        </Magnetic>
        <p className="text-text-muted max-w-[42ch] text-sm leading-snug">
          {note}
        </p>
      </div>
    </form>
  );
}
