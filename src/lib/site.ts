/**
 * Single source of truth for site copy, navigation and section content.
 *
 * ⚠️  PLACEHOLDER CONTENT WARNING
 * ---------------------------------------------------------------------------
 * Everything below marked `@placeholder` is a DRAFT written to exercise the
 * layout — not verified ForgeHub fact. That includes every figure in `stats`
 * and `impact`, every price in `membership`, every date in `events`, the
 * partner list, the testimonials, and the contact details.
 *
 * None of it should go public unreviewed. Search this file for "@placeholder"
 * to find each one.
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
    label: "Spaces",
    href: "#spaces",
    blurb: "Desks, studios and meeting rooms",
    primary: true,
  },
  {
    label: "Membership",
    href: "#membership",
    blurb: "Passes and monthly plans",
    primary: true,
  },
  {
    label: "Programs",
    href: "#programs",
    blurb: "Fellowships, bootcamps, residencies",
    primary: true,
  },
  {
    label: "Events",
    href: "#events",
    blurb: "What’s on this month",
    primary: true,
  },
  {
    label: "About",
    href: "#about",
    blurb: "Why ForgeHub exists",
    primary: true,
  },
  {
    label: "Community",
    href: "#community",
    blurb: "The people who build here",
  },
];

export const hero = {
  /**
   * The oversized oblique line. Kept to three short words: it is set to fill
   * the viewport width edge-to-edge, so any more and it stops fitting on
   * narrow screens without dropping to an unreadable size.
   */
  display: "Build what’s next",
  /** Upright sub-headline beneath the display line. */
  headline: "Build, test and launch what you’re making at ForgeHub Kigali",
  /**
   * Lead paragraphs. `strong` marks the run set in bold, matching the
   * reference's emphasised clause.
   */
  body: [
    {
      text: "Somewhere to sit, somewhere to solder, and a room full of people who have already made the mistake you are about to make.",
    },
    {
      text: "We keep the tools, the mentors and the late-night door key in one building in Kigali, so that ",
      strong:
        "the distance between having an idea and testing it is a flight of stairs",
      tail: ", not a funding round.",
    },
  ],
  primaryCta: { label: "Book a tour", href: "#tour" },
  secondaryCta: { label: "Explore membership", href: "#membership" },
  scrollCue: "Scroll",
} as const;

export type Stat = { value: string; label: string };

/** @placeholder — every figure here is invented. */
export const stats: Stat[] = [
  { value: "1,200+", label: "Members & alumni" },
  { value: "80+", label: "Ventures launched" },
  { value: "45", label: "Programs a year" },
  { value: "24/7", label: "Studio access" },
];

/** @placeholder — partner names are illustrative, not confirmed sponsors. */
export const partners: string[] = [
  "Ministry of ICT",
  "Norrsken Kigali",
  "Africa Digital Media",
  "GIZ",
  "Mastercard Foundation",
  "Kigali Innovation City",
];

/* ========================================================================== */
/*  Manifesto                                                                 */
/* ========================================================================== */

export const manifesto = {
  eyebrow: "Why we exist",
  /** Rendered word-by-word so each can be revealed on scroll. */
  statement:
    "Rwanda has no shortage of ideas. What it has been short of is somewhere to take one seriously — a bench, a soldering iron, a lawyer who answers, and twenty people who have already failed at the thing you are about to try.",
  body: "ForgeHub is that somewhere. We keep the doors open late, the tools sharp and the room full of people further along than you.",
  cta: { label: "Read our story", href: "#about" },
} as const;

/* ========================================================================== */
/*  Spaces                                                                    */
/* ========================================================================== */

export type Space = {
  name: string;
  blurb: string;
  detail: string;
  /** Short spec line — capacity, hours, whatever distinguishes it. */
  meta: string;
};

export const spacesSection = {
  eyebrow: "The building",
  title: "Six ways to use the floor",
  lede: "One membership, one address, and a room for whichever part of the work you are doing today.",
} as const;

export const spaces: Space[] = [
  {
    name: "Open floor",
    blurb: "Hot desks, big windows, good coffee.",
    detail:
      "Sit anywhere. Best for the days you want the hum of other people working around you.",
    meta: "70 seats · 07:00–22:00",
  },
  {
    name: "Dedicated desk",
    blurb: "Your desk, your monitor, your mess.",
    detail:
      "Leave the second screen set up overnight and the prototype half-assembled. Lockable storage included.",
    meta: "40 desks · 24/7 access",
  },
  {
    name: "Team studios",
    blurb: "Private rooms for two to twelve.",
    detail:
      "Glass-fronted rooms along the north wall. Whiteboard the whole thing and shut the door.",
    meta: "9 studios · 2–12 people",
  },
  {
    name: "Maker lab",
    blurb: "3D printers, CNC, electronics bench.",
    detail:
      "Resin and FDM printers, a laser cutter, oscilloscopes and a reflow oven. Induction required before first use.",
    meta: "Induction required · 24/7",
  },
  {
    name: "Meeting rooms",
    blurb: "Rooms that work on the first try.",
    detail:
      "Wired video, a screen that switches inputs without a fight, and a door that actually blocks sound.",
    meta: "4 rooms · book by the hour",
  },
  {
    name: "Event hall",
    blurb: "Demo nights, workshops, launches.",
    detail:
      "Retractable seating for 120, a proper PA, and a kitchen that can handle catering for the whole room.",
    meta: "120 seated · 200 standing",
  },
];

/* ========================================================================== */
/*  Membership                                                                */
/* ========================================================================== */

export type Plan = {
  name: string;
  /** @placeholder — pricing is illustrative only. */
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  cta: { label: string; href: string };
};

export const membershipSection = {
  eyebrow: "Membership",
  title: "Pick the door you need",
  lede: "Every plan includes the open floor, the events calendar and the members’ directory. Prices shown are indicative — confirm current rates on your tour.",
} as const;

/** @placeholder — all prices below are invented for layout purposes. */
export const plans: Plan[] = [
  {
    name: "Day pass",
    price: "RWF 8,000",
    cadence: "per day",
    blurb: "For the week you’re in town.",
    features: [
      "Open floor, 07:00–22:00",
      "Fibre wifi and power",
      "All community events",
      "Two hours of meeting room",
    ],
    cta: { label: "Buy a pass", href: "#tour" },
  },
  {
    name: "Flex",
    price: "RWF 65,000",
    cadence: "per month",
    blurb: "For the ones who come and go.",
    features: [
      "Ten days a month, any days",
      "Members’ directory",
      "Maker lab induction",
      "Five hours of meeting room",
      "Guest passes, two a month",
    ],
    featured: true,
    cta: { label: "Start with Flex", href: "#tour" },
  },
  {
    name: "Resident",
    price: "RWF 140,000",
    cadence: "per month",
    blurb: "For the ones who are here every day.",
    features: [
      "Your own dedicated desk",
      "24/7 building access",
      "Lockable storage",
      "Unlimited maker lab",
      "Fifteen hours of meeting room",
      "Business address and mail",
    ],
    cta: { label: "Take a desk", href: "#tour" },
  },
  {
    name: "Team studio",
    price: "from RWF 450,000",
    cadence: "per month",
    blurb: "For the ones who outgrew the corner.",
    features: [
      "A private room, 2–12 people",
      "Everything in Resident, per seat",
      "Your name on the door",
      "Event hall at member rates",
      "Named point of contact",
    ],
    cta: { label: "Talk to us", href: "#tour" },
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
  /** @placeholder — cohort status is illustrative. */
  status: string;
};

export const programsSection = {
  eyebrow: "Programs",
  title: "Structured routes from idea to shipped",
  lede: "Cohort-based, taught by people who have built here, and free at the point of entry wherever funding allows.",
  cta: { label: "See all programs", href: "#programs" },
} as const;

export const programs: Program[] = [
  {
    name: "Forge Fellowship",
    format: "Full-time cohort",
    duration: "6 months",
    blurb:
      "Twenty builders, one floor, six months. Stipend, desk, mentor and a demo night at the end of it.",
    status: "Applications open",
  },
  {
    name: "Hardware Bootcamp",
    format: "Evenings & weekends",
    duration: "10 weeks",
    blurb:
      "From breadboard to enclosure. Electronics, firmware, CAD and the unglamorous business of manufacturing.",
    status: "Next cohort in March",
  },
  {
    name: "Founder Residency",
    format: "Part-time",
    duration: "12 weeks",
    blurb:
      "For teams with a product and their first customers. Pricing, hiring, fundraising and saying no.",
    status: "Rolling admission",
  },
  {
    name: "Schools Outreach",
    format: "Weekend workshops",
    duration: "Ongoing",
    blurb:
      "We bus in secondary students, hand them tools, and let them break things until something works.",
    status: "Volunteers wanted",
  },
];

/* ========================================================================== */
/*  Events                                                                    */
/* ========================================================================== */

export type SiteEvent = {
  /** @placeholder — all dates and events below are invented. */
  date: { day: string; month: string };
  name: string;
  kind: string;
  time: string;
  location: string;
};

export const eventsSection = {
  eyebrow: "What’s on",
  title: "Something happening most nights",
  lede: "Open to members and non-members alike unless marked otherwise.",
  cta: { label: "Full calendar", href: "#events" },
} as const;

export const events: SiteEvent[] = [
  {
    date: { day: "04", month: "Sep" },
    name: "Demo Night: Fellowship Cohort 6",
    kind: "Demo night",
    time: "18:30 – 21:00",
    location: "Event hall",
  },
  {
    date: { day: "11", month: "Sep" },
    name: "Soldering for absolute beginners",
    kind: "Workshop",
    time: "17:00 – 19:30",
    location: "Maker lab",
  },
  {
    date: { day: "18", month: "Sep" },
    name: "Raising your first round in Rwanda",
    kind: "Panel",
    time: "18:00 – 20:00",
    location: "Event hall",
  },
  {
    date: { day: "26", month: "Sep" },
    name: "Members’ breakfast",
    kind: "Community",
    time: "08:00 – 09:30",
    location: "Open floor",
  },
];

/* ========================================================================== */
/*  Community                                                                 */
/* ========================================================================== */

export type Testimonial = {
  /**
   * @placeholder — INVENTED. These are not real people and not real quotes.
   * Replace every one with a sourced quote and written permission before this
   * page is published. Fabricated testimonials presented as real are both a
   * trust problem and, in most markets, a legal one.
   */
  quote: string;
  name: string;
  role: string;
};

export const communitySection = {
  eyebrow: "Community",
  title: "The floor is the product",
  lede: "The desks are fine. The reason people renew is who is sitting at the next one.",
} as const;

export const testimonials: Testimonial[] = [
  {
    quote:
      "I came for the 3D printer and stayed because someone two desks over had already solved the exact supply problem that was going to kill us.",
    name: "[Placeholder name]",
    role: "Hardware founder · Member since 2023",
  },
  {
    quote:
      "The fellowship was the first time anyone asked me to defend my numbers. It was miserable and it saved the company.",
    name: "[Placeholder name]",
    role: "Fellowship alum · Cohort 3",
  },
  {
    quote:
      "We moved in as two people with laptops and moved out as nine with a production line. Same building the whole way.",
    name: "[Placeholder name]",
    role: "Studio tenant · 2021–2024",
  },
];

/* ========================================================================== */
/*  Impact                                                                    */
/* ========================================================================== */

export const impactSection = {
  eyebrow: "About",
  title: "Built in Kigali, for builders everywhere in Rwanda",
  body: [
    "ForgeHub opened because the gap between having an idea in Rwanda and having the means to test it was wider than it needed to be. Workshop time, legal advice, a mentor who has shipped — none of it was scarce exactly, it was just scattered.",
    "So we put it in one building and kept the lights on late. Everything else — the programs, the fellowship, the schools work — grew out of members asking for it.",
  ],
  cta: { label: "Book a tour", href: "#tour" },
} as const;

/** @placeholder — every figure here is invented. */
export const impact: Stat[] = [
  { value: "1,200+", label: "Members and alumni" },
  { value: "80+", label: "Ventures launched" },
  { value: "RWF 4.2B", label: "Raised by members" },
  { value: "340", label: "Jobs created" },
];

/* ========================================================================== */
/*  Closing CTA + footer                                                      */
/* ========================================================================== */

export const closing = {
  eyebrow: "Come and see it",
  title: "Bring the idea. We have the bench.",
  body: "Tours run Tuesday and Thursday afternoons, or whenever you happen to be passing — the door is usually open.",
  primaryCta: { label: "Book a tour", href: "#tour" },
  secondaryCta: { label: "Email the team", href: "#contact" },
} as const;

/** @placeholder — address, phone and email are invented. Replace before launch. */
export const contact = {
  addressLines: ["KG 7 Ave, Kacyiru", "Kigali, Rwanda"],
  email: "hello@forgehubrwanda.com",
  phone: "+250 000 000 000",
  hours: [
    { days: "Mon – Fri", time: "07:00 – 22:00" },
    { days: "Saturday", time: "09:00 – 18:00" },
    { days: "Sunday", time: "Members only" },
  ],
} as const;

export type FooterColumn = { title: string; links: NavItem[] };

export const footerColumns: FooterColumn[] = [
  {
    title: "The building",
    links: [
      { label: "Open floor", href: "#spaces" },
      { label: "Team studios", href: "#spaces" },
      { label: "Maker lab", href: "#spaces" },
      { label: "Event hall", href: "#spaces" },
    ],
  },
  {
    title: "Join",
    links: [
      { label: "Membership", href: "#membership" },
      { label: "Day pass", href: "#membership" },
      { label: "Book a tour", href: "#tour" },
      { label: "Hire the hall", href: "#contact" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Forge Fellowship", href: "#programs" },
      { label: "Hardware Bootcamp", href: "#programs" },
      { label: "Founder Residency", href: "#programs" },
      { label: "Schools Outreach", href: "#programs" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "About", href: "#about" },
      { label: "Events", href: "#events" },
      { label: "Community", href: "#community" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

/** @placeholder — social handles are invented. */
export const socials: NavItem[] = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "X", href: "#" },
  { label: "YouTube", href: "#" },
];
