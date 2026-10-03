# ForgeHub Rwanda — Progress and backend brief

> **Read this whole file before writing any backend code or any new page.**
> It is written first for future Claude sessions, and second for the team (Jimmy
> and Fadhiri). It records what the frontend already does, the logic and
> conventions it runs on, every place that is waiting for a backend, and the
> rules a new page must follow so it looks like it belongs to the same site.
>
> Snapshot taken **2026-09-26** on branch `2026.09_forgehub-wheel_DEV_claude`.
> If the code and this file disagree, the code wins — then update this file.

---

## 0. How to use this document (instructions for Claude)

1. Read `AGENTS.md` first. This project runs **Next.js 16.3**, which has breaking
   changes from older versions. Before writing any Next.js code, read the
   relevant guide in `node_modules/next/dist/docs/`. Known differences that
   matter here:
   - `middleware.ts` is **deprecated and renamed to `proxy.ts`**
     (`01-app/01-getting-started/16-proxy.md`). Use `proxy.ts` for route
     protection on `/admin` and `/dashboard`.
   - Error boundaries receive `retry()` as well as `reset()`; `src/app/error.tsx`
     uses `retry` on purpose.
   - Useful guides: `02-guides/authentication.md`, `02-guides/forms.md`,
     `02-guides/environment-variables.md`, `02-guides/data-security.md`,
     `02-guides/backend-for-frontend.md`, `01-getting-started/09-revalidating.md`.
2. Treat sections 2–4 as facts about the code, and sections 5–8 as the agreed
   plan plus proposals. Anything marked **(proposal)** has not been decided —
   confirm it with the user before building on it.
3. Before changing any user-facing text, read the "Content rules" in section 3.6.
   The site never invents numbers, names, dates or quotes.
4. Every new page must follow section 7. Don't make up a new visual language.
5. The org rule for this workspace is to ask the user at least 5 clarifying
   questions before starting a task. Keep doing that.

---

## 1. What has been decided for the backend

| Topic            | Decision                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shape            | A **separate backend**: a **Node.js + Express** API, in its own project/repo, separate from this Next.js frontend.                                                       |
| Database         | **Supabase** is the intended choice (Postgres + Supabase Auth + Supabase Storage). Not yet set up.                                                                       |
| Hosting          | **Vercel** for both the frontend and the Express API.                                                                                                                    |
| Language         | **English only.** No Kinyarwanda or French content or i18n is needed for now.                                                                                            |
| Login / sign-up  | Backend features. The UI already exists at `/login`. It gets wired up once the backend exists.                                                                           |
| Who has accounts | **ForgeHub team only, for now.** `/login` is the team/admin door. Sign-ups create a _pending_ account that an existing admin approves.                                   |
| Member dashboard | **Postponed.** No learner/client accounts yet, so no `/dashboard`. It comes back when member accounts are switched on.                                                   |
| Programs         | Each program gets its **own detail page** (`/programs/[slug]`), and applying starts from there (`/programs/[slug]/apply`).                                               |
| Newsletter       | The sign-up form goes in the **footer**, so it is on every page.                                                                                                         |
| Scope            | Everything on the site that implies data, submissions or accounts gets a backend (full list in section 4).                                                               |
| Highest priority | The **admin area**: the team must be able to edit site content (programs, events, portfolio, team, copy) without editing code.                                           |
| Payments         | **Not needed yet**, but plan for them in the data model (section 5.5).                                                                                                   |
| Email            | Needed: notifications to the team and confirmations to users.                                                                                                            |
| New pages        | Admin and any other new pages must share the site's identity: same tokens, type, components and patterns. They may be adapted, never replaced. Full list in section 6.2. |

---

## 2. Frontend snapshot

### 2.1 Stack

| Concern   | Choice                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| Framework | Next.js **16.3.3**, App Router, React **19.2.8**, TypeScript (strict)                    |
| Styling   | Tailwind CSS **v4**, CSS-first `@theme` tokens in `src/app/globals.css` (~2,150 lines)   |
| Font      | **Satoshi** variable (300–900 + italic), self-hosted via `next/font/local`               |
| Scrolling | `lenis` (smooth scroll). The only runtime dependency besides Next/React.                 |
| Node      | `22.22.2` (`.nvmrc`)                                                                     |
| Tooling   | ESLint 9, Prettier 3 (+ tailwind plugin), `tsc --noEmit`                                 |
| CI        | `.github/workflows/ci.yml`: typecheck → lint → format check → build, on push/PR to main  |
| Data      | **None yet.** All content is hard-coded in `src/lib/site.ts`. No API calls, no env vars. |
| Rendering | Every route is statically rendered. `portfolio/[slug]` uses `generateStaticParams`.      |

`README.md` is **out of date** (it names Outfit/Plus Jakarta Sans, a "Kigali
Teal" palette and files like `hero.tsx` that no longer exist). Trust this file
and the code over the README.

Scripts: `npm run dev`, `build`, `start`, `typecheck`, `lint`, `format`,
`format:check`, and `verify` (everything CI runs). Run `npm run verify` before
calling frontend work done.

### 2.2 Routes

| Route               | File                                | Notes                                                                                              |
| ------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                 | `src/app/page.tsx`                  | Homepage. Its bands are called **"pages"** by the team (e.g. "the Programs page" = a band on `/`). |
| `/about`            | `src/app/about/page.tsx`            | Story + mission/vision cards                                                                       |
| `/services`         | `src/app/services/page.tsx`         | Two services + the Programs band reused                                                            |
| `/portfolio`        | `src/app/portfolio/page.tsx`        | Project index (rows)                                                                               |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | Project detail, statically generated from `projects`                                               |
| `/team`             | `src/app/team/page.tsx`             | Team portraits (no photos yet)                                                                     |
| `/contact`          | `src/app/contact/page.tsx`          | Contact form (mailto) + details                                                                    |
| `/login`            | `src/app/login/page.tsx`            | **Uncommitted.** Sign-in / create-account screen, `noindex`                                        |
| 404                 | `src/app/not-found.tsx`             | Custom                                                                                             |
| error               | `src/app/error.tsx`                 | Client error boundary. Deliberately depends on nothing heavy                                       |

Homepage band order: Hero → Manifesto → Portfolio (3 latest, horizontal pinned
gallery) → Community → Membership ("Three ways to join us") → Impact →
Programs (oxblood full-bleed band) → Events (inverted band) → Closing CTA →
Footer. An experimental Imigongo wheel (`imigongo-wheel.tsx`) turns behind the
homepage on desktop.

### 2.3 Folder map

```
src/
  app/
    layout.tsx        root layout: font, metadata, theme script, loader, Lenis,
                      scroll progress, cursor label, ViewTransition page wipe
    globals.css       ALL design tokens, utilities, motion, dark mode
    <route>/page.tsx  one file per route (see table above)
  components/         ~45 components (listed by role in section 7.3)
  lib/
    site.ts           SINGLE SOURCE OF TRUTH for copy and content (+ TS types)
    theme.ts          light/dark theme runtime (localStorage key "forgehub-theme")
    motion.ts         shared ids/constants for hero scroll motion
    loader.ts         first-visit loader gate (once per session)
    lenis.ts, pointer.ts, wheel.ts   motion helpers
  types/react-canary.d.ts             types for React <ViewTransition>
public/               logo files only (forgehub-lockup*.svg/png, forgehub-mark*.svg/png)
```

Other docs in the repo: `MOTION-CHANGES.md` (motion pass, how to switch
effects off) and `WHEEL-CHANGES.md` (the wheel experiment).

### 2.4 Work in progress at snapshot time (uncommitted)

- New: `src/app/login/page.tsx`, `src/components/account-screen.tsx`,
  `src/components/account-forms.tsx`.
- Modified: `globals.css`, `page.tsx`, `hero-display.tsx`, `hero-intro.tsx`,
  `site-footer.tsx`, `site-header.tsx` (big rewrite, adds the account icon
  linking to `/login`), `theme-toggle.tsx`, `motion.ts`, `site.ts` (adds
  `accountPage`).

All of it counts as current progress.

---

## 3. Logic and conventions already in place

### 3.1 Content lives in `src/lib/site.ts`

Every string, list and record on the site comes from typed exports in
`src/lib/site.ts`. Components import from it and never hard-code copy. That
file is the **de facto data model**, and its TypeScript types are the
**starting contract** for the backend's API responses (section 5).

Exports and their types:

| Export                                                                         | Type / shape                                                                 | Used by                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------- |
| `site`                                                                         | `{ name, region, tagline[3], city }`                                         | header, footer, login            |
| `navItems`                                                                     | `NavItem[]` `{ label, href, blurb?, primary? }`                              | header + menu                    |
| `hero`                                                                         | display, headline, summary, body, 2 CTAs                                     | homepage hero                    |
| `stats`                                                                        | `Stat[]` `{ value, label }` (currently unrendered)                           | —                                |
| `partners`                                                                     | `string[]` (empty on purpose)                                                | `PartnerMarquee` (not mounted)   |
| `manifesto`                                                                    | eyebrow, statement, body, cta                                                | Manifesto band                   |
| `membershipSection`, `plans`                                                   | `Plan[]` `{ slug, name, price, cadence, blurb, features[], featured?, cta }` | Membership band                  |
| `programsSection`, `programs`                                                  | `Program[]` `{ name, format, duration, blurb, status }`                      | Programs band (`/`, `/services`) |
| `eventsSection`, `events`                                                      | `SiteEvent[]` `{ date:{day,month}, name, kind, time, location }`             | Events band                      |
| `communitySection`, `testimonials`                                             | `Testimonial[]` `{ quote, name, role }`                                      | Community band                   |
| `impactSection`, `impact`                                                      | `Stat[]`                                                                     | Impact band                      |
| `closing`                                                                      | eyebrow, title, body, 2 CTAs                                                 | ClosingCta (6 pages)             |
| `contact`                                                                      | `{ addressLines[], email, phone, hours[] }`                                  | contact page, footer             |
| `menuColumns`, `footerLinks`, `socials`                                        | `MenuColumn[]`, `NavItem[]` (`socials` empty on purpose)                     | menu, footer                     |
| `aboutPage`                                                                    | story + pillars                                                              | `/about`                         |
| `services`, `servicesPage`                                                     | `Service[]` `{ id, index, name, blurb, detail, meta }`                       | `/services`                      |
| `projects`, `portfolioSection`, `portfolioEnd`, `projectPage`, `portfolioPage` | `Project[]` (see below)                                                      | homepage gallery, `/portfolio*`  |
| `teamMembers`, `teamPage`                                                      | `TeamMember[]` `{ name, role, photo? }`                                      | `/team`                          |
| `contactPage`                                                                  | copy + `note` + `submit`                                                     | `/contact`                       |
| `accountPage`                                                                  | signIn / signUp copy + `note`                                                | `/login`                         |
| `notFoundPage`, `errorPage`                                                    | copy                                                                         | 404, error                       |

`Project` = `{ slug, name, blurb, detail, client, year, disciplines[], status,
accent?: "amber"|"coral"|"lime"|"sky"|"teal", href?, cover?: ProjectImage,
gallery?: ProjectImage[], story?: { heading, body }[] }`.
`ProjectImage` = `{ src, alt, width, height }` (real pixel dimensions, needed by
`next/image`). **A project's `slug` is a public URL and must never change once
published.**

### 3.2 Server vs client components

- Pages and most bands are **server components**. Client components
  (`"use client"`) are only the interactive/motion pieces: `SiteHeader`,
  `Reveal`, `Scrub`, `Magnetic`, `ThemeToggle`, `Membership`, `Portfolio`,
  `AccountScreen`, `AccountForms`, the loader, cursor and wheel.
- Constants a server component needs from a client module live in plain
  modules (`src/lib/motion.ts`), because exports from a `"use client"` file
  arrive as client references, not values.

### 3.3 Theming

- Every colour resolves from **semantic role tokens** in the `@theme` block of
  `globals.css`: `surface`, `surface-2`, `surface-invert`, `line`, `line-mid`,
  `line-strong`, `text`, `text-muted`, `text-invert`, `accent`, `accent-strong`,
  `band`, `band-ink`. Components never name a hue.
- Palette: near-black `#0a0a0a` on white, warm off-white `#f4f2ef` for
  `surface-2`, brand **oxblood** accent (`#6d2621` / `#8f342c`, lifted to
  `#cc6154` in dark mode), deep oxblood band `#4a1417`. The only saturated
  colour is the animated gradient **blob** (amber, coral, lime, sky, teal).
- **Dark mode** redefines the role tokens only (media query plus
  `:root[data-theme="dark"]`, kept identical). There are no per-component dark
  variants. A blocking inline script (`ThemeScript`) sets `data-theme` before
  first paint. The user's choice is stored under `localStorage["forgehub-theme"]`.
- `[data-tone="oxblood"]` on a `Section` re-themes everything inside it, using
  the same trick.

### 3.4 Motion system

Everything is progressive enhancement. With reduced motion, no JavaScript or a
narrow screen, the page still renders complete. Key pieces: `rise` (load
entrance), `Reveal` (one-shot scroll reveal, `.reveal[data-shown]`), `Scrub`
(writes scroll progress `--p`), `SplitWords`/`SplitLetters`/`RollText`/
`RollLetters` (text effects), `Odometer`, `Magnetic` (buttons lean toward the
mouse), `CursorLabel` (a `data-cursor="Join"` attribute shows a cursor pill),
`fill-rise` (hover fill rising behind imigongo teeth), the page wipe via
`<ViewTransition>`, a first-visit `ForgeLoader`, and `ScrollProgress`. Details
and off-switches are in `MOTION-CHANGES.md`.

### 3.5 Accessibility conventions

The skip link targets `#hero-intro`, and every page's intro carries that id.
`main` opens before the hero so the `h1` sits inside it. There are visible focus
rings. Split and animated text is rendered once as real screen-reader text,
with the animated copy `aria-hidden`. Placeholders use full-strength
`text-text-muted` for contrast. Status messages use `role="status"`.
`<noscript>` styles park all reveals on their finished state.

### 3.6 Content rules (important for any backend-driven copy)

- **Never invent** numbers, names, dates, clients, quotes, prices or partners.
  Where something is unknown, the copy says plainly that it is coming (e.g.
  "Dates to come", "Details soon"), or the list is left empty and its component
  is not rendered.
- Search `site.ts` for `TODO` to find every outstanding content item.
- Forms say honestly what happens on submit. Today they state that no server is
  behind them. When the backend lands, replace those notes with the real
  behaviour. Don't just delete them.
- Testimonials need written permission from the person before publishing.
- Voice: short, plain, direct, confident without hype. Follow the existing copy
  in `site.ts`.

---

## 4. Everything that needs a backend — current state

| #   | Feature                                        | Where in the frontend                                                                                                                                            | What it does today                                                                                                                                                                                      | What the backend must provide                                                                                                                                                                                                               |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sign in / create account**                   | `/login` → `account-screen.tsx`, `account-forms.tsx`; `accountPage` in `site.ts`; person icon `AccountLink` in `site-header.tsx`                                 | Two tabs. Sign in: email + password. Create account: full name + email + password (min 8). `onSubmit` only calls `preventDefault()` and shows `accountPage.note` ("Accounts are not switched on yet…"). | Supabase Auth: sign-in, sign-up, sign-out, password reset, email verification, session. **Sign-ups are reviewed by an existing admin before they can sign in** (copy already promises this) → `pending` status plus an approval flow.       |
| 2   | **Admin area** (top priority)                  | Doesn't exist yet. `/login` is framed as the "Admin" door (`accountPage.eyebrow = "Admin"`)                                                                      | —                                                                                                                                                                                                       | Full content management (CRUD) for everything in `site.ts` that changes: programs, events, projects (+ images), team (+ photos), testimonials, impact stats, partners, socials, contact details, page copy. Approve users. See submissions. |
| 3   | **Contact form**                               | `/contact` (`src/app/contact/page.tsx`)                                                                                                                          | `<form action="mailto:info@forgehubrwanda.com" method="post" encType="text/plain">` with fields Name, Email, Message. The note says it opens your email app.                                            | `POST /contact` → store the message, email the team, send a confirmation email, spam protection and rate limiting. Update `contactPage.note`.                                                                                               |
| 4   | **Program applications / join**                | Programs rows link to `/services`. Hero CTA "Explore our programs" → `#programs`. Closing CTA "Join a program" → `/services`. Membership "Learner" → `/services` | No application form exists. Programs are placeholders ("Dates to come", "Details soon").                                                                                                                | Programs + cohorts (dates, format, capacity, status), an application form, application status tracking, admin review, emails.                                                                                                               |
| 5   | **Start a project / partner**                  | Membership "Builder" → `/contact` ("Start a project"), "Partner" → `/contact` ("Talk to us")                                                                     | Goes to the generic contact form.                                                                                                                                                                       | Enquiry types on the contact endpoint (`general`, `project`, `partner`, `training_for_org`) so admins can filter.                                                                                                                           |
| 6   | **Events + sign-ups**                          | Events band on `/` (`events.tsx`), `events` in `site.ts`                                                                                                         | One honest holding row ("TBA"). Rows link to `/contact`. `SiteEvent` has no machine-readable date (TODO: add an ISO date and restore `<time dateTime>`).                                                | Events CRUD with real ISO datetimes, location/online, capacity, sign-up/RSVP, confirmation and reminder emails, and a list of attendees for admins.                                                                                         |
| 7   | **Newsletter**                                 | Doesn't exist yet                                                                                                                                                | —                                                                                                                                                                                                       | Subscribe (double opt-in), unsubscribe link, and a subscriber list for admins. Frontend: a small email form in the **footer** (`site-footer.tsx`), plus confirm/unsubscribe pages.                                                          |
| 8   | **Member dashboard**                           | Doesn't exist yet                                                                                                                                                | —                                                                                                                                                                                                       | **Postponed** (team-only accounts for now). Later, for signed-in members: profile, my applications, my event sign-ups, payments.                                                                                                            |
| 9   | **Portfolio**                                  | `projects` in `site.ts`, `/portfolio`, `/portfolio/[slug]`, homepage gallery shows `projects.slice(0,3)`                                                         | 1 real project + 2 honest placeholder slots. Images are expected in `public/`, and none exist yet.                                                                                                      | Projects CRUD, image upload to Supabase Storage (store real width/height), ordering, draft/published.                                                                                                                                       |
| 10  | **Team**                                       | `teamMembers` in `site.ts`, `/team`                                                                                                                              | 4 members, no photos (3:4 slots).                                                                                                                                                                       | Team CRUD, photo upload, ordering.                                                                                                                                                                                                          |
| 11  | **Testimonials / impact / partners / socials** | `testimonials`, `impact`, `partners`, `socials` in `site.ts`                                                                                                     | Placeholders or empty on purpose.                                                                                                                                                                       | Simple CRUD. Testimonials need a `permission_confirmed` flag. The frontend already hides empty lists.                                                                                                                                       |
| 12  | **Site copy & contact details**                | `hero`, `manifesto`, `closing`, `aboutPage`, `contact`, etc.                                                                                                     | Hard-coded.                                                                                                                                                                                             | (Proposal) a key/value `site_content` table, so admins can edit copy. Do this last. Programs, events, projects and team come first.                                                                                                         |
| 13  | **Payments** (future)                          | None                                                                                                                                                             | "We will publish pricing when there is real pricing to publish." `Plan.price` holds step numbers, **not** prices. Don't render it as a price.                                                           | Plan only: see section 5.5.                                                                                                                                                                                                                 |
| 14  | **Error reporting / analytics**                | `error.tsx` logs to the console only                                                                                                                             | —                                                                                                                                                                                                       | (Proposal) Sentry or similar, and privacy-friendly analytics. Low priority.                                                                                                                                                                 |

---

## 5. Backend architecture — the agreed shape plus proposals

### 5.1 System overview

```
 Browser ──► Next.js frontend (Vercel)  ──fetch──►  Express API (Vercel)  ──►  Supabase
              - public pages (static/ISR)            - REST, JSON             - Postgres (+ RLS)
              - /login, /dashboard, /admin           - validates input        - Auth
              - proxy.ts guards private routes       - checks roles           - Storage (images)
                                                     - sends email ──► email provider
                                                     - calls revalidate ──► Next.js /api/revalidate
```

- **Express owns all business logic and all writes.** The frontend never uses
  the Supabase **service role key**.
- **Auth (proposal):** use Supabase Auth. The frontend signs in with the
  Supabase JS client (anon key) and sends the access token to Express as
  `Authorization: Bearer <jwt>`. Express verifies the JWT and loads the user's
  `profiles.role` and `profiles.status`. Alternative: Express proxies
  sign-in/sign-up itself and sets an httpOnly cookie. Decide before building
  auth. In either case, read `02-guides/authentication.md` and `16-proxy.md` for
  the Next.js side.
- **Roles (proposal):** `admin` (everything, approves users), `editor` (content
  only). A `member` role is postponed along with the dashboard. Account `status`: `pending` → `active` |
  `rejected` | `disabled`. New sign-ups start as `pending` (this matches the
  existing copy on `/login`).
- **Public content:** the frontend fetches it on the server and keeps pages
  static. When an admin saves, Express calls a secret-protected Next.js route
  handler that runs `revalidateTag`/`revalidatePath`. Pages stay fast and SEO
  stays intact. Read `01-getting-started/09-revalidating.md` first.
- **Express on Vercel (proposal):** export the Express `app` from an entry file
  as a Vercel function. Check Vercel's current Express docs at build time.
  Serverless means no in-memory state: rate limits and sessions must live in
  Postgres or a store such as Upstash Redis.

### 5.2 Suggested backend stack (proposals — confirm with the user)

| Concern    | Suggestion                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Language   | TypeScript, Node 22 (match `.nvmrc`)                                                                |
| Validation | `zod`, with schemas shared with the frontend where possible                                         |
| DB access  | `@supabase/supabase-js` (server, service role), or Drizzle/Kysely on the Postgres connection string |
| Migrations | Supabase CLI migrations, checked into the backend repo                                              |
| Email      | Resend (or Postmark / SES), React Email for templates                                               |
| Security   | `helmet`, strict CORS (the site's origins only), rate limiting, hCaptcha/Turnstile on public forms  |
| Logging    | `pino`                                                                                              |
| Tests      | Vitest + Supertest                                                                                  |

### 5.3 Data model (proposal, derived from the `site.ts` types)

All tables get `id uuid pk`, `created_at`, `updated_at`. Content tables also
get `status` (`draft` | `published`) and `sort_order int`. Turn on **RLS** for
every table: the public can read only `published` rows, and all writes go
through Express using the service role.

| Table                      | Columns (beyond the defaults)                                                                                                                                                         | Source type in `site.ts`          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `profiles`                 | `user_id → auth.users`, `full_name`, `email`, `role`, `status`, `approved_by`, `approved_at`                                                                                          | (new) `/login` sign-up fields     |
| `programs`                 | `slug`, `name`, `format`, `duration`, `blurb`, `status_label`, `is_open_for_applications`                                                                                             | `Program`                         |
| `cohorts`                  | `program_id`, `name`, `starts_at`, `ends_at`, `mode` (online / in_person), `location`, `capacity`, `application_deadline`                                                             | (new; replaces "Dates to come")   |
| `applications`             | `cohort_id` / `program_id`, `user_id?`, `full_name`, `email`, `phone`, `country`, `answers jsonb`, `status` (submitted/reviewing/accepted/rejected/withdrawn), `reviewed_by`, `notes` | (new)                             |
| `events`                   | `slug`, `name`, `kind`, `starts_at timestamptz`, `ends_at`, `location`, `is_online`, `capacity`, `registration_open`                                                                  | `SiteEvent` (add ISO date)        |
| `event_registrations`      | `event_id`, `user_id?`, `full_name`, `email`, `status` (registered/cancelled/attended)                                                                                                | (new)                             |
| `projects`                 | `slug` (unique, immutable once published), `name`, `blurb`, `detail`, `client`, `year`, `disciplines text[]`, `status_label`, `accent`, `href`                                        | `Project`                         |
| `project_sections`         | `project_id`, `heading`, `body`, `sort_order`                                                                                                                                         | `ProjectSection`                  |
| `media`                    | `storage_path`, `alt`, `width`, `height`, `owner_type`, `owner_id`, `role` (cover/gallery/photo)                                                                                      | `ProjectImage`                    |
| `team_members`             | `name`, `role`, `photo_media_id?`                                                                                                                                                     | `TeamMember`                      |
| `testimonials`             | `quote`, `name`, `role`, `permission_confirmed bool`                                                                                                                                  | `Testimonial`                     |
| `stats`                    | `value`, `label`, `placement` (impact)                                                                                                                                                | `Stat`                            |
| `partners`, `social_links` | `name`/`label`, `href`, `logo_media_id?`                                                                                                                                              | `partners`, `socials`             |
| `plans`                    | `slug`, `name`, `cadence`, `blurb`, `features text[]`, `featured`, `cta_label`, `cta_href`                                                                                            | `Plan` (drop `price` as a figure) |
| `contact_messages`         | `name`, `email`, `message`, `enquiry_type`, `status` (new/read/replied/archived), `ip_hash`                                                                                           | contact form                      |
| `newsletter_subscribers`   | `email` unique, `status` (pending/confirmed/unsubscribed), `confirm_token`, `confirmed_at`                                                                                            | (new)                             |
| `site_content`             | `key` unique (e.g. `hero.headline`), `value jsonb`                                                                                                                                    | `hero`, `manifesto`, `closing`, … |
| `audit_log`                | `actor_id`, `action`, `entity`, `entity_id`, `diff jsonb`                                                                                                                             | (new) who changed what            |

**Keep API response shapes identical to the `site.ts` types.** Then swapping a
hard-coded import for a fetch changes no component. When the backend is ready,
move those types into a shared package, or copy them into
`src/lib/types.ts`.

### 5.4 API surface (proposal)

Public (no auth):

```
GET  /v1/programs             GET  /v1/programs/:slug
GET  /v1/events               GET  /v1/events/:slug
GET  /v1/projects             GET  /v1/projects/:slug
GET  /v1/team                 GET  /v1/testimonials
GET  /v1/content              (site_content, stats, plans, partners, socials, contact)
POST /v1/contact              (rate-limited, captcha)
POST /v1/applications         (rate-limited, captcha)
POST /v1/events/:slug/register
POST /v1/newsletter/subscribe      GET /v1/newsletter/confirm?token=   POST /v1/newsletter/unsubscribe
```

Member (signed in, `status=active`) — **postponed** with the dashboard:

```
GET  /v1/me                   PATCH /v1/me
GET  /v1/me/applications      GET   /v1/me/registrations
```

Admin / editor:

```
CRUD /v1/admin/{programs,cohorts,events,projects,team,testimonials,stats,partners,socials,plans,content}
POST /v1/admin/media          (signed upload to Supabase Storage, returns width/height)
GET  /v1/admin/users          PATCH /v1/admin/users/:id   (approve / reject / role)   — admin only
GET  /v1/admin/applications   PATCH /v1/admin/applications/:id
GET  /v1/admin/registrations  GET /v1/admin/messages   PATCH /v1/admin/messages/:id
GET  /v1/admin/subscribers    (+ CSV export)
```

Errors: return a consistent JSON shape, e.g.
`{ "error": { "code": "VALIDATION_FAILED", "message": "...", "fields": { "email": "..." } } }`,
so forms can show field-level messages.

### 5.5 Payments (future — plan only, build nothing yet)

- Rwanda-relevant options: **MTN MoMo** and **Airtel Money** (mobile money),
  plus cards. An aggregator such as Flutterwave, Paystack or DPO covers all
  three. Not decided.
- Reserve these tables: `orders` (`user_id`, `item_type` [cohort/event/plan],
  `item_id`, `amount_minor int`, `currency` default `RWF`, `status`) and
  `payments` (`order_id`, `provider`, `provider_ref`, `status`, `raw jsonb`).
- Payment confirmation must come from **provider webhooks** verified by
  Express, never from the browser.
- `Plan.price` currently holds step numbers ("01"–"03"), not prices. Real
  prices go in new fields. Don't reuse `price`.

### 5.6 Email & notifications (proposal)

| Trigger                   | To the team (`info@forgehubrwanda.com`) | To the user                               |
| ------------------------- | --------------------------------------- | ----------------------------------------- |
| Contact message           | New message + reply-to                  | "We got your message"                     |
| Sign-up                   | "New account waiting for approval"      | Verify email, then "pending approval"     |
| Account approved/rejected | —                                       | Result                                    |
| Application submitted     | New application                         | Confirmation; later a status change email |
| Event registration        | (optional digest)                       | Confirmation + reminder (with .ics)       |
| Newsletter                | —                                       | Double opt-in confirmation                |

Also plan in-app notifications for the dashboard/admin (a `notifications`
table) once the basics work.

### 5.7 Environment variables

Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` (or
JWKS), `EMAIL_API_KEY`, `EMAIL_FROM`, `TEAM_INBOX=info@forgehubrwanda.com`,
`ALLOWED_ORIGINS`, `CAPTCHA_SECRET`, `FRONTEND_REVALIDATE_URL`,
`REVALIDATE_SECRET`.

Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CAPTCHA_SITE_KEY`,
`REVALIDATE_SECRET` (server only). Never prefix a secret with `NEXT_PUBLIC_`.
Add `.env.example` files to both repos.

---

## 6. Frontend work the backend will need (for later, not now)

### 6.1 Changes to existing code

1. `src/lib/api.ts`: a small typed fetch wrapper reading `NEXT_PUBLIC_API_URL`,
   returning the `site.ts` shapes, tagged for revalidation.
2. Replace hard-coded imports band by band (programs → events → projects → team
   → the rest). **Keep `site.ts` as the fallback** for static page copy until
   `site_content` exists.
3. `portfolio/[slug]`: `generateStaticParams` from the API, plus on-demand
   revalidation for new slugs.
4. `account-forms.tsx`: wire submit to auth, add loading/error/success states,
   and replace `accountPage.note`. Add "Forgot password", email verification and
   a "pending approval" screen.
5. `contact/page.tsx`: replace the `mailto:` action with a POST (a Server Action
   or client fetch to Express). Add enquiry type, captcha and inline field
   errors. Replace `contactPage.note`.
6. New routes: see section 6.2. Guard `/admin/*` in `proxy.ts`.
7. `Events`: render real dates with `<time dateTime>` once events have ISO
   dates, and link rows to `/events/[slug]` instead of `/contact`.
8. `Programs` band: link rows to `/programs/[slug]` instead of `/services`.
9. `site-footer.tsx`: add the newsletter form (email field + `btn-invert`,
   since the footer is an inverted panel).
10. Header `AccountLink`: go to `/admin` when signed in, `/login` otherwise.
11. Update the README when this lands.

### 6.2 New frontend pages to build

Every page below follows the design rules in section 7. "Template A" and
"Template B" refer to section 7.2.

**A. Public pages (Template A, which copies `src/app/contact/page.tsx`)**

| Route                     | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `/programs` (optional)    | Index of all programs. Otherwise the band and `/services` link straight to details |
| `/programs/[slug]`        | Program detail, upcoming cohorts, Apply button                                     |
| `/programs/[slug]/apply`  | Application form (public, no account needed)                                       |
| `/events/[slug]`          | Event detail + sign-up form                                                        |
| `/newsletter/confirm`     | Double opt-in result                                                               |
| `/newsletter/unsubscribe` | Unsubscribe result                                                                 |

**B. Team account screens (reuse the `/login` full-screen pattern in
`account-screen.tsx` / `account-forms.tsx`)**

| Route             | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `/login` (exists) | Wire up sign-in and sign-up (sign-up creates a _pending_ team account) |
| `/reset-password` | Forgot password + set a new one                                        |
| `/verify-email`   | Email verification result                                              |
| `/pending`        | "Your account is waiting for an admin to approve it"                   |

**C. Admin area (Template B: one shared `src/components/app-shell.tsx`,
`noindex`, guarded in `proxy.ts`)**

- `/admin`: overview (pending approvals, new messages, new applications,
  upcoming events).
- Content editors, each with a list view and a create/edit form:
  `/admin/programs` (+ cohorts), `/admin/events` (+ registrations),
  `/admin/projects` (+ image upload), `/admin/team`, `/admin/testimonials`,
  `/admin/stats`, `/admin/partners`, `/admin/socials`, `/admin/plans`,
  `/admin/content` (site copy).
- Operations: `/admin/users` (approve/reject, roles), `/admin/applications`,
  `/admin/messages`, `/admin/subscribers` (CSV export), `/admin/audit`.
- `/admin/account`: the signed-in team member's own profile and password.

**D. Postponed:** the member dashboard (`/dashboard/*`) and any payment pages.

---

## 7. Design rules for every new page (mandatory)

New pages (dashboard, admin, apply, event detail, auth flows) must look like
they come from the same studio as the existing pages. **Reuse the existing
components and utilities, and don't add new colours, fonts, radii or shadows.**
Adapting a pattern is fine. Inventing a parallel one is not.

### 7.1 The identity in one list

- **One typeface:** Satoshi. Display = `font-display text-oblique` (heavy italic
  uppercase). Headings = `font-display text-heading`. Eyebrows/meta =
  `text-label` (small uppercase, tracked) preceded by `<ImigongoRule />`.
- **Colour only through role tokens:** `bg-surface`, `bg-surface-2`,
  `text-text`, `text-text-muted`, `border-line`, `border-line-mid`,
  `text-accent`, etc. No hex values in components. Dark mode then works for free.
- **Square corners everywhere.** The one exception is pill buttons.
  **No shadows.** Separation comes from 1px `border-line` rules and `surface-2`.
- **Buttons:** `btn` (outline pill, fill rises on hover), `btn btn-strong`
  (2px, primary), `btn-invert` on dark surfaces. Put the label in `<RollText>`.
  Wrap the primary action in `<Magnetic>`. Add `data-cursor="Label"` for the
  cursor pill.
- **Imigongo geometry** is the brand motif: `ImigongoRule` (eyebrows),
  `ImigongoWatermark` (faint section backgrounds, opacity ~0.05), `ImigongoCorner`
  (hero corners), `ImigongoBand` (sawtooth edges), `ImigongoMark` (single
  motifs), and the `imigongo-underline` utility for active tabs/links.
- **Layout grid:** the page gutter is `px-6 lg:px-[3.6vw]`, content is
  `max-w-[110rem] mx-auto`, and 12-column grids use `lg:grid-cols-12`. Use
  `<Section>` for every band.
- **Lists are rows, not card grids:** `ul.border-line.border-t` > `li.border-line.border-b`,
  with a `grid lg:grid-cols-12` row inside. Clickable rows get
  `group fill-rise` and flip text with `group-hover:text-text-invert`.
- **Cards:** `border border-line bg-surface-2 p-8`. For emphasis, add the accent
  corner brackets used in `account-forms.tsx` (`CORNERS`).
- **Motion:** wrap blocks in `<Reveal delay={n*70}>`, titles in `SplitWords`.
  Respect reduced motion: use the existing utilities, which already handle it.

### 7.2 Page templates

**A. Public/marketing-style page** (event detail, program detail, apply page).
Copy the structure of `src/app/contact/page.tsx` exactly:

```tsx
<>
  <main>
    <div className="relative">
      <Blob className="top-[9vh] left-[10vw] h-[54vh] w-[52vw] sm:h-[60vh] sm:w-[30vw] lg:left-[11vw] lg:h-[64vh] lg:w-[24vw]" />
      <PageHeroLine title={page.title} />{" "}
      {/* REQUIRED: carries HERO_DISPLAY_ID, SiteHeader measures it */}
      <SiteHeader />
      <PageIntro eyebrow={page.eyebrow} lede={page.lede} />{" "}
      {/* carries id="hero-intro" for the skip link */}
      <ImigongoCorner
        id="imigongo-<page>-corner"
        motif="lozenge"
        opacity={0.13}
        className="corner-spin right-0 bottom-0 z-0 h-[58vh] w-[82vw] sm:w-[62vw] lg:h-[68vh] lg:w-[46vw]"
      />
    </div>
    <Section className="border-line border-t">
      <SectionHeading eyebrow="…" title="…" lede="…" />
      {/* content: rows, forms, cards */}
    </Section>
    <ClosingCta /> {/* optional, most public pages have it */}
  </main>
  <SiteFooter />
</>
```

Put all copy in `site.ts` (or the API), give every page `export const metadata`
with title `"<Page> — ForgeHub Rwanda"`, and make every id unique per page
(e.g. `imigongo-<page>-corner`).

**B. App pages** (`/dashboard/*`, `/admin/*`). These are working tools, so they
use a calmer layout built from the same parts:

- The reference is `/login` (`account-screen.tsx`): the menu's top bar
  (`ImigongoRule` + title on the left, `ThemeToggle` + close/sign-out on the
  right), the 8/4 grid, the sawtooth `ImigongoBand` foot, the framed card with
  accent corners.
- Build one shared `AppShell` component (in `src/components/`) and use it on
  every dashboard/admin page: the logo tile (`<Logo />`) linking home, a
  section nav (vertical list on desktop, rows or tabs on mobile, active item
  marked with `imigongo-underline-on` or a `text-accent` rule), the theme
  toggle, the account/sign-out control, and content inside
  `max-w-[110rem] px-6 lg:px-10`.
- **Skip** the heavy marketing motion (blob, oversized display line, pinned
  scroll effects, loader) inside the app. **Keep** the type scale, tokens,
  `text-label` eyebrows, `btn` pills, `RollText` labels, `Reveal` entrances and
  `ImigongoWatermark` at low opacity.
- Page heading inside the app: `text-label` eyebrow with `ImigongoRule`, then
  `h1.font-display.text-heading` at roughly `text-[clamp(2rem,4vw,3rem)]`.
- **Tables:** no zebra striping and no shadows. Use a `border-line` hairline
  under each row, `text-label text-text-muted` headers, and
  `hover:bg-surface-2` on rows. Show status as a bordered square chip
  (`border border-line px-3 py-1.5 text-label`), like the discipline chips on
  `/portfolio`. Use `text-accent` for attention states.
- Give every private page `robots: { index: false, follow: false }`, like
  `/login`.

### 7.3 Components to reuse (by role)

| Need              | Component / utility                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Page shell        | `SiteHeader`, `SiteFooter`, `PageHeroLine`, `PageIntro`, `Section`, `ClosingCta`                      |
| Headings          | `SectionHeading` (eyebrow, title, lede, action, drift)                                                |
| Reveal / motion   | `Reveal`, `Scrub`, `SplitWords`, `SplitLetters`, `RollText`, `RollLetters`, `Odometer`, `Magnetic`    |
| Brand pattern     | `ImigongoRule`, `ImigongoWatermark`, `ImigongoCorner`, `ImigongoBand`, `ImigongoMark`, `Blob`, `Logo` |
| Images            | `ProjectImage` (labelled empty slot when there's no image yet)                                        |
| Theme             | `ThemeToggle` (safe to render several times)                                                          |
| Full-screen panel | The `menu-veil` / `menu-panel` / `menu-*` classes (see `account-screen.tsx`)                          |

### 7.4 Forms (one pattern site-wide)

Match the contact and login forms:

```tsx
const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-2 w-full border px-4 py-2.5 text-base transition-colors hover:border-text focus:border-text";
// contact page uses mt-3 py-3 text-lg for a roomier public form

<div className="field">                              {/* .field makes the label roll + ink on focus */}
  <label htmlFor="x" className="text-label text-text-muted"><RollText>Label</RollText></label>
  <input id="x" name="x" className={FIELD_CLASS} required />
</div>
<Magnetic className="w-fit">
  <button type="submit" data-cursor="Send" className="btn btn-strong w-fit"><RollText>Send</RollText></button>
</Magnetic>
<p role="status" className="text-text-muted text-sm">…honest status / error text…</p>
```

Add loading (disable the button and change the label), field-level errors
(`text-accent` under the field, `aria-invalid`, `aria-describedby`) and success
states in the same plain voice. Tabs follow `account-forms.tsx`
(`role="tablist"`, `imigongo-underline` for the active tab).

### 7.5 Checklist before calling a page done

- [ ] Uses role tokens only, and looks right in **light and dark**.
- [ ] Square corners, no shadows, pills only for buttons.
- [ ] Eyebrow + `ImigongoRule`, `text-heading` titles, Satoshi only.
- [ ] Works at phone width (375px) with no horizontal scroll.
- [ ] Works with reduced motion and keyboard only (focus visible, skip link target exists).
- [ ] All copy lives in `site.ts` or comes from the API, and none of it is invented.
- [ ] `metadata` set. Private pages are `noindex`.
- [ ] `npm run verify` passes.

---

## 8. Suggested build order

1. **Backend foundations:** repo, Express + TS skeleton, Supabase project,
   migrations for `profiles` and content tables, RLS, error format, CORS, deploy
   to Vercel, `.env.example`.
2. **Team auth:** sign-up (pending) → admin approval → sign-in / sign-out /
   reset. Wire `/login` and build `/reset-password`, `/verify-email`,
   `/pending`. Add `proxy.ts` guards on `/admin`.
3. **Admin shell + content CRUD:** `AppShell`, `/admin`, `/admin/users`, then
   programs (+ cohorts), events, projects (+ media), team. Add revalidation back
   to the frontend.
4. **Frontend reads from the API:** band by band, keeping the shapes identical.
   Add `/programs/[slug]` and `/events/[slug]`.
5. **Public submissions:** contact form, `/programs/[slug]/apply`, event
   sign-ups, footer newsletter + confirm/unsubscribe pages, and their emails.
   Matching admin inboxes: applications, messages, subscribers.
6. **Remaining content:** testimonials, stats, partners, socials, plans,
   `site_content` copy editing, audit log, `/admin/account`.
7. **Later:** member dashboard, payments (5.5), in-app notifications, analytics
   and error reporting.

---

## 9. Open questions for the team

- Auth: Supabase client on the frontend with a bearer token to Express, or
  Express-managed cookie sessions?
- What fields does a program application need?
- Is a `/programs` index page wanted, or only the detail pages?
- Which email provider, and which sending domain (e.g. `mail.forgehubrwanda.com`)?
- Backend repo name, and does the API live on a subdomain (`api.forgehubrwanda.com`)?
- Does the Imigongo wheel experiment ship to `main`? (It affects the homepage only.)
- Payment provider, and what gets paid for first (cohorts, events, services)?
