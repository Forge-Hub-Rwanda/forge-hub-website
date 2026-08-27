# ForgeHub Rwanda — Website

Marketing site for ForgeHub Rwanda. **Build · Innovate · Empower**

Currently implements the hero / above-the-fold landing experience.

## Stack

| Concern   | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling   | Tailwind CSS v4 (CSS-first `@theme` tokens)   |
| Type      | Outfit (display) + Plus Jakarta Sans (body)   |
| Tooling   | ESLint, Prettier, TypeScript strict           |

> Next.js and Vite are alternative build setups — this project uses Next.js, so
> there is no Vite config. Next.js was chosen for server rendering and SEO,
> which a public marketing site depends on.

## Getting started

```bash
npm ci
npm run dev      # http://localhost:3000
```

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
npm run verify       # typecheck + lint + format check + build (what CI runs)
```

## Theming

Every colour in the site resolves from one `@theme` block in
[`src/app/globals.css`](src/app/globals.css). Tokens are named by **role**, not
by hue:

| Role                                     | Purpose                   |
| ---------------------------------------- | ------------------------- |
| `surface`, `surface-2`, `line`           | Backgrounds and hairlines |
| `text`, `text-muted`, `text-invert`      | Foreground type           |
| `accent`, `accent-strong`, `accent-soft` | Brand accent              |

No component names a hue, so re-theming — including inverting to a dark
theme — is an edit to the semantic block alone. The current palette is
"Kigali Teal": deep teal accent on warm off-white with near-black type.

## Content

Hero copy, navigation, stats and partner names live in
[`src/lib/site.ts`](src/lib/site.ts).

⚠️ **The stats and partner names in that file are placeholders** chosen to fill
the layout. Replace them with real ForgeHub figures before this goes public.

## Structure

```
src/
  app/
    globals.css          design tokens, base styles, keyframes
    layout.tsx           fonts, metadata, skip link
    page.tsx             composes the landing page
  components/
    hero.tsx             above-the-fold section
    hero-backdrop.tsx    layered background (accepts an optional photo)
    site-header.tsx      sticky nav + mobile drawer
    partner-marquee.tsx  looping partner strip
    logo.tsx             inline SVG lockup
  lib/
    site.ts              all copy and content
```

## Adding hero photography

`HeroBackdrop` accepts an optional image and applies the same overlays on top,
so a photograph slots in without changing the composition:

```tsx
<HeroBackdrop image={{ src: "/hero.jpg", alt: "" }} />
```

## Notes

- The logo is a faithful-in-spirit SVG reconstruction pairing an
  imigongo-inspired pattern column with the angular FH monogram. Drop the
  official vector into `src/components/logo.tsx` when available; nothing else
  needs to change.
- Motion respects `prefers-reduced-motion`.
- The layout is keyboard navigable with a skip link and visible focus rings.
