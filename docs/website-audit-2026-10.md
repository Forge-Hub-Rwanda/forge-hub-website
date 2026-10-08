# ForgeHub website: SEO, navigation and UX audit

**Date:** 8 October 2026
**Audited branch:** `2026-09-forgeWeb-DEV-JS` (same code as PROD at commit `ddd86a7`)
**Live site:** https://forgehubrwanda.com
**Written for:** the CPO, who will carry out the tasks below, mostly by running the included prompts in Claude Code inside this repo.

---

## 1. Summary

### What is already good

- **Every public page is rendered on the server**, so the real text (headings, copy, project names) is in the HTML that Google downloads. Nothing important depends on JavaScript to appear.
- **No broken links.** Every internal link and `#anchor` on the site points to a page or section that exists, and there are no `href="#"` placeholders.
- **The admin works.** It is protected on the server and is already set to `noindex`.
- **The page weight is light.** There is no 3D or video, fonts are self-hosted, and animations already pause when they are off-screen.

### Why the site does not show up on Google yet

| #   | Problem                                                                                                                                                             | Effect                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Google Search Console has never been set up.**                                                                                                                    | Google has not been told the site exists, and we cannot see what it has indexed.                                                               |
| 2   | **There is no `sitemap.xml` and no `robots.txt`.**                                                                                                                  | Google has to find pages by following links. Project pages are especially hard for it to find.                                                 |
| 3   | **No canonical domain (`metadataBase`) and no structured data (JSON-LD).**                                                                                          | Share images and links can point at `*.vercel.app`. Google gets no clear statement that "ForgeHub Rwanda = this site = this Business Profile". |
| 4   | **The homepage's main heading is "Forge the future".** The sentence containing "ForgeHub" is shown on desktop only; phones see a different line with no brand name. | Google ranks the **mobile** version of the page, which never names the brand in its opening content.                                           |
| 5   | **The copy always writes "ForgeHub" (one word) and never "Forge Hub" or "tech hub".**                                                                               | Searches for "Forge Hub" or "tech hub Kigali" have weak text to match against.                                                                 |

Fixing area A (SEO) together with the off-site checklist (task A7) should give the biggest gain. Searches for the brand name usually start ranking within a few weeks of Search Console verification and sitemap submission. Ranking for generic terms such as "tech hub" also needs backlinks and an active Business Profile, so it takes longer.

### Scope

**In scope:** SEO, navigation, UI/UX, new pages (events), and the contact form's two sending options.
**Deferred by the owner:** the visibility of unpublished content, notifications and announcements, and server-side email delivery.

---

## 2. How to use this document

**Priorities:** **P0** = do first (gets the site found, fixes misleading buttons). **P1** = do next. **P2** = safety net.

**Each task has:**

- **Why:** the problem.
- **Files:** where it lives (`path:line`, as of commit `ddd86a7`).
- **Prompt:** paste into Claude Code, in this repo, on the DEV branch.
- **Test:** how to check it by hand.
- **Done when:** the acceptance check.

**Rules that apply to every task:**

1. **Do not change the visual design or the animations.** Fixes are about structure, wording, links and behaviour. If something must be hidden for performance, pause or hide it; don't change it.
2. **This project uses Next.js 16.3**, which differs from what AI models were trained on. `AGENTS.md` requires reading the matching guide in `node_modules/next/dist/docs/` before writing code. Every prompt below repeats this.
3. **Branch flow:** work on DEV → merge to UAT → test → merge to PROD. Use a merge (not a force-push) when branches have diverged.
4. **Run `npm run verify`** (typecheck, lint, format, build) before each commit.
5. **Decision points** are marked 🟡 **CPO decision**. Agree these with the owner before running the prompt.

---

## 3. Link and button map

Status: ✅ OK · ⚠️ SUSPICIOUS (works, but the label and the destination disagree or the target could be better) · ❌ MISMATCH (misleading).

### Homepage sections ("pages" on `/`) and their anchors

| Order | Section                    | Anchor                                                           | Component                    |
| ----- | -------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| 1     | Hero                       | `#hero-intro`                                                    | `components/hero-intro.tsx`  |
| 2     | Manifesto ("Why we exist") | `#about`                                                         | `components/manifesto.tsx`   |
| 3     | Selected work              | `#portfolio`                                                     | `components/portfolio.tsx`   |
| 4     | Community                  | `#community`                                                     | `components/community.tsx`   |
| 5     | Ways in                    | `#membership`, `#join-learner`, `#join-builder`, `#join-partner` | `components/membership.tsx`  |
| 6     | Impact                     | _(none)_                                                         | `components/impact.tsx`      |
| 7     | Programs                   | `#programs`                                                      | `components/programs.tsx`    |
| 8     | What's on (events)         | `#events`                                                        | `components/events.tsx`      |
| 9     | Closing call to action     | `#tour`                                                          | `components/closing-cta.tsx` |
| —     | Footer (every page)        | `#contact`                                                       | `components/site-footer.tsx` |

**Routes that exist:** `/`, `/about`, `/services`, `/portfolio`, `/portfolio/[slug]`, `/team`, `/contact`, `/privacy`, `/cookies`, `/login` (admin, noindex), plus the 404 and error pages.
**Routes that do not exist:** `/programs`, `/events`, `/blog`, `/careers`.

### Every clickable element

Most link targets are defined in `src/lib/site.ts`; the line numbers below refer to that file unless another file is named.

| Where                                                           | Label                                                                         | Goes to                                                     | Status | Note                                                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Header logo                                                     | (logo)                                                                        | `/`                                                         | ✅     |                                                                                             |
| Desktop nav                                                     | About · Services · Portfolio · Team · Contact                                 | matching routes                                             | ✅     | No "current page" indicator (B6)                                                            |
| Header person icon (`site-header.tsx:916`)                      | "Sign in or create an account"                                                | `/login`                                                    | ⚠️     | This is the **admin** sign-in, but visitors will read it as a student account (B8)          |
| Menu ✕ (`site-header.tsx:556`)                                  | "Close menu and return to home"                                               | `/`                                                         | ⚠️     | Deliberate design, but surprising on inner pages (B4)                                       |
| Menu row: Home, About, Services, Portfolio, Team, Contact       |                                                                               | matching routes                                             | ✅     |                                                                                             |
| Menu sub-links under **About** and **Team** (`site.ts:373-376`) | About · Our story · Team · Community                                          | `/about`, `/about#story`, `/team`, `/#community`            | ⚠️     | The same list appears twice (B5)                                                            |
| Menu sub-links under Services (`:382-386`)                      | Services · Portfolio · Software development · Training & education · Programs | `/services`, `/portfolio`, `#build`, `#train`, `/#programs` | ⚠️     | Includes a link to itself and to Portfolio (B5)                                             |
| Menu sub-links under Contact (`:392-395`)                       | Ways in · **Join a program** · Start a project · Partner with us              | `/#membership`, **`/services`**, `/contact`, `/contact`     | ⚠️     | "Join a program" does not let you join anything (B2)                                        |
| Menu primary button (`site-header.tsx:650`)                     | Explore our programs                                                          | `/#programs`                                                | ✅     |                                                                                             |
| Menu secondary button (`site-header.tsx:660`)                   | **Work with us**                                                              | **`/services`**                                             | ⚠️     | Elsewhere it goes to `/contact` (B1)                                                        |
| Hero primary (`:91`)                                            | Explore our programs                                                          | `#programs`                                                 | ✅     | Jumps past 5 sections to section 7 (C3)                                                     |
| Hero secondary (`:92`)                                          | **Work with us**                                                              | **`/services`**                                             | ⚠️     | B1                                                                                          |
| Manifesto (`:126`)                                              | Learn more about us                                                           | `/about`                                                    | ✅     |                                                                                             |
| Homepage project cards (`portfolio.tsx:516`)                    | (card)                                                                        | _nothing_                                                   | ❌     | The `/portfolio/[slug]` pages exist but can't be reached from here (B3)                     |
| Project card "Visit the site"                                   |                                                                               | external `project.href`                                     | ✅     | New tab with `rel="noreferrer"`                                                             |
| Portfolio end card (`:619`)                                     | Work with us                                                                  | `/contact`                                                  | ✅     |                                                                                             |
| Ways in: Learner (`:177`)                                       | See our training                                                              | `/services`                                                 | ⚠️     | `/services#train` fits better (B7)                                                          |
| Ways in: Builder (`:192`)                                       | Start a project                                                               | `/contact`                                                  | ✅     |                                                                                             |
| Ways in: Partner (`:206`)                                       | Talk to us                                                                    | `/contact`                                                  | ✅     |                                                                                             |
| Impact (`:313`)                                                 | Read our story                                                                | `/about`                                                    | ⚠️     | `/about#story` exists (B7)                                                                  |
| Program rows (`programs.tsx:63`, data at `:226`)                | Row, with a "**Join**" cursor                                                 | `/services`                                                 | ❌     | On `/services` the same rows link to the page you're already on. Nothing can be joined (B2) |
| Event rows (`events.tsx:33`, data at `:276`)                    | Event name                                                                    | `/contact`                                                  | ❌     | Every event goes to the contact page. Needs event pages (D1)                                |
| Closing CTA (`:342`)                                            | **Join a program**                                                            | `/services`                                                 | ⚠️     | B2                                                                                          |
| Closing CTA (`:343`)                                            | Get in touch                                                                  | `/contact`                                                  | ✅     |                                                                                             |
| Footer                                                          | email / phone                                                                 | `mailto:` / `tel:+250791774313`                             | ✅     | No WhatsApp (C1)                                                                            |
| Footer nav (`:410-415`)                                         | About · Services · Portfolio · Team · Programs · Contact                      | routes, `/#programs`                                        | ✅     |                                                                                             |
| Footer legal                                                    | Privacy · Cookies                                                             | `/privacy`, `/cookies`                                      | ✅     |                                                                                             |
| Social icons                                                    |                                                                               | _(empty list, hidden)_                                      | —      | `socials = []` at `:422` (A7)                                                               |
| About page (`:450`)                                             | Meet the team                                                                 | `/team`                                                     | ✅     |                                                                                             |
| Services page (`:503`)                                          | Work with us                                                                  | `/contact`                                                  | ✅     |                                                                                             |
| Team page (`:684`)                                              | Work with us                                                                  | `/contact`                                                  | ✅     |                                                                                             |
| Team cards (`team-showcase.tsx:213`)                            | "Hello" cursor                                                                | _nothing_                                                   | ⚠️     | Looks clickable and is a keyboard stop, but goes nowhere (C6)                               |
| `/portfolio` rows                                               | "View" cursor                                                                 | `/portfolio/{slug}`                                         | ✅     |                                                                                             |
| Project page "Next project" / "← All work"                      |                                                                               | next slug / `/portfolio`                                    | ⚠️     | Back link only at the bottom, and hidden when there's only one project (B3)                 |
| 404 page                                                        | Back to home · See our work · Get in touch                                    | `/`, `/portfolio`, `/contact`                               | ✅     |                                                                                             |
| Skip link (`layout.tsx:85`)                                     | Skip to content                                                               | `#hero-intro`                                               | ⚠️     | The target is missing on the 404, error and `/login` pages (B7)                             |

### The same label in different places

| Label                                                             | Destinations used                                                      |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Work with us**                                                  | `/services` (hero, menu) · `/contact` (services page, portfolio, team) |
| **Programs / Join a program / See our training**                  | `/#programs` · `/services` · `/services#train`                         |
| **Get in touch / Talk to us / Start a project / Partner with us** | all `/contact`, with no way to tell the form which one was clicked     |

**Rule going forward:** one label = one destination, and every destination should let the visitor actually do what the label says.

---

## 4. Task list

### Area A: SEO (P0)

#### A1. Root metadata, canonical domain and Search Console tag

**Why:** There is no `metadataBase`, so Next.js can't build absolute URLs. Share images and links may point at `localhost` or `*.vercel.app`. There's also no title template, no canonical, no Twitter card, and no place for the Google verification code.
**Files:** `src/app/layout.tsx:39-50`, `.env.example`
**Prompt:**

```
Read node_modules/next/dist/docs/ guides on the Metadata API (metadata object, metadataBase, title templates, alternates, openGraph, twitter, verification) before writing code. Do not change any visual design or animation.

In src/app/layout.tsx (metadata export at ~line 39):
- Add NEXT_PUBLIC_SITE_URL to .env.example (value https://forgehubrwanda.com) and use it for metadataBase, falling back to "https://forgehubrwanda.com".
- title: { default: "ForgeHub Rwanda | Tech Hub, Software Studio & Training in Kigali", template: "%s | ForgeHub Rwanda" }.
- description (≤160 chars) that naturally mentions ForgeHub / Forge Hub, tech hub, software development, engineer training, Kigali, Rwanda.
- applicationName "ForgeHub Rwanda", alternates.canonical "/", openGraph { url "/", siteName "ForgeHub Rwanda", locale "en_RW", type "website" } (keep the existing opengraph-image.png file convention), twitter { card "summary_large_image" }.
- verification.google read from a new env var NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (omit when empty); add it to .env.example.
Then remove the hand-written " | ForgeHub Rwanda" suffix from the per-page titles in src/app/*/page.tsx so the template applies once.
Run npm run verify and report what changed.
```

**Test:** On the deployed UAT build, view the page source of `/` and `/about`. Check that `<link rel="canonical">`, `og:url` and `og:image` all start with `https://forgehubrwanda.com`, and that the titles show the brand only once.
**Done when:** No `vercel.app` or `localhost` appears in any meta tag.

#### A2. Sitemap and robots, with DEV/UAT kept out of Google

**Why:** There's no sitemap or robots file. The DEV and UAT `*.vercel.app` copies can also be indexed, which creates duplicates of the real site.
**Files:** new `src/app/sitemap.ts` and `src/app/robots.ts`; `src/lib/content.ts` (`getProjects`)
**Prompt:**

```
Read node_modules/next/dist/docs/ guides for the sitemap and robots metadata files first. Do not change visual design.

1. Create src/app/sitemap.ts: absolute URLs from NEXT_PUBLIC_SITE_URL (fallback https://forgehubrwanda.com) for /, /about, /services, /portfolio, /team, /contact, /privacy, /cookies, plus every /portfolio/{slug} from getProjects() in src/lib/content.ts (and /events + /events/{slug} once task D1 exists). Use updatedAt where available. Exclude /admin and /login.
2. Create src/app/robots.ts: when process.env.VERCEL_ENV === "production", allow "/" and disallow "/admin" and "/login", and point sitemap at {site}/sitemap.xml. For any other environment (preview/development), disallow "/" entirely.
3. Also in src/app/layout.tsx metadata, set robots to { index: false, follow: false } when VERCEL_ENV !== "production", so DEV/UAT pages carry a noindex meta tag too.
Run npm run verify and report.
```

**Test:** Open `https://forgehubrwanda.com/sitemap.xml` and `/robots.txt`. On a `*.vercel.app` UAT URL, `/robots.txt` should say `Disallow: /` and the page source should contain `noindex`.
**Done when:** The sitemap lists every public page and project, and the previews are noindexed.
⚠️ Check in Vercel that the PROD deployment really runs with `VERCEL_ENV=production`, meaning the domain is attached to the Production environment. Otherwise the live site would be noindexed.

#### A3. Structured data (JSON-LD) that links the site to the Google Business Profile

**Why:** Google gets no explicit "this is ForgeHub Rwanda, at this address and phone number, and these are its profiles". Structured data is how the website, the Business Profile and the social accounts get recognised as the same entity, and it lets the alternate spelling "Forge Hub" be declared.
**Files:** `src/app/layout.tsx`; contact data in `src/lib/site.ts:351-356` and `:422`
**Before running:** open the Business Profile (https://share.google/2yL90b8sG0ahssqKs), copy its **full Google Maps URL**, and note its exact name, address and phone. These must match the website character for character.
**Prompt:**

```
Read node_modules/next/dist/docs/ guidance on JSON-LD in the App Router first. Do not change visual design.

Add a server-rendered <script type="application/ld+json"> to src/app/layout.tsx containing a @graph with:
- Organization (also typed EducationalOrganization): name "ForgeHub Rwanda", alternateName ["Forge Hub", "ForgeHub", "Forge Hub Rwanda", "Forge Hub Kigali"], url from NEXT_PUBLIC_SITE_URL, logo (absolute URL to the 512px icon), email and telephone from `contact` in src/lib/site.ts, address { addressLocality "Kigali", addressCountry "RW" } (+ streetAddress if contact gains one), sameAs = [GOOGLE_MAPS_URL_HERE, ...socials hrefs from src/lib/site.ts], description mentioning tech hub, software studio and engineer training in Kigali.
- WebSite: name "ForgeHub Rwanda", alternateName "Forge Hub", url.
Put the data-building in a small src/lib/structured-data.ts helper so pages can add their own (Event in task D1). Escape "<" in the JSON. Run npm run verify.
```

**Test:** Paste the live URL into https://search.google.com/test/rich-results and https://validator.schema.org.
**Done when:** No errors, and the Organization shows the correct name, phone and `sameAs`.

#### A4. Homepage: say the brand where Google (and phones) can see it

**Why:**

- The h1 is the slogan "Forge the future" (`components/hero-display.tsx:175`).
- The sentence "ForgeHub Rwanda is a Kigali software studio…" (`hero.summary`) only shows on desktop (`components/hero-intro.tsx:46`, `hidden … lg:block`).
- Phones see `hero.phoneLine` (`site.ts:89`), which never names the brand.
- Google indexes the mobile version.

**Files:** `src/components/hero-display.tsx`, `src/components/hero-intro.tsx:40-50`, `src/lib/site.ts:89-90`, `src/app/page.tsx`
**🟡 CPO decision:** the wording of the phone line. Suggestion: _"ForgeHub Rwanda is a Kigali tech hub: we build software for clients and train Africa's next engineers."_
**Prompt:**

```
Read node_modules/next/dist/docs/ on page metadata first. Do NOT change the visual design or animations of the hero.

1. In src/components/hero-display.tsx (h1 ~line 175) add a visually-hidden (sr-only) prefix inside the h1 so its accessible/indexed text reads "ForgeHub Rwanda — Forge the future", leaving the visible letters and their animation untouched.
2. Update hero.phoneLine in src/lib/site.ts (~line 89) to: "<APPROVED WORDING>" so phones show the brand name in the first screen.
3. Export page-specific metadata from src/app/page.tsx (title.absolute = the root default title, description, alternates.canonical "/").
Run npm run verify; check the hero still looks identical at 375px and 1440px widths.
```

**Test:** In Chrome DevTools at phone width, the phone line names ForgeHub. Searching the page source for "ForgeHub Rwanda" finds it inside the `<h1>`.
**Done when:** The brand appears in the h1 and in the mobile opening text, and the hero looks the same as before.

#### A5. Per-page titles, descriptions and share previews

**Why:**

- Inner pages have generic one-word h1s ("About", "Team").
- Every page shares the root OpenGraph title and description, so a shared link to `/team` looks identical to one for the homepage.
- Project pages have no share image.

**Files:** `src/app/{about,services,portfolio,team,contact}/page.tsx`, `src/app/portfolio/[slug]/page.tsx:27-38`, `src/components/page-hero.tsx`
**Prompt:**

```
Read node_modules/next/dist/docs/ on metadata/generateMetadata first. No visual or animation changes.

1. For each of about, services, portfolio, team, contact: set a keyword-bearing title (e.g. "About ForgeHub — Tech Hub in Kigali", "Software Development & Engineer Training Services", "Portfolio — Software Built in Kigali", "Our Team", "Contact ForgeHub Rwanda"), a unique ≤160-char description, alternates.canonical, and openGraph { title, description, url }.
2. In src/components/page-hero.tsx add an optional sr-only suffix to the h1 (e.g. "About" + sr-only " ForgeHub Rwanda") so headings carry context without visual change; pass it from each page.
3. In src/app/portfolio/[slug]/page.tsx generateMetadata: add alternates.canonical `/portfolio/${slug}`, openGraph { title, description, url, images: [cover image absolute URL] } and twitter card.
Run npm run verify.
```

**Test:** Paste each URL into https://www.opengraph.xyz (or send it in WhatsApp to yourself); each page shows its own title, description and image.
**Done when:** Every public page has a unique title and description.

#### A6. Keywords in the copy: "Forge Hub" and "tech hub"

**Why:** People search "Forge Hub" (two words) and "tech hub", and neither appears anywhere on the site.
**Files:** `src/lib/site.ts` (about lede `:431`, manifesto `:124-125`, hero summary `:74`), `src/components/site-footer.tsx:116`
**🟡 CPO decision:** agree the exact sentences with the owner. Keep them natural; don't stuff keywords.
**Prompt:**

```
No visual or layout changes. In src/lib/site.ts, update these copy strings with the approved wording so the site naturally contains "Forge Hub" (two words) at least once and "tech hub" in Kigali/Rwanda context 2–3 times: <PASTE APPROVED SENTENCES AND WHICH FIELD EACH REPLACES>. Keep string lengths close to the originals so layouts don't reflow. Run npm run verify.
```

**Done when:** Searching the rendered HTML of `/` and `/about` finds "Forge Hub" and "tech hub".

#### A7. Off-site checklist (no code; this matters as much as the code)

- [ ] **Google Search Console:** add the **Domain property** `forgehubrwanda.com` and verify it with the DNS TXT record at the domain registrar. Alternatively, use the HTML tag via the env var from A1.
- [ ] Submit `https://forgehubrwanda.com/sitemap.xml` (after A2 ships to PROD).
- [ ] URL Inspection → **Request indexing** for `/`, `/about`, `/services`, `/contact`.
- [ ] **Google Business Profile:**
  - set the website to `https://forgehubrwanda.com`
  - category: "Software company" plus secondary categories "Technology hub" / "Computer training school"
  - add the street address, hours, photos and a description that uses "Forge Hub" and "tech hub"
  - copy the exact name, address and phone onto the site (`src/lib/site.ts:351-356`)
- [ ] Create **LinkedIn, Instagram and X** pages named "ForgeHub Rwanda", each linking to the site. Add their URLs to `socials` in `src/lib/site.ts:422` so they appear in the footer and the JSON-LD.
- [ ] **Get linked from other sites:** ALU, partners, Rwandan tech directories and communities (e.g. Kigali tech ecosystem listings, Rwanda ICT Chamber), and event pages on other sites. Links from other sites are what lift "tech hub" searches.
- [ ] **In Search Console after 2–4 weeks**, check _Pages → Indexed_ and _Performance → queries_ for "forge hub".
- [ ] Bing Webmaster Tools: import from Search Console (takes one click).

#### A8. Image weight and alt text

**Why:**

- `public/portfolio/rabbi-residences.png` is **2.0 MB**.
- Team portraits get an empty alt text (`src/lib/content.ts:294`).
- Project images can also have empty alt text.

**Prompt:**

```
No visual changes. 1) Convert public/portfolio/rabbi-residences.png (2 MB) and public/portfolio/forgehub-rwanda.png to WebP at max 1920px wide (quality ~80), update the references in src/lib/content.ts (~lines 73-86), delete the PNGs. 2) In src/lib/content.ts ~line 294, use the member's name as the portrait alt text instead of "". 3) Check src/components/project-image.tsx passes a realistic `sizes` prop to next/image. 4) List (don't delete) files in public/ that nothing references. Run npm run verify.
```

**Done when:** No image in `public/` is over 300 KB, and every portrait has alt text.

---

### Area B: Navigation (P0/P1)

#### B1. "Work with us": one label, one destination (P0)

**Why:** The hero and the menu send "Work with us" to `/services` (`site.ts:92`, `site-header.tsx:660`). The services, portfolio and team pages send the same label to `/contact` (`site.ts:503, 619, 684`).
**🟡 CPO decision:** either

- **(a)** send all of them to `/contact`. Recommended: the label promises a conversation.
- **(b)** keep `/services` for the hero and menu, and rename those two buttons "See our services".

**Prompt (a):**

```
No visual changes. In src/lib/site.ts line ~92 change hero.secondaryCta.href from "/services" to "/contact?topic=build" (topic param is used by task C1; harmless before it exists). Check src/components/site-header.tsx ~line 660 uses hero.secondaryCta and so follows automatically. Run npm run verify.
```

**Prompt (b):**

```
No visual changes. In src/lib/site.ts line ~92 change hero.secondaryCta.label from "Work with us" to "See our services" (keep href "/services"). Confirm the menu button in src/components/site-header.tsx ~line 660 picks it up. Run npm run verify.
```

**Test:** Click "Work with us" everywhere it appears (hero, menu, services, portfolio, team).
**Done when:** Every button with the same label goes to the same place.

#### B2. The programs journey goes in a loop (P0)

**Why:**

- "Explore our programs" leads to the Programs rows. Those show a **"Join"** cursor but go to `/services` (`components/programs.tsx:63`).
- `/services` says curricula are "coming soon" and shows the same rows again, which link to the page you're already on.
- "Join a program" (`site.ts:342`, `:393`) and "See our training" (`:177`) also go to `/services`.
- A visitor who wants to join never reaches a place where they can.

**Fix:**

- Until real programs exist, send all "join" intent to `/contact?topic=learner` and label it **"Register interest"**.
- "For organizations" → `/contact?topic=partner`.
- Depends on C1 for the topic preselect, but it works without it.

**Prompt:**

```
Read node_modules/next/dist/docs/ on Link first. No visual design or animation changes — only hrefs, labels, cursor text.

1. src/lib/site.ts: programsSection.cta (~line 226) → { label: "Register interest", href: "/contact?topic=learner" }; closing CTA primaryCta (~line 342) → { label: "Register interest", href: "/contact?topic=learner" }; menu "Join a program" (~line 393) → { label: "Register interest", href: "/contact?topic=learner" }; Ways-in learner cta (~line 177) → { label: "See our training", href: "/services#train" }.
2. src/components/programs.tsx (~line 62-64): allow a per-program href (add optional `href` to the program data type) so the "For organizations" row goes to "/contact?topic=partner"; change the cursor label from "Join" to "Register".
3. Add a visible small text cue at the end of each program row ("Register interest →", using the existing MigongoArrow component and existing text styles) so touch users, who never see the cursor label, know the row is a link.
Run npm run verify.
```

**Test:** On a phone, tap every program row and the closing "Register interest" button. You should land on `/contact` (with Learner preselected once C1 is done), never back on the same page.
**Done when:** No link points to the page it's on, and every "join"-type button ends at a form.

#### B3. Make project pages reachable from the homepage (P1)

**Why:**

- Homepage project cards (`components/portfolio.tsx:512-600`) aren't links, so `/portfolio/[slug]` can't be reached from `/`.
- On a project page, "← All work" sits only at the bottom, and only when there are 2+ projects (`app/portfolio/[slug]/page.tsx:246-289`).
- Blank fields (Client, Year) still render their labels.

**Prompt:**

```
Read node_modules/next/dist/docs/ on Link first. Do not change the card design or animations.
1. src/components/portfolio.tsx: add a "Read the case study" link per project card to `/portfolio/${project.slug}` using the existing arrow-link style already used in that component (e.g. the "See the full portfolio" link). Keep the existing external "Visit the site" link.
2. src/app/portfolio/[slug]/page.tsx: add a small "← All work" link to /portfolio above the h1 eyebrow (reuse existing link styles); show the bottom "← All work" even when there is only one project; hide the <dt>/<dd> pair for Client, Year, Disciplines and the status eyebrow when empty.
Run npm run verify.
```

**Done when:** You can reach every project page from the homepage, and you can always get back.

#### B4. Menu ✕ button (P1) 🟡 CPO decision

**Why:** The ✕ in the menu is a link to `/` (`site-header.tsx:550-570`). Its code comment says this is deliberate: "doubles as the back-to-home exit". But a visitor on `/contact` who opens the menu and taps ✕ expects to stay on `/contact`, and pressing **Escape** does keep them there, so the two behave differently.
**Recommendation:** ✕ only closes the menu, and "Home" (already the first menu row) handles going home.
**Prompt:**

```
No visual or animation change. In src/components/site-header.tsx (~lines 550-570) turn the close control from a <Link href="/"> into a <button type="button"> that only closes the drawer (same handler Escape uses, ~line 322) and returns focus to the hamburger button; sr-only text "Close menu". Keep identical classes/size/position and the hover rotation. Leave the "Home" row as the way home. Run npm run verify.
```

**Done when:** ✕ closes the menu and leaves you on the same page.

#### B5. Clean up the menu's sub-links (P1)

**Why:**

- About and Team show the **same** list (`site-header.tsx:379-384`, `site.ts:369-398`).
- Services lists "Services" and "Portfolio", even though both are already menu rows.
- Contact lists two links to `/contact` plus "Join a program", which goes to `/services`.

**Proposed menu:**

| Row       | Sub-links                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| About     | Our story (`/about#story`) · Community (`/#community`)                                                                                                                         |
| Services  | Software development (`/services#build`) · Training (`/services#train`) · Programs (`/#programs`)                                                                              |
| Portfolio | _(none)_                                                                                                                                                                       |
| Team      | _(none)_                                                                                                                                                                       |
| Contact   | Start a project (`/contact?topic=build`) · Register interest (`/contact?topic=learner`) · Partner with us (`/contact?topic=partner`) · WhatsApp (`https://wa.me/250791774313`) |

**Prompt:**

```
No visual changes. Update the menu sub-link data in src/lib/site.ts (~lines 369-398) and the row→group mapping in src/components/site-header.tsx (~lines 379-384) to exactly this structure: <PASTE TABLE ABOVE>. Rows with no sub-links render as plain rows. External WhatsApp link opens in a new tab with rel="noreferrer". Run npm run verify.
```

#### B6. Show the current page, and use client-side navigation (P1)

**Why:**

- Nothing marks the page you're on, in either the desktop nav (`site-header.tsx:466-482`) or the menu (`:594-610`).
- The nav uses plain `<a>` tags (`:469`, `:804`), so every click reloads the whole page, which is slow on 3G.

**Prompt:**

```
Read node_modules/next/dist/docs/ on Link and usePathname first. No visual redesign: reuse the existing hover/underline style as the active style.
In src/components/site-header.tsx: (1) for desktop nav items (~line 469) and menu rows (~lines 594-610, 800-805), set aria-current="page" when usePathname() matches the item (exact for "/", prefix for others) and apply the existing hover style permanently for that item; (2) replace plain <a> with next/link <Link> for internal hrefs (keep <a> for external/mailto/tel). Make sure hash links like "/#programs" still scroll correctly with the Lenis smooth scroll. Run npm run verify.
```

#### B7. Small link fixes (P1)

**Prompt:**

```
No visual changes. Apply these small fixes and run npm run verify:
1. src/lib/site.ts ~line 313: Impact "Read our story" href "/about" → "/about#story".
2. Skip link in src/app/layout.tsx ~line 85 targets #hero-intro, which doesn't exist on src/app/not-found.tsx, src/app/error.tsx and /login. Give each page's main content wrapper id="hero-intro" tabIndex={-1} (or change the skip link to target <main id="main"> everywhere — choose one approach and apply consistently).
3. src/lib/legal.ts ~line 54: make the phone number in the privacy text a tel: link, mirroring how src/components/legal-page.tsx ~line 170 links the email.
4. src/app/admin/portfolio/actions.ts ~line 43: validate the project link with z.string().url() restricted to http/https (allow empty), so a typo or javascript: URL can't reach the public "Visit the site" button.
```

#### B8. Admin sign-in icon in the public header (P1)

**Why:** A solid person icon labelled "Sign in or create an account" (`site-header.tsx:907-939`) suggests a student portal. Visitors who tap it land on the admin login, and there is even a sign-up form there.
**Prompt:**

```
No other visual changes. Remove the account/person icon button from the public header in src/components/site-header.tsx (~lines 423, 496, 546, 907-939) and add a small, low-emphasis "Admin" text link to /login next to the Privacy/Cookies links in src/components/site-footer.tsx (~line 122), using the same style as those links. Run npm run verify.
```

---

### Area C: UI/UX (P1)

#### C1. Contact page: WhatsApp, topic, reply time and keeping typed input

**Why:**

- There's no WhatsApp option, though for many visitors in Rwanda it's the first choice.
- All "Ways in" buttons lead to the same form, which has no way to say _why_ the visitor is writing.
- The success message doesn't say when to expect a reply.
- After a validation error, React 19 resets the form, so the visitor's message is probably wiped (`components/contact-form.tsx:32, 52-108`).
- Errors look like normal text.
- The lede says "the address **opposite**" (`site.ts:700`), but on phones the address is **below**.

**Prompt:**

```
Read node_modules/next/dist/docs/ on Server Actions/forms and useActionState first. Keep the existing visual style of inputs, labels and buttons.

1. WhatsApp: add `whatsapp: "250791774313"` to `contact` in src/lib/site.ts (~line 354) and render a "Chat on WhatsApp" link (https://wa.me/250791774313) on src/app/contact/page.tsx (next to email/phone ~lines 62-103), in src/components/site-footer.tsx (~lines 73-89), opening in a new tab with rel="noreferrer".
2. Topic: add a "What's this about?" select to src/components/contact-form.tsx with options Learn (learner) / Build a project (build) / Partner (partner) / Other (other), preselected from the ?topic= query param (read it in src/app/contact/page.tsx via searchParams and pass it down). Add an optional "Phone / WhatsApp" input. Extend the zod schema in src/app/contact/actions.ts and add a Supabase migration adding nullable `topic` and `phone` columns to public.messages; show both in src/app/admin/messages/page.tsx.
3. Keep input on error: have the action return the submitted values in its state and use them as defaultValue on each field; after an error move focus to the first invalid field.
4. Errors: give field errors an "Error:" sr-only prefix, aria-describedby links and the site's existing error/accent colour token.
5. Copy: success message adds "We reply within 1–2 working days." Change src/lib/site.ts ~line 700 lede to "…Or reach us directly below, or on WhatsApp."
Run npm run verify.
```

**Test:** Submit with an invalid email: your text stays in the form. Open `/contact?topic=partner`: Partner is preselected. A submitted message shows its topic in `/admin/messages`.

#### C2. Empty sections: hide them instead of showing a bare heading

**Why:**

- If the CMS has no items, or a read fails, `src/lib/content.ts` returns an empty list. The Community, Events, homepage Portfolio, `/portfolio` and Team sections then show a heading over nothing.
- Code comments in `community.tsx:8-10` and `events.tsx:9-11` promise a "Coming soon" fallback that no longer exists.
- The events title "Our first meetups are in the works" (`site.ts:274`) is fixed text, so it stays even once real events exist.

**Prompt:**

```
No visual redesign. When their item list is empty: return null from src/components/community.tsx and src/components/events.tsx (homepage); in src/components/portfolio.tsx (homepage) and src/app/portfolio/page.tsx and src/components/team-showcase.tsx show one short line using existing text styles ("Our first projects are being written up — get in touch to see work in progress." / "Team profiles coming soon.") with a link to /contact. Update the outdated comments. In src/lib/site.ts make the events heading two strings: one for when events exist ("What's on") and the "in the works" line for none; pick in events.tsx. Run npm run verify.
```

#### C3. Homepage order 🟡 CPO decision (confirm with the owner)

**Why:**

- The hero's main button points to Programs, but Programs is section 7 of 9 (`app/page.tsx:45-64`).
- The code comment says this placement was deliberate, for the colour band's rhythm.
- The line "Founded in Kigali in 2026 by engineers trained at ALU" appears **5 times** (`site.ts:125, 310, 321-323, 436, 678`).

**Suggested order:** Hero → Manifesto → **Programs** → Portfolio → Ways in → Impact → Community → Events → Closing.
**Prompt (after approval):**

```
No visual or animation changes to any section. In src/app/page.tsx reorder the homepage sections to: <APPROVED ORDER>. Check the Programs colour band, the ImigongoWheel docking and scroll-linked effects still behave (they may depend on order). Reduce the repeated "Founded in Kigali in 2026 / ALU" fact to the Manifesto and About only: <APPROVED REPLACEMENT LINES for site.ts ~310 and ~678>. Run npm run verify and describe any behaviour that changed.
```

#### C4. The first-visit loader on slow connections

**Why:**

- The ~2 s intro loader can stay up to about 4.3 s on slow 3G (`components/forge-loader.tsx:76-82`, `globals.css:2194-2203`).
- It's remembered per _tab session_ (`lib/loader.ts:323`), so every link opened from WhatsApp, which opens a new tab, replays it.
- It also ignores the site's own "lite" mode (`lib/motion-tier.ts`).

**Prompt (same animation, shown less often and finishing sooner):**

```
Do NOT change the loader animation itself. In src/lib/loader.ts / the inline loader script and src/components/forge-loader.tsx: (1) skip the loader entirely when navigator.connection?.saveData is true, effectiveType is "slow-2g"/"2g"/"3g", or the data-motion tier is lite; (2) remember "seen" in localStorage with a 7-day expiry (wrap in try/catch) instead of sessionStorage; (3) let the inline script dismiss on first pointerdown/keydown before React hydrates; (4) reduce the CSS failsafe in src/app/globals.css (~line 2194) from ~4.3s to ~2.5s. Run npm run verify.
```

#### C5. Mobile layout details

**Why:**

- On phones, inner-page heroes take at least 70% of the screen height (`components/page-hero.tsx:57`, `min-h-[70svh]`), so real content starts about 1.7 screens down.
- The theme and account buttons are 32 px, below the 44 px recommended for tapping (`site-header.tsx:919, 950`).
- The footer and legal links are small, with no padding.
- The cookie card covers the hero buttons on the first visit (`components/cookie-consent.tsx`).

**Prompt:**

```
Keep the look identical at desktop; on phones only:
1. src/components/page-hero.tsx ~line 57: change min-h-[70svh] to min-h-[45svh] (desktop already lg:min-h-0).
2. Enlarge hit areas to ≥44×44px without changing visuals (padding + negative margin, or an ::after pseudo-element) for the header icon buttons (~lines 919, 950 in src/components/site-header.tsx) and footer/legal links in src/components/site-footer.tsx.
3. src/components/cookie-consent.tsx: on screens < sm, make the card more compact (smaller padding, buttons side by side) so the hero CTAs remain visible.
Run npm run verify; compare screenshots at 375px before/after.
```

#### C6. Meaning that only exists in the custom cursor

**Why:** Phones have no cursor, so the "Join", "Hello" and "View" labels never appear there. Program rows have no visible "this is a link" cue on mobile (fixed in B2). Team cards show "Hello" and take a keyboard Tab stop, but go nowhere (`components/team-showcase.tsx:213-214`).
**Prompt:**

```
No visual change. In src/components/team-showcase.tsx (~line 213) remove tabIndex/focusability and the "Hello" cursor label from team cards that are not links (or, if a member has a LinkedIn URL in future, make the card that link). Run npm run verify.
```

#### C7. Accessibility in everyday use

**Prompt:**

```
No visual or animation changes.
1. Menu focus (src/components/site-header.tsx ~lines 316-371): on open, move focus to the first menu row; trap Tab within the drawer and set `inert` on the page behind; on close, return focus to the hamburger.
2. src/components/smooth-scroll.tsx: don't start Lenis when prefers-reduced-motion: reduce.
3. Check contrast (≥4.5:1) of the 12px uppercase labels on dark bands in src/components/events.tsx (~lines 52, 58) and src/components/membership.tsx (~lines 589, 598); raise opacity of those text tokens only if they fail.
4. src/app/globals.css ~line 1045 sets outline:none — confirm a visible focus replacement exists for that element; add one if not.
Run npm run verify. Report contrast ratios found.
```

#### C8. Consistency of words and links

**🟡 CPO decision:** confirm the terms.

- Use **one** public word for training. The site currently mixes "Programs", "Training & education", "courses", "tracks and curricula" and "intensives". Suggestion: **Programs**.
- In "Ways in", rename **Builder** to **Client**. A paying client doesn't think of themselves as a "builder".
- Don't put ✓ tick marks on items that say "coming soon" (`components/membership.tsx:620-645`, `site.ts:175, 204`).
- Pick one style for secondary section links: either the arrow link (`section-heading.tsx:72`) or the pill (`manifesto.tsx:61`, `impact.tsx:61`).

**Prompt:**

```
No visual redesign. Apply the approved terminology: <TERM DECISIONS>. In src/lib/site.ts rename the "Builder" way-in to "Client" (label only; keep the #join-builder anchor id to avoid breaking links). In src/components/membership.tsx don't render the tick icon for feature items flagged as upcoming (add an `upcoming: true` flag to those items in site.ts). Make secondary section links use <CHOSEN STYLE> consistently. Run npm run verify.
```

#### C9. Contact form: two ways to send (owner request)

**What the owner wants:**

1. **Messages go into the admin panel.** ✅ **This already works.** `src/app/contact/actions.ts` saves each message to the `messages` table, and it appears at **Admin → Messages** (`src/app/admin/messages/page.tsx`). Keep it as the main **"Send message"** button and protect it with a test (E1).
2. **"Send by email instead".** This is a new secondary button. It opens the **visitor's own** email app or Gmail with `info@forgehubrwanda.com`, a subject and their typed message already filled in, and the visitor presses Send themselves. No server email setup is needed.

**Note for the visitor:** messages sent this way go straight to the Gmail inbox and **won't** appear in the admin panel. The button should say so in small text.

**Prompt:**

```
Read node_modules/next/dist/docs/ on client components first. Keep the existing button styles (use the existing secondary/outline style for the new button).

In src/components/contact-form.tsx add, next to the submit button, a secondary "Send by email instead" control that:
- reads the current name, topic (from task C1 if present) and message values from the form (no validation required),
- builds subject = `Website enquiry${topic ? " — " + topic : ""} from ${name || "a visitor"}` and body = the message plus "\n\n— " + name,
- opens `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` (contact from src/lib/site.ts, same pattern as src/app/contact/page.tsx ~line 66),
- and also offers a small "Open in Gmail" text link for desktop users: `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` (target _blank, rel noreferrer).
Below it, small muted text: "Opens your own email app. Messages sent this way go to our inbox, not this form."
Also fix src/lib/legal.ts ~line 127: it says contact form messages are "delivered" to Gmail; reword to say form messages are stored securely in our website admin, and emails sent to info@forgehubrwanda.com are handled in Google (Gmail).
Run npm run verify.
```

**Test:**

1. Type a message and click **Send message**. You see the success panel, and the message appears in `/admin/messages`.
2. Type a message and click **Send by email instead**. Your mail app opens with the address, subject and text filled in.
3. On desktop, **Open in Gmail** opens Gmail's compose window, already filled in.

**Done when:** All three work on Android Chrome, iPhone Safari and desktop Chrome.

---

### Area D: New pages (P1)

#### D1. Event pages: `/events` (upcoming and past) and `/events/[slug]`

**Why:**

- Today every event row on the homepage links to `/contact` (`components/events.tsx:33`).
- The owner wants clicking an event to open its own page with the relevant link:
  - **upcoming events** → a **registration link**, which may be on another site, since some events aren't run by ForgeHub
  - **past events** → a **report link**
- Past events should move to a **"Past events" archive** instead of disappearing.

**What the events table has today** (`supabase/migrations/0009_events.sql`): `name`, `kind`, `event_date` (date, can be empty = "TBA"), `time_text`, `location`, `position`, `is_published`.
**What's missing:** a slug, a description, an image, links and an organizer.

**Do it in 3 steps (one PR each):**

**D1a. Database and admin**

```
Read node_modules/next/dist/docs/ as needed. Follow existing patterns exactly.
1. New migration supabase/migrations/0013_event_pages.sql adding to public.events: slug text unique (backfill existing rows from name), description text (≤5000), cover_image_url text, cover_image_path text, registration_url text, report_url text, organizer text (nullable; e.g. "Hosted by Kigali Innovation City" for external events). Add an 'event-images' storage bucket with the same admin-write/public-read policies as the existing buckets in 0007_storage_buckets.sql.
2. src/app/admin/events/actions.ts: extend the zod schema (urls must be http/https or empty), toRow, auto-generate slug from name like slugify in src/app/admin/blog/actions.ts (~lines 11-17) incl. its duplicate-slug error handling (~line 92), image upload/delete via uploadImage/deleteImage from src/lib/supabase/storage (as the blog actions do). revalidatePublic() must also revalidate "/events" and "/events/[slug]".
3. src/components/admin/event-form.tsx: add fields Slug (optional, auto), Description (textarea), Cover image, Registration link, Report link (help text: "shown after the event date"), Organizer. Update the column lists in src/app/admin/events/page.tsx and [id]/page.tsx.
Run npm run verify. Give me the SQL to run on the UAT Supabase project.
```

**D1b. Public pages**

```
Read node_modules/next/dist/docs/ on dynamic routes, generateMetadata, generateStaticParams and notFound first. Reuse existing components and styles; no new visual language.
1. src/lib/content.ts (~lines 192-242): extend SiteEvent (src/lib/site.ts ~264) with slug, isoDate, description, cover, registrationUrl, reportUrl, organizer, isPast (event_date < today in Africa/Kigali; TBA = upcoming). Only return rows where is_published = true. Add getEvent(slug) mirroring getProject (~line 187) and an upcoming/past split.
2. New src/app/events/[slug]/page.tsx modelled on src/app/portfolio/[slug]/page.tsx: generateMetadata (title, description, canonical, OG image = cover), notFound for unknown slug, hero with the event name as h1 (keep HERO_DISPLAY_ID — see the comment in src/components/page-hero.tsx ~lines 9-13), a facts list (date via <time dateTime>, time, location, organizer), description, cover image, and ONE action button reusing the "Visit the site" block (~lines 169-182 in the portfolio page): upcoming + registrationUrl → "Register"; past + reportUrl → "Read the report"; external links open in a new tab with rel="noreferrer" and sr-only "(opens in a new tab)"; no URL → no button (upcoming without a link shows "Registration details soon — get in touch" linking to /contact). Add "← All events" at top, prev/next events, ClosingCta, footer, Event JSON-LD via src/lib/structured-data.ts (from A3).
3. New src/app/events/page.tsx: PageHero "Events", sections "Upcoming" and "Past events", each row linking to /events/{slug}, reusing the row design from src/components/events.tsx.
4. src/components/events.tsx (~line 33): rows link to /events/{slug}; restore <time dateTime> (see the TODO ~line 40); homepage shows upcoming events only, max 4, plus a "See all events" link to /events.
5. Add /events and every /events/{slug} to src/app/sitemap.ts (A2). Add "Events" to the footer nav in src/lib/site.ts (~line 410).
Run npm run verify.
```

**D1c. Tests:** see E1. Create one upcoming event with an external registration link and one past event with a report link on UAT, then check both buttons.

**Done when:**

- A past event shows **"Read the report"** and appears under _Past events_.
- An upcoming external event shows **"Register"** and opens the external site in a new tab.
- Draft (unpublished) events give a 404.
- The homepage shows only upcoming events.

#### D2. Later (not now)

- **`/programs/[slug]`:** once programs have real names, dates, syllabi and prices. Today all programs say "Dates to come" (`site.ts:234-258`). Until then, "Register interest" goes to the contact form (B2 and C1).
- **Team bios:** the `team_members.bio` column already exists and can be edited in the admin, but the public site doesn't show it (`content.ts:286`). Show bios on `/team` before considering individual team pages.
- **News/announcements:** a complete blog admin already exists (`src/app/admin/blog`, table `blog_posts`) but has no public page. It's ready whenever the owner wants announcements.

---

### Area E: Test safety net (P2)

#### E1. Automated smoke tests in CI

**Why:** The project has **no tests**. CI (`.github/workflows/ci.yml`) only runs typecheck, lint, format and build, so a broken link or a dead form would ship unnoticed.
**Prompt:**

```
Add Playwright (@playwright/test) as a dev dependency with a config that builds and starts the app (npm run build && npm start) on port 3000. Add tests under tests/e2e/:
1. routes.spec.ts — every public route (/, /about, /services, /portfolio, /team, /contact, /privacy, /cookies, /events) returns 200; an unknown URL returns 404.
2. links.spec.ts — crawl from / following same-origin links (max ~100 pages); every internal href and #anchor resolves (anchor id exists on the target page). No href="#", no vercel.app/localhost hrefs.
3. ctas.spec.ts — table-driven: for each { page, label, expectedPath } from section 3 of docs/website-audit-2026-10.md (after fixes), click and assert the URL. Include "Work with us", "Explore our programs", "Register interest", event rows → /events/{slug}.
4. seo.spec.ts — / has one <h1> containing "ForgeHub"; canonical and og:url use the site domain; /robots.txt and /sitemap.xml respond; JSON-LD parses and has name "ForgeHub Rwanda".
5. contact.spec.ts — invalid email shows an error and keeps typed text; "Send by email instead" builds a mailto: href containing the encoded message. (Real submission only when E2E_SUPABASE=1, against UAT.)
6. events.spec.ts — with seeded UAT data: past event shows "Read the report", upcoming shows "Register" with target=_blank.
Add an npm script "test:e2e" and a CI job in .github/workflows/ci.yml that runs it (with Supabase env vars from GitHub secrets; skip DB-dependent specs if absent). Run it and report results.
```

#### E2. Speed and SEO scores

After each PROD release, run **https://pagespeed.web.dev** on `/` (mobile).
**Targets:** SEO ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, Performance ≥ 80 on mobile.
Write the numbers in a release note so you can see whether things are improving.

---

## 5. Manual QA script (run on UAT before each PROD merge)

Test on **a real Android phone (Chrome)**, **an iPhone (Safari)** and **desktop Chrome**. Throttle one run with DevTools → Network → "Slow 3G".

**Every page**

- [ ] It loads with no error, and the first visit's loader is short (skipped on slow 3G after C4).
- [ ] The header nav shows which page you're on.
- [ ] The menu opens; ✕ closes it and you stay on the same page; Escape does the same.
- [ ] Tabbing through with the keyboard shows a visible focus ring everywhere.
- [ ] The footer email, phone and WhatsApp links work (they open the mail app, the dialer and WhatsApp).
- [ ] There's no sideways scrolling at 360 px width.

**Homepage**

- [ ] "Explore our programs" → Programs section.
- [ ] "Work with us" → the agreed destination (B1).
- [ ] Each project card → its project page.
- [ ] Each program row → contact form with the correct topic preselected.
- [ ] Each event row → its event page; "See all events" → `/events`.
- [ ] Closing "Register interest" → contact (learner); "Get in touch" → contact.
- [ ] No empty section headings.

**Contact**

- [ ] Invalid email → clear error, your text stays.
- [ ] A valid message → success panel → the message appears in **Admin → Messages** with its topic and phone.
- [ ] "Send by email instead" → mail app filled in; "Open in Gmail" → Gmail compose filled in.
- [ ] `/contact?topic=partner` preselects Partner.

**Events**

- [ ] An upcoming event with a link → "Register" opens the external site in a new tab.
- [ ] A past event → listed under Past events, with "Read the report".
- [ ] An unpublished event's URL → 404.

**Sharing and SEO**

- [ ] Send the links to `/`, `/about`, a project and an event in WhatsApp: each preview has the right title and image.
- [ ] `view-source:` shows the canonical and og:url on `forgehubrwanda.com`.
- [ ] The UAT `*.vercel.app` URL shows `noindex`; PROD does not.
- [ ] The Rich Results Test passes for `/` and one event page.

---

## 6. Content the owner needs to supply

| Item                                                               | Where it goes                    | Today                                 |
| ------------------------------------------------------------------ | -------------------------------- | ------------------------------------- |
| Street address and opening hours (must match the Business Profile) | `src/lib/site.ts:351-356`        | "Kigali, Rwanda", hours "coming soon" |
| Google Maps URL of the Business Profile                            | JSON-LD `sameAs` (A3)            | —                                     |
| LinkedIn, Instagram, X URLs                                        | `socials`, `src/lib/site.ts:422` | empty                                 |
| WhatsApp number (confirm it's +250 791 774 313)                    | C1                               | none                                  |
| Wording with "Forge Hub" and "tech hub"                            | A4, A6                           | —                                     |
| Program names, dates, prices                                       | `src/lib/site.ts:214-258`        | "Dates to come"                       |
| Impact figures (graduates, jobs, products)                         | `src/lib/site.ts:316-325`        | founding facts and "Soon"             |
| Job titles for 2 team members, and team portraits                  | `src/lib/site.ts:672`, admin     | TODO; "Portrait to come"              |
| Partners                                                           | `src/lib/site.ts:109-114`        | empty                                 |
| Real events (with registration and report links)                   | Admin → Events (after D1)        | 1 placeholder                         |

---

## 7. Suggested order of work

| Week | Tasks                                                            |
| ---- | ---------------------------------------------------------------- |
| 1    | A1, A2, A3, A7 (Search Console, Business Profile), B1, B2        |
| 2    | A4, A5, A6, A8, B3, C9, C1                                       |
| 3    | D1a, D1b, B4–B8                                                  |
| 4    | C2–C8, E1, E2, then a full QA pass (section 5) and merge to PROD |
