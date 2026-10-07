/**
 * Single source of truth for site copy, navigation and section content.
 *
 * Copy below is the approved ForgeHub content draft. Where the draft carried a
 * `[PLACEHOLDER: ...]` note, nothing has been invented in its place: the copy
 * either says plainly that the detail is still to come, or carries a `TODO`
 * marking exactly what needs supplying. Search this file for "TODO" to find
 * every outstanding item.
 */

export const site = {
  name: "ForgeHub",
  region: "Rwanda",
  tagline: ["Build", "Innovate", "Empower"],
  city: "Kigali",
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** Short line shown in the full-screen menu. */
  blurb?: string;
  /** Shown in the desktop nav row. Non-primary items live in the menu only. */
  primary?: boolean;
};

export const navItems: NavItem[] = [
  {
    label: "About",
    href: "/about",
    blurb: "Why ForgeHub exists",
    primary: true,
  },
  {
    label: "Services",
    href: "/services",
    blurb: "Software development and training",
    primary: true,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    blurb: "The software we have built",
    primary: true,
  },
  {
    label: "Team",
    href: "/team",
    blurb: "The engineers behind ForgeHub",
    primary: true,
  },
  {
    label: "Contact",
    href: "/contact",
    blurb: "Kigali, Rwanda, and online",
    primary: true,
  },
];

export const hero = {
  /**
   * The oversized oblique line. Kept to three short words: it is set to fill
   * the viewport width edge-to-edge, so any more and it stops fitting on
   * narrow screens without dropping to an unreadable size.
   */
  display: "Forge the future",
  /** Upright sub-headline beneath the display line. */
  headline: "Building Africa’s next generation of software engineers",
  /**
   * The one-line summary under the sub-headline. Sized to hold a single line
   * on desktop, so keep it at roughly this length.
   */
  summary:
    "ForgeHub Rwanda is a Kigali software studio and training hub, building software for clients and training Africa’s next engineers.",
  /**
   * The paragraph under the summary; free to wrap. `strong` marks the run set
   * in bold, matching the reference's emphasised clause.
   */
  body: {
    text: "We design and build software for clients, and we train the engineers who will build the rest, ",
    strong: "online across Africa, and in person in Kigali",
    tail: ".",
  },
  /**
   * What a phone shows in place of the summary and the paragraph: the two say
   * the same thing twice, which a wide screen has room for and a phone's first
   * screen does not. One sentence, so the opening screen keeps some air.
   */
  phoneLine:
    "We build software for clients and train Africa’s next engineers, online and in Kigali.",
  primaryCta: { label: "Explore our programs", href: "#programs" },
  secondaryCta: { label: "Work with us", href: "/services" },
  scrollCue: "Scroll",
} as const;

export type Stat = { value: string; label: string };

/**
 * Currently unrendered — the homepage figures rail reads from `impact` below.
 * Kept in step with it so the two can never disagree if this is ever wired up.
 */
export const stats: Stat[] = [
  { value: "2026", label: "Founded in Kigali" },
  { value: "4", label: "Founding engineers" },
  { value: "ALU", label: "Where we trained" },
  { value: "Soon", label: "First results published" },
];

/**
 * TODO: no partners are confirmed yet, so this list is deliberately empty and
 * `<PartnerMarquee />` is not rendered on the homepage. Add real, agreed
 * partners here and re-add the component to `src/app/page.tsx`.
 */
export const partners: string[] = [];

/* ========================================================================== */
/*  Manifesto                                                                 */
/* ========================================================================== */

export const manifesto = {
  eyebrow: "Why we exist",
  /** Rendered word-by-word so each can be revealed on scroll. */
  statement:
    "Africa’s biggest opportunity is technology. Its biggest challenge is jobs. ForgeHub exists to close that gap, one engineer at a time.",
  body: "Founded in Kigali in 2026 by software engineers trained at African Leadership University. Our curriculum asked us to take on one of Africa’s grand challenges. We chose job creation.",
  cta: { label: "Learn more about us", href: "/about" },
} as const;

/* ========================================================================== */
/*  Membership                                                                */
/* ========================================================================== */

export type Plan = {
  /**
   * Stable id for the panel, and the anchor its index entry links to. Prefixed
   * so it cannot collide with a section id elsewhere on the homepage.
   */
  slug: string;
  name: string;
  /**
   * Not a price. There is no published pricing yet, so this field carries the
   * step number that used to lead each card rather than a figure that would
   * have to be invented.
   *
   * Nothing renders it since the band became an index: the numeral shown there
   * is derived from the entry's position, so that real pricing landing in this
   * field can never turn an index into "from RWF 450,000". Kept because the
   * TODO still stands. TODO: revisit if and when real pricing is agreed.
   */
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  cta: { label: string; href: string };
};

export const membershipSection = {
  eyebrow: "Ways in",
  title: "Three ways to join us",
  lede: "Whether you want to learn, build or back the mission, there is a door for you. Pricing will be published once it is confirmed.",
} as const;

export const plans: Plan[] = [
  {
    slug: "join-learner",
    name: "Learner",
    price: "01",
    cadence: "Online or in Kigali",
    blurb: "Join a training cohort.",
    features: [
      "Online cohorts, open across Africa",
      "In-person intensives in Kigali",
      "Taught by working software engineers",
      "Course names and dates coming soon",
    ],
    cta: { label: "See our training", href: "/services" },
  },
  {
    slug: "join-builder",
    name: "Builder",
    price: "02",
    cadence: "Client projects",
    blurb: "Bring us your software project.",
    features: [
      "We design and build software products",
      "Scoped with you before anything starts",
      "Built by the same engineers we train",
      "Tell us what you need and get a straight answer",
    ],
    featured: true,
    cta: { label: "Start a project", href: "/contact" },
  },
  {
    slug: "join-partner",
    name: "Partner",
    price: "03",
    cadence: "Support the mission",
    blurb: "Back the engineers we are training.",
    features: [
      "Sponsor a cohort or a learner",
      "Hire from the people we train",
      "Host or co-run a workshop",
      "Founding partners coming soon",
    ],
    cta: { label: "Talk to us", href: "/contact" },
  },
];

/* ========================================================================== */
/*  Programs                                                                  */
/* ========================================================================== */

export type Program = {
  name: string;
  format: string;
  duration: string;
  blurb: string;
  status: string;
};

export const programsSection = {
  eyebrow: "Programs",
  title: "Software training built for Africa",
  lede: "Online cohorts you can join from anywhere, and in-person intensives in Kigali.",
  cta: { label: "See our services", href: "/services" },
} as const;

/**
 * TODO: specific course names, formats and start dates are not confirmed. Each
 * entry below describes a track we have committed to, not a scheduled cohort —
 * replace `duration` and `status` with real detail before promoting any of it.
 */
export const programs: Program[] = [
  {
    name: "Online cohorts",
    format: "Live, online",
    duration: "Dates to come",
    blurb: "Live software training you can join from any city in Africa.",
    status: "Details soon",
  },
  {
    name: "Kigali intensives",
    format: "In person",
    duration: "Dates to come",
    blurb:
      "Hands-on training in the room with us, for those who can get to Kigali.",
    status: "Details soon",
  },
  {
    name: "For organizations",
    format: "Team training",
    duration: "By arrangement",
    blurb:
      "Software training for your team, shaped around what your organization builds.",
    status: "Talk to us",
  },
];

/* ========================================================================== */
/*  Events                                                                    */
/* ========================================================================== */

export type SiteEvent = {
  date: { day: string; month: string };
  name: string;
  kind: string;
  time: string;
  location: string;
};

export const eventsSection = {
  eyebrow: "What’s on",
  title: "Our first meetups are in the works",
  lede: "Community meetups and demo days are being planned. They will appear here as soon as they are confirmed.",
  cta: { label: "Get in touch", href: "/contact" },
} as const;

// The events themselves are managed from /admin/events and read by
// `getEvents()` in src/lib/content.ts.

/* ========================================================================== */
/*  Community                                                                 */
/* ========================================================================== */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const communitySection = {
  eyebrow: "Community",
  title: "More than a company",
  lede: "A growing community of young African engineers, dreamers and builders determined to turn technology into Africa’s biggest job creator.",
} as const;

// The quotes themselves are managed from /admin/community and read by
// `getTestimonials()` in src/lib/content.ts. Add one only once the member has
// given written permission to publish their name and words.

/* ========================================================================== */
/*  Impact                                                                    */
/* ========================================================================== */

export const impactSection = {
  eyebrow: "Impact",
  title: "We’re just getting started",
  body: [
    "Founded in Kigali in 2026 by software engineers trained at African Leadership University, ForgeHub set out to solve one problem: jobs. We measure our mission one engineer, one job, one product at a time.",
    "Figures on graduates trained, jobs created and products shipped will follow once we have earned them. Until then, we share only what we can state for certain.",
  ],
  cta: { label: "Read our story", href: "/about" },
} as const;

/**
 * Only verifiable facts. TODO: replace with graduates trained, jobs created
 * and products shipped once those figures exist and can be stood behind.
 */
export const impact: Stat[] = [
  { value: "2026", label: "Founded in Kigali" },
  { value: "4", label: "Founding engineers" },
  { value: "ALU", label: "Where we trained" },
  { value: "Soon", label: "First results published" },
];

/* ========================================================================== */
/*  Closing CTA + footer                                                      */
/* ========================================================================== */

export const closing = {
  eyebrow: "Build with us",
  title: "Let’s build what’s next",
  /**
   * One line, deliberately. The two buttons under it already say "Join a
   * program" and "Get in touch", so the invitation the old two-line version
   * opened with was restating them; what only this line says is where we
   * work. Kept short enough to sit on a single line inside the 48ch measure
   * it is set in — a second line puts the height straight back.
   */
  body: "In Kigali, and online across Africa.",
  primaryCta: { label: "Join a program", href: "/services" },
  secondaryCta: { label: "Get in touch", href: "/contact" },
} as const;

/**
 * TODO: `addressLines` carries only the city, which is all that is confirmed.
 * Add a street address, and real opening hours, once there is a premises to
 * publish. `email` and `phone` are the confirmed published details.
 */
export const contact = {
  addressLines: ["Kigali, Rwanda"],
  email: "info@forgehubrwanda.com",
  phone: "+250 791 774 313",
  hours: [{ days: "Kigali", time: "Address and hours coming soon" }],
} as const;

export type MenuColumn = { title: string; links: NavItem[] };

/**
 * Grouped links the full-screen menu reveals in the corner of each of its
 * items on hover. Named for the one place that uses them: the footer used to
 * render these as four columns and no longer does — it carries `footerLinks`
 * below instead, which is a single row.
 *
 * Only the three titles `SiteHeader` maps onto a menu item are kept. A fourth
 * "More" column existed purely to fill out the old footer, and went with it.
 */
export const menuColumns: MenuColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our story", href: "/about#story" },
      { label: "Team", href: "/team" },
      { label: "Community", href: "/#community" },
    ],
  },
  {
    title: "What we do",
    links: [
      { label: "Services", href: "/services" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Software development", href: "/services#build" },
      { label: "Training & education", href: "/services#train" },
      { label: "Programs", href: "/#programs" },
    ],
  },
  {
    title: "Join",
    links: [
      { label: "Ways in", href: "/#membership" },
      { label: "Join a program", href: "/services" },
      { label: "Start a project", href: "/contact" },
      { label: "Partner with us", href: "/contact" },
    ],
  },
];

/**
 * The compact footer's single row of links.
 *
 * Deliberately short. The footer is a sign-off, not a second navigation: every
 * page here is one tap away in the menu, which is on screen at all times, so a
 * seventeen-link sitemap at the foot of the page was repeating what the header
 * already does. What is left is the five real pages plus the one homepage band
 * that has no page of its own.
 */
export const footerLinks: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Team", href: "/team" },
  { label: "Programs", href: "/#programs" },
  { label: "Contact", href: "/contact" },
];

/**
 * TODO: add the real social profile URLs. Empty until then, so that nothing on
 * the site links out to a placeholder.
 */
export const socials: NavItem[] = [];

/* ========================================================================== */
/*  About page                                                                */
/* ========================================================================== */

export const aboutPage = {
  eyebrow: "Who we are",
  title: "About",
  lede: "ForgeHub Rwanda is a Kigali-based software studio and training hub, turning young African talent into world-class engineers and technology into jobs.",
  story: {
    eyebrow: "Our story",
    title: "Founded in Kigali, in 2026",
    body: [
      "ForgeHub Rwanda was founded in 2026 in Kigali by Jimmy Shimwa and Fadhiri Ihirwe Ndegeya, two software engineers trained at African Leadership University.",
      "Our curriculum asked us to choose one of Africa’s grand challenges as our opportunity. We chose technology, with job creation as the problem we set out to solve.",
    ],
  },
  pillars: [
    {
      name: "Our mission",
      body: "To build a community and a platform where young African dreamers, software engineers and those who support them grow into the talent that transforms the continent.",
    },
    {
      name: "Our vision",
      body: "An Africa where technology is a reliable engine for job creation, built by engineers trained right here.",
    },
  ],
  cta: { label: "Meet the team", href: "/team" },
} as const;

/* ========================================================================== */
/*  Services page                                                             */
/* ========================================================================== */

export type Service = {
  /** Doubles as the in-page anchor the footer links to. */
  id: string;
  index: string;
  name: string;
  blurb: string;
  detail: string;
  meta: string;
};

/**
 * TODO: the specific service list under "Software development" (web apps,
 * mobile apps, custom platforms) and the specific tracks and curricula under
 * "Training & education" are not confirmed. Both `meta` lines say so rather
 * than listing anything unagreed.
 */
export const services: Service[] = [
  {
    id: "build",
    index: "01",
    name: "Software development",
    blurb: "We design and build software products for clients.",
    detail:
      "Tell us what you are building. We will tell you plainly whether we are the right team, what it would take and how we would approach it.",
    meta: "Full service list coming soon",
  },
  {
    id: "train",
    index: "02",
    name: "Training & education",
    blurb: "Software training for individuals and organizations.",
    detail:
      "Delivered online across Africa and in person in Kigali, for beginners and for teams sharpening the skills they already use.",
    meta: "Tracks and curricula coming soon",
  },
];

export const servicesPage = {
  eyebrow: "What we do",
  title: "Services",
  lede: "We build software for clients, and we train the engineers who will build the rest.",
  heading: {
    eyebrow: "Our work",
    title: "Two things, done well",
    lede: "Everything ForgeHub does falls under one of these two. If it does not, we are probably not the right people for it.",
  },
  cta: { label: "Work with us", href: "/contact" },
} as const;

/* ========================================================================== */
/*  Portfolio                                                                 */
/* ========================================================================== */

/**
 * An image belonging to a project.
 *
 * `width` and `height` are the file's real pixel dimensions, not the size it
 * is displayed at: `next/image` needs them to reserve the right space before
 * the file has loaded, which is what stops the page jumping as images arrive.
 */
export type ProjectImage = {
  /** Path under `public/`, beginning with a slash. */
  src: string;
  /**
   * What the image shows, for anyone who cannot see it. Never the project's
   * name — that is already the heading beside it — but what is actually in the
   * frame. An empty string is correct only for an image that adds nothing to
   * the words around it.
   */
  alt: string;
  width: number;
  height: number;
};

/**
 * A project's colour, as a CSS value: its own `accent`, or the next in a fixed
 * cycle so a new project never needs one to look right. With no project — the
 * homepage gallery's closing card — it is the warm coral the page's blobs end
 * on. Shared by the gallery's band tint and the project-image artwork.
 */
const TINT_CYCLE = ["amber", "sky", "teal", "lime"] as const;

export const projectTint = (project: Project | undefined, index: number) =>
  `var(--color-blob-${
    project
      ? (project.accent ?? TINT_CYCLE[index % TINT_CYCLE.length])
      : "coral"
  })`;

/** One part of a project's write-up. */
export type ProjectSection = { heading: string; body: string };

export type Project = {
  /**
   * Stable id. Doubles as the in-page anchor and as the slug a per-project
   * detail route would use later, so changing one breaks any link already
   * shared.
   */
  slug: string;
  name: string;
  /** One line on what the thing is. */
  blurb: string;
  /** What we did and what it changed. The card is a taster, not a case study. */
  detail: string;
  /** Who it was for. `In-house` for our own products. */
  client: string;
  /** Year delivered, or the year work started on anything still running. */
  year: string;
  /** Which of the two services it sits under, plus anything more specific. */
  disciplines: string[];
  /** Short status line — `Live`, `In build`, `Write-up in preparation`. */
  status: string;
  /**
   * Which of the blob colours the homepage gallery tints its band with while
   * this card is centred. Optional; unset entries take the next colour in a
   * fixed cycle, so a new project never needs one to look right.
   */
  accent?: "amber" | "coral" | "lime" | "sky" | "teal";
  /**
   * The live product, if there is one to link to AND the client is happy to be
   * linked from here. Left undefined otherwise: a card without it simply has
   * no link rather than pointing at a placeholder.
   */
  href?: string;

  /**
   * The lead image on the project's own page. Left undefined until there is a
   * real one: the page then draws a labelled slot in its place rather than a
   * stand-in that could be mistaken for the work.
   */
  cover?: ProjectImage;

  /** Further images, shown beneath the write-up. Empty until they are real. */
  gallery?: ProjectImage[];

  /**
   * The write-up, section by section, shown only on the project's own page.
   * The index deliberately does not use it — that page is meant to be
   * scannable, and the depth is what the detail page is for.
   */
  story?: ProjectSection[];
};

export const portfolioSection = {
  eyebrow: "Selected work",
  title: "What we have built",
  lede: "Software we designed, built and shipped, for clients and for ourselves.",
  action: { label: "See the full portfolio", href: "/portfolio" },
} as const;

// The projects themselves are managed from /admin/portfolio and read by
// `getProjects()` in src/lib/content.ts.

/**
 * The card that closes the gallery. Not a project — it is the invitation the
 * track ends on, so the sideways scroll arrives somewhere rather than simply
 * running out.
 */
export const portfolioEnd = {
  eyebrow: "Next",
  title: "Your project could take this slot",
  body: "Tell us what you are building. We will tell you plainly whether we are the right team for it, and what it would take.",
  cta: { label: "Work with us", href: "/contact" },
} as const;

/**
 * Copy for a project's own page. Deliberately short: almost everything on that
 * page comes from the project itself, and anything written here would have to
 * be true of all of them.
 */
export const projectPage = {
  /** Above the write-up. */
  storyEyebrow: "The work",
  /** Above the images, when there are any. */
  galleryEyebrow: "Stills",
  /** Leads the link on to the next project. */
  nextEyebrow: "Next project",
  backLabel: "All work",
  /** Shown in an image slot that has no image yet. */
  imagePending: "Image to come",
} as const;

export const portfolioPage = {
  eyebrow: "Our work",
  title: "Portfolio",
  lede: "Software we have built for clients and for ourselves. New projects appear here as clients clear them to be named.",
  heading: {
    eyebrow: "Selected work",
    title: "Built in Kigali, shipped wherever it is needed",
    lede: "Behind every entry: software we designed and built, and engineers we trained to do the same.",
  },
} as const;

/* ========================================================================== */
/*  Team page                                                                 */
/* ========================================================================== */

export type TeamMember = {
  name: string;
  role: string;
  /**
   * The member's portrait. Optional, and currently absent for all four: no
   * photography has been shot yet. Every slot renders at the same 3:4 ratio
   * either way, so dropping the real files in shifts nothing on the page.
   *
   * When the photos arrive, put them in `public/team/` and fill this in. The
   * `alt` is what the person LOOKS like in the frame, never their name — the
   * name is already the heading beside it, and repeating it makes a screen
   * reader say it twice. An empty string is right if the portrait is a plain
   * head-and-shoulders that the name and role already cover.
   */
  photo?: ProjectImage;
};

// The team itself is managed from /admin/team and read by `getTeam()` in
// src/lib/content.ts. TODO: confirm the exact titles for Benjamin Inema and
// Ishimwe Valentin, then update them there.

export const teamPage = {
  eyebrow: "The people",
  title: "Team",
  lede: "Software engineers trained at African Leadership University, building technology and jobs from Kigali.",
  heading: {
    eyebrow: "Founding team",
    title: "The engineers behind ForgeHub",
    lede: "Each of us chose technology as Africa’s opportunity, and job creation as the challenge worth solving.",
  },
  cta: { label: "Work with us", href: "/contact" },
  /** Stands in the empty portrait frames until the photographs are taken. */
  photoPending: "Portrait to come",
} as const;

/* ========================================================================== */
/*  Contact page                                                              */
/* ========================================================================== */

export const contactPage = {
  eyebrow: "Say hello",
  title: "Contact",
  lede: "Join a program, bring us a project, or simply introduce yourself.",
  heading: {
    eyebrow: "Send a message",
    title: "Tell us what you’re building",
    lede: "Just three fields. Or write to us directly at the address opposite.",
  },
  note: "Your message goes straight to our team. We read everything that comes in.",
  submit: "Send message",
} as const;

/**
 * The admin sign-in and sign-up page, reached from the person icon in the
 * nav. Signing up only creates an account — it does not grant admin access;
 * an existing admin still has to add the new email on Admin → Admins.
 */
export const accountPage = {
  eyebrow: "Admin",
  title: "Account",
  lede: "Sign in to manage the site.",
  signIn: {
    tab: "Sign in",
    heading: "Welcome back",
    lede: "Use the email and password you were given as an admin.",
    submit: "Sign in",
  },
  signUp: {
    tab: "Create account",
    heading: "Create an account",
    lede: "This creates a login only. An existing admin still has to grant you access.",
    submit: "Create account",
  },
} as const;

/* ========================================================================== */
/*  Error and recovery pages                                                  */
/* ========================================================================== */

/**
 * Shown for any URL that matches no route, and for a project slug that does
 * not exist — `portfolio/[slug]` calls `notFound()` for those. Until now both
 * cases fell through to Next's stock 404, which carries none of the site's
 * type, colour or navigation.
 *
 * The three links are the places someone who mistyped a URL was most likely
 * heading, so the page is a way onwards rather than a dead end.
 */
export const notFoundPage = {
  code: "404",
  eyebrow: "Not found",
  title: "That page is not here",
  body: "The link may be out of date or the address mistyped. The page you are looking for does not exist.",
  links: [
    { label: "Back to home", href: "/" },
    { label: "See our work", href: "/portfolio" },
    { label: "Get in touch", href: "/contact" },
  ],
} as const;

/**
 * The runtime error boundary. Deliberately says less than the 404: we do not
 * know what went wrong, so it promises nothing beyond a way onwards.
 */
export const errorPage = {
  eyebrow: "Something went wrong",
  title: "That did not load",
  body: "An unexpected error stopped this page from loading. Trying again usually fixes it. If not, the link below will take you home.",
  retry: "Try again",
  home: "Back to home",
} as const;
