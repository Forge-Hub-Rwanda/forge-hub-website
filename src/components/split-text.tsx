/**
 * Typographic motion primitives: text split into words or letters so each
 * piece can move on its own, and the "roll" — a label that slides up out of
 * its own slot on hover while an identical copy slides in beneath it.
 *
 * Everything here is a server component and renders plain spans. None of it
 * moves anything by itself: the choreography is all in globals.css, triggered
 * by whatever the text sits inside — a `Reveal` becoming shown, a link being
 * hovered, the page loading. Written this way the pieces work in any context
 * without each placement needing its own client script.
 *
 * ACCESSIBILITY. Text chopped into per-letter spans is read out letter by
 * letter by some screen readers, so wherever a word is split the real string
 * is also rendered once, visually hidden, and the split copy is `aria-hidden`.
 * Assistive technology meets the sentence exactly once, intact.
 */

/**
 * Words that rise out of their own line on a tilt — the entrance lusion.co
 * gives every headline. Each word is clipped by its own box, so it appears to
 * spring up from a slot rather than fading in.
 *
 * `mode` picks the trigger:
 *   - "load"   — plays on page load, for hero copy that is on screen at once.
 *   - "reveal" — plays when the nearest `Reveal` ancestor is shown.
 *   - "scrub"  — each word's colour is driven by a `Scrub` ancestor's `--p`,
 *                inking the sentence in as it is scrolled through.
 */
export function SplitWords({
  text,
  mode = "reveal",
  className,
}: {
  text: string;
  mode?: "load" | "reveal" | "scrub";
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        className={`split split-${mode} ${className ?? ""}`}
        style={{ "--n": words.length } as React.CSSProperties}
      >
        {words.map((word, index) => (
          // The trailing space is a real text node between the boxes, so the
          // line still breaks between words exactly where it did unsplit.
          <span key={`${word}-${index}`}>
            <span
              className="split-word"
              style={{ "--i": index } as React.CSSProperties}
            >
              <span className="split-inner">{word}</span>
            </span>{" "}
          </span>
        ))}
      </span>
    </>
  );
}

/**
 * The same tilted rise, one letter at a time. For single-word display lines,
 * where there is only one word to move.
 *
 * Letters are inline-block, which costs the pair kerning between them. That
 * is why this is kept to the short page titles rather than used on sentences:
 * across a word or two the loss is invisible at display size.
 */
export function SplitLetters({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`split split-load ${className ?? ""}`}>
        {Array.from(text).map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="split-word"
            style={{ "--i": index } as React.CSSProperties}
          >
            <span className="split-inner">{letter === " " ? " " : letter}</span>
          </span>
        ))}
      </span>
    </>
  );
}

/**
 * A label that rolls on hover: it slides up and out of its slot as a copy of
 * itself slides up into it.
 *
 * The copy is a `text-shadow`, not a second element — so the label is in the
 * document once, a screen reader reads it once, and no markup has to be kept
 * in step. The shadow sits one slot-height below the text and is clipped away
 * at rest; translating the label up by that height brings it into the slot.
 *
 * It rolls when any link, button or `.roll-host` it sits inside is hovered or
 * keyboard-focused. The stylesheet owns that list, so a new placement needs no
 * wiring beyond wrapping the words.
 */
export function RollText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`roll-clip ${className ?? ""}`}>
      <span className="roll">{children}</span>
    </span>
  );
}

/**
 * The roll, one letter at a time with a stagger, so the word ripples through
 * rather than flipping as a block. Lusion's project titles do exactly this.
 *
 * Words stay unbroken boxes so the line still wraps between them, never inside
 * one.
 */
export function RollLetters({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  let letterIndex = 0;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`roll-letters ${className ?? ""}`}>
        {text.split(" ").map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((letter) => {
                const index = letterIndex++;
                return (
                  <span key={index} className="roll-clip">
                    <span
                      className="roll"
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      {letter}
                    </span>
                  </span>
                );
              })}
            </span>{" "}
          </span>
        ))}
      </span>
    </>
  );
}
