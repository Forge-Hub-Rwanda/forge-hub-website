# Motion pass: what changed, and how to go back

This pass adds scroll and hover motion adapted from techniques studied on lusion.co. The page layout is unchanged: every effect moves or recolours what was already there, and adds no sections.

- **Branch:** `2026.09_forgehub-motion_DEV_claude`
- **Default (pre-motion) state:** commit `696da38`, titled "Baseline: site as it stood before the motion pass". It is the site exactly as it stood on `main`, including the staged work, before any of this.

---

## Going back to default

| You want to…                                    | Do this                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Undo **everything**                             | `git checkout main`. `main` was never touched. Or, on this branch, run `git revert <motion commit>`. |
| Get the old site's files back on this branch    | `git restore --source=696da38 --staged --worktree -- src` (this also deletes the new files)          |
| Undo **one file**                               | `git checkout 696da38 -- <path>` (paths are listed below)                                            |
| Switch off **one effect** without touching code | See [Switching single effects off](#switching-single-effects-off)                                    |

Everything added to `src/app/globals.css` sits in one block, which starts at the heading **"Motion pass — techniques studied on lusion.co"** and runs down to **"Reduced motion"**. The reduced-motion block also has an addition, headed "The motion pass". The only other CSS edits are:

- the new `--ease-roll` token in `@theme`;
- the `btn` and `btn-invert` utilities, whose hover fill now rises from the bottom instead of switching on.

---

## New files (delete these to remove the feature entirely)

| File                                 | What it is                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `src/components/scrub.tsx`           | `Scrub`, which writes scroll progress `--p` (0→1) and sets `data-scrub="true"`. Every scrubbed effect runs through it. |
| `src/components/split-text.tsx`      | `SplitWords`, `SplitLetters`, `RollText` and `RollLetters`: tilted word rise, hover text roll and letter ripple.       |
| `src/components/odometer.tsx`        | Rolling-digit counter (Impact figures, team tags, the 404).                                                            |
| `src/components/cursor-label.tsx`    | Contextual cursor pill ("View", "Join", "Hello", "Send") and the turning lozenge on Services rows.                     |
| `src/components/magnetic.tsx`        | Primary buttons lean up to 6px toward the mouse.                                                                       |
| `src/components/scroll-progress.tsx` | Imigongo zigzag progress line along the top edge of the window.                                                        |
| `src/components/forge-loader.tsx`    | First-visit loader: counter 000→100, the bar folds into the logo tile, and the tile flies into the header.             |
| `src/lib/loader.ts`                  | Inline gate that decides before first paint whether the loader plays (once per browser session).                       |
| `src/components/hero-shader.tsx`     | WebGL liquid blob in the homepage hero, with the SVG blob as fallback.                                                 |
| `src/components/imigongo-tunnel.tsx` | CSS-3D tunnel of lozenge rings behind the closing call to action.                                                      |
| `src/lib/pointer.ts`                 | Detects a real mouse per event. Windows touch laptops report `hover: none` even with a mouse.                          |
| `src/types/react-canary.d.ts`        | Type reference for React's `<ViewTransition>`.                                                                         |

---

## Changed files: what and where

### Global

- **`src/app/layout.tsx`**
  - Mounts `ForgeLoader`, its inline gate script, `ScrollProgress` and `CursorLabel`.
  - Wraps the page in `<ViewTransition update="page-wipe">` for the sawtooth page wipe.
  - Adds split words and odometers to the `<noscript>` fallback style.
- **`src/app/globals.css`**: see "Going back to default" above.
- **`src/components/site-header.tsx`**
  - Desktop nav labels roll on hover.
  - Menu blocks enter staggered and tilted (`menu-stagger`).
  - Menu rows fill upward behind imigongo teeth (`fill-rise`), and menu labels and CTAs roll.

### Homepage

- **`src/app/page.tsx`**
  - `Blob` is replaced by `HeroShader`, which still renders the same `Blob` underneath.
  - The hero corner gets `corner-spin`.
- **`src/components/hero-display.tsx`**: "Forge the future" words rise on load.
- **`src/components/hero-intro.tsx`**
  - The headline words rise on a tilt. `rise` was removed from the `h2`.
  - CTA labels roll, and the primary CTA is magnetic.
- **`src/components/manifesto.tsx`**: the statement inks in word by word as you scroll, and the CTA label rolls.
- **`src/components/portfolio.tsx`**
  - The band tints to each project's colour as its card reaches the centre.
  - Card titles ripple letter by letter, the heading words rise, and the closing CTA rolls.
- **`src/components/membership.tsx`**
  - The active index number gains `[[ 01 ]]` brackets and rolls.
  - Heading words rise, and CTAs roll.
- **`src/components/impact.tsx`**: figures roll in digit by digit, heading words rise, and the CTA rolls.
- **`src/components/programs.tsx`**
  - Rows fill upward behind imigongo teeth, names roll, and the cursor shows "Join".
  - Previously the rows used `hover:bg-text`.
- **`src/components/events.tsx`**: the heading drifts in from both sides (`drift`).
- **`src/components/closing-cta.tsx`**: tunnel added behind it, the title ripples on hover, CTAs roll, and the primary CTA is magnetic.
- **`src/components/section-heading.tsx`** (used on every page)
  - Title words rise on reveal.
  - A new optional `drift` prop adds the split drift, which is off by default.

### Inner pages

- **`src/components/page-hero.tsx`**: page titles ("ABOUT", "TEAM", …) rise letter by letter.
- **`src/app/about/page.tsx`**
  - The story heading and paragraphs drift in from opposite sides.
  - Pillar cards are dealt out from a stacked, fanned deck and fill upward on hover. Previously they used `hover:bg-text`.
- **`src/app/services/page.tsx`**: rows show a turning lozenge beside the cursor, and the CTA rolls.
- **`src/app/team/page.tsx`** and **`src/components/team-showcase.tsx`**:
  - Each card gets a `[[ 001 ]]` odometer tag and a letter ripple on the name.
  - The cursor shows "Hello", and the CTA rolls.
- **`src/app/contact/page.tsx`**: field labels roll up and ink in while the field has focus, and the submit button is magnetic with a "Send" cursor.
- **`src/app/portfolio/page.tsx`**: rows fill upward (previously `hover:bg-text`), names ripple, and the cursor shows "View".
- **`src/app/portfolio/[slug]/page.tsx`**
  - The title words rise. `rise` was removed from the `h1`.
  - The cover grows from an inset card to full width as it scrolls in.
  - The next-project name ripples. Previously it underlined on hover.
- **`src/app/not-found.tsx`**: "404" rolls in like a counter, and the buttons roll.
- **All hero corners** (`page.tsx`, `about`, `services`, `team`, `contact`, `portfolio`, `portfolio/[slug]`, `not-found`): added the `corner-spin` class, a slow counter-turn as the first screen scrolls away.

### Data

- **`src/lib/site.ts`**: `Project` gains an optional `accent` field ("amber" | "coral" | "lime" | "sky" | "teal") for the gallery tint. No project sets it yet, so they use a fixed cycle.

---

## Switching single effects off

| Effect               | Quickest off-switch                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Loader               | Remove `<ForgeLoader />` and its `<script>` from `layout.tsx`.                                       |
| WebGL hero           | In `src/app/page.tsx`, swap `HeroShader` back to `Blob` (same `className`).                          |
| Cursor pill          | Remove `<CursorLabel />` from `layout.tsx`.                                                          |
| Scroll progress line | Remove `<ScrollProgress />` from `layout.tsx`.                                                       |
| Page wipe            | Delete the "Page transitions" block in `globals.css` and unwrap `<ViewTransition>` in `layout.tsx`.  |
| Tunnel               | Remove `<ImigongoTunnel />` from `closing-cta.tsx`.                                                  |
| Heading drift        | Remove the `drift` prop from `events.tsx` and `about/page.tsx`.                                      |
| Button fill and roll | Restore the `btn` and `btn-invert` utilities from `696da38`. `RollText` is then harmless on its own. |

---

## Accessibility and performance guarantees

- **Reduced motion.** Every effect lands on its finished state. Words are already risen, figures already on their digits, and there is no loader, shader, cursor, drift or page wipe.
- **No JavaScript.** Content still shows (see the `<noscript>` style). The loader can never appear, because the gate script is what switches it on.
- **Screen readers.** Split and rolled text is rendered once as real text (visually hidden), and the animated copy is `aria-hidden`.
- **Phones and narrow windows.** Scrubbed effects only run from 48rem or 64rem upward. Cursor, magnetic and shader only wake on a real mouse or pen, which a phone never sends.
- **Offscreen work.** Scroll-scrubbed effects, the shader and the blob pause when they are off screen. The shader also pauses when the tab is hidden.

## Deliberately not done

- **"Keep scrolling → next page" strip** (from the plan, marked optional). It would add a new row to the footer, and the brief was "don't change the layout".
- **Thumbnail → cover morph** between Portfolio and a project. The cover sits below the fold on the project page, so the thumbnail would fly off-screen. The page wipe covers that navigation instead.
- **`src/app/error.tsx`** is untouched. Its own comment says it must depend on nothing, because whatever broke may be part of the page machinery.

## Known trade-offs

- **Loader and LCP.** On a session's first page view the loader covers the page for about 1.9s, and any key, click, scroll or touch skips it. Largest Contentful Paint (LCP) for that one view is measured after the overlay lifts.
- **Kerning.** Letter-split titles lose kerning between letters. It is used only on short display words, where it isn't visible.
- **Page wipe support.** It needs a browser with View Transitions (Chrome/Edge, recent Safari). Other browsers navigate normally.
- **Corner turn support.** It uses CSS scroll timelines. Where they are unsupported, the corner simply stays still.
