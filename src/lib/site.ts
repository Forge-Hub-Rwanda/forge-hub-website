/**
 * Single source of truth for hero copy, navigation and stats.
 *
 * NOTE: the numbers in `stats` and the contact details are PLACEHOLDERS chosen
 * to match the layout — replace them with real ForgeHub figures before this
 * goes anywhere public.
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
  /** Short line shown in the mobile drawer. */
  blurb?: string;
};

export const navItems: NavItem[] = [
  {
    label: "Spaces",
    href: "#spaces",
    blurb: "Desks, studios and meeting rooms",
  },
  {
    label: "Programs",
    href: "#programs",
    blurb: "Fellowships, bootcamps, residencies",
  },
  {
    label: "Community",
    href: "#community",
    blurb: "The people who build here",
  },
  { label: "Events", href: "#events", blurb: "What's on this month" },
  { label: "About", href: "#about", blurb: "Why ForgeHub exists" },
];

export const hero = {
  eyebrow: "Kigali · Innovation Hub",
  /** Split so the accent word can be styled independently. */
  headline: {
    lead: "Where Rwanda's",
    accent: "builders",
    trail: "come to work.",
  },
  body: "A coworking floor, a maker studio and a launchpad under one roof — for the founders, engineers and creators turning ideas into things that ship.",
  primaryCta: { label: "Book a tour", href: "#tour" },
  secondaryCta: { label: "Explore membership", href: "#membership" },
  scrollCue: "Scroll to explore",
} as const;

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "1,200+", label: "Members & alumni" },
  { value: "80+", label: "Ventures launched" },
  { value: "45", label: "Programs a year" },
  { value: "24/7", label: "Studio access" },
];

/** Partner / supporter names for the marquee strip. Placeholders. */
export const partners: string[] = [
  "Ministry of ICT",
  "Norrsken Kigali",
  "Africa Digital Media",
  "GIZ",
  "Mastercard Foundation",
  "Kigali Innovation City",
];
