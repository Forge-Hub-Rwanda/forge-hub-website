import { Reveal } from "@/components/reveal";

/**
 * Standard section opener: small uppercase eyebrow, oversized upright title,
 * optional lede. Shared so every band on the page keeps the same rhythm.
 */
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional link rendered opposite the title on wide screens. */
  action?: { label: string; href: string };
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-14 lg:mb-20">
      <Reveal>
        <p className="text-label text-text-muted flex items-center gap-4">
          <span aria-hidden className="bg-text h-px w-8" />
          {eyebrow}
        </p>
      </Reveal>

      {/* A grid rather than flex: as flex children these two columns shrink
          below their content width, which collapses the title to one word per
          line. Explicit column spans keep both at a fixed share. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Reveal delay={80} className="lg:col-span-7">
          <h2 className="font-display text-heading text-text text-[clamp(2rem,4.6vw,4rem)]">
            {title}
          </h2>
        </Reveal>

        {lede ? (
          <Reveal delay={160} className="lg:col-span-5">
            <p className="text-text-muted text-lg leading-snug">{lede}</p>
          </Reveal>
        ) : null}
      </div>

      {action ? (
        <Reveal delay={220}>
          <a
            href={action.href}
            className="group text-text mt-8 inline-flex items-center gap-3 font-bold"
          >
            {action.label}
            <span className="bg-text text-text-invert flex h-8 w-8 items-center justify-center transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M4 12h15m0 0-6-6m6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Shared page gutter and max width, so every band lines up vertically. */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`px-6 py-24 lg:px-[3.6vw] lg:py-36 ${className ?? ""}`}
    >
      <div className="mx-auto max-w-[110rem]">{children}</div>
    </section>
  );
}
