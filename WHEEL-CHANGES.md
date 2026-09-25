# The Imigongo wheel (experiment): what changed, and how to go back

This is a test of a bolder idea, on its own branch. A large Imigongo-decorated half-wheel sits in the background on the right of the **homepage** and turns as you scroll.

- **Hero:** it is on the right from the first screen.
- **Selected work:** it turns in step with the sideways gallery, as if it were the gear moving the cards.
- **Programs band:** it pushes the oxblood herringbone "sticks" aside like sticks on water.
- **Other patterns:** Manifesto, Impact and the closing section ripple gently while it turns.
- **Closing CTA:** it shrinks into a small wheel beside the blob.

It never covers text: content stays in front of it, and section backgrounds sit behind it.

- **Branch:** `2026.09_forgehub-wheel_DEV_claude`
- **Built on:** `2026.09_forgehub-motion_DEV_claude` at commit `cb30a3b`, the approved motion pass. Everything here comes on top of that.

---

## Going back

| You want to…                                   | Do this                                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drop the whole experiment                      | `git checkout 2026.09_forgehub-motion_DEV_claude`. That branch is untouched.                                                                             |
| Keep the branch but undo the wheel             | `git revert <wheel commit>`                                                                                                                              |
| Undo one file                                  | `git checkout cb30a3b -- <path>`                                                                                                                         |
| Switch the wheel off without touching the code | Remove `<ImigongoWheel />` from `src/app/page.tsx`. Everything else then renders exactly as before, because every wheel rule waits for the wheel to run. |

---

## New files

| File                                | What it is                                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/imigongo-wheel.tsx` | The live wheel: fixed on the right. It turns with the scroll, is geared to the gallery, and docks into the closing section.                               |
| `src/components/wheel-art.tsx`      | The wheel's artwork: gear-tooth rim, zigzag ring, lozenge ring, nested triangles, panel dividers and a lozenge hub. The geometry is computed, not traced. |
| `src/components/wheel-sticks.tsx`   | The programs band's herringbone, redrawn as separate planks the wheel can push.                                                                           |
| `src/components/wheel-nudge.tsx`    | Wrapper that lets a watermark ripple while the wheel turns over it.                                                                                       |
| `src/lib/wheel.ts`                  | Shared state between the wheel, the gallery and the reacting backgrounds.                                                                                 |

## Changed files

- **`src/app/page.tsx`**:
  - mounts `<ImigongoWheel />` after `<main>`, and passes `wheel` to `ClosingCta`;
  - the lozenge pattern in the hero's bottom-right corner (`ImigongoCorner`) is removed from the homepage at your request. The other pages keep theirs, and the corner's slow spin stays because they still use it. To bring it back, restore it from `cb30a3b`.
- **`src/components/closing-cta.tsx`**: a new optional `wheel` prop. On the homepage:
  - the lozenge tunnel is replaced by the dock slot, which holds a static copy of the wheel;
  - the watermark gets the ripple;
  - the copy is lifted above the wheel.

  **Every other page keeps the tunnel, unchanged.**

- **`src/components/section-heading.tsx`**: `Section`'s content wrapper gets `wheel-over`, which lifts content above the wheel. It has no effect on any page without the wheel.
- **`src/components/portfolio.tsx`**:
  - publishes the gallery's travel and pinned range to `src/lib/wheel.ts`;
  - its heading and pinned stage get `wheel-over`.
- **`src/components/programs.tsx`**: the band's herringbone `ImigongoWatermark` becomes `WheelSticks`. It looks identical until the wheel moves it, and is the same plain watermark wherever the wheel doesn't run.
- **`src/components/manifesto.tsx`**, **`src/components/impact.tsx`**: watermarks wrapped in `WheelNudge`.
- **`src/app/globals.css`**:
  - a new block, **"The imigongo wheel (experiment)"**, covering the layering, the difference-blend ink and the static dock hand-over;
  - `.wheel-stick`.

## When it runs, and when it doesn't

- **Laptops and desktops (1024px and wider), with no reduced-motion setting:** the live wheel.
- **Phones, tablets and reduced motion:** no live wheel. The static small wheel sits in the closing section, and the programs band keeps its plain pattern.
- **No JavaScript:** the same as phones.
- **Performance:**
  - The wheel is one layer that is only ever rotated and moved, so turning it repaints nothing.
  - Its loop sleeps whenever nothing is moving, and while the tab is hidden.
  - In the programs band, only the planks near the wheel, or still settling, are updated. While the band sits under the wheel, those planks keep swaying gently. That is the only time the loop runs without scrolling.

## Checked

- Typecheck, lint, formatting and the production build all pass.
- Headless Chrome at 1440×900, light and dark:
  - the wheel is on the right from the hero, with clear space top and bottom;
  - text is always in front;
  - it turns faster through the gallery (geared to the cards);
  - sticks part around it in the programs band;
  - it is legible on the dark Events band;
  - it docks beside the blob and scrolls away with the CTA, never over the footer.
- **At 800px and under reduced motion:** no live wheel, and the static copy shows.
- **Inner pages:** still render the tunnel.
