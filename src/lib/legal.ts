/**
 * Copy for the privacy policy, the cookie policy and the cookie card.
 *
 * Written against what the site actually does today: a contact form saved to
 * our database and forwarded to our inbox, admin sign-in, and a few
 * strictly necessary items in the browser's storage. No analytics or
 * advertising runs yet. When analytics is added, list each cookie it sets in
 * `cookiePolicy` below and bump `updated` on both policies.
 *
 * Drafted to Rwanda's Law No. 058/2021 on the protection of personal data and
 * privacy, and to the EU and UK GDPR for visitors there. Have it reviewed by a
 * qualified adviser before relying on it.
 */

import { contact } from "@/lib/site";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
};

const company = "ForgeHub Ltd";

export const privacyPolicy: LegalDocument = {
  eyebrow: "Your data",
  title: "Privacy",
  lede: "How ForgeHub collects, uses and protects your personal data, and the rights you hold over it.",
  updated: "7 October 2026",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        {
          type: "p",
          text: `This website is operated by ${company} (trading as ForgeHub Rwanda), a company registered in Rwanda and based in Kigali. ${company} is the data controller for the personal data described in this policy.`,
        },
        {
          type: "p",
          text: `For any question about this policy or your data, write to ${contact.email} or call ${contact.phone}.`,
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        {
          type: "list",
          items: [
            "Contact form: your name, email address and the message you send.",
            "Direct contact: anything you share when you email or call us.",
            "Admin accounts: the email address and password of team members who manage the site. Passwords are stored only in hashed form by our authentication provider.",
            "Technical data: our hosting provider records basic request data, such as IP address, browser type and the time of each visit, to keep the site running and secure.",
            "Preferences: a few small items saved in your browser, such as your light or dark theme. These stay on your device. See our cookie policy for details.",
          ],
        },
        {
          type: "p",
          text: "We do not collect sensitive personal data, and we do not use your data for automated decision making or profiling.",
        },
      ],
    },
    {
      id: "how-we-use-it",
      heading: "How we use it",
      blocks: [
        {
          type: "table",
          head: ["Purpose", "Legal basis"],
          rows: [
            [
              "Replying to your message about training, a project or a partnership",
              "Your consent, and steps you ask us to take before entering a contract",
            ],
            [
              "Running, securing and fixing the website",
              "Our legitimate interest in a safe, working site",
            ],
            [
              "Giving our team access to manage the site",
              "Our legitimate interest in running the business",
            ],
            [
              "Measuring how the site is used (only if analytics is added)",
              "Your consent, given through the cookie card",
            ],
            [
              "Meeting legal, tax or regulatory obligations",
              "Legal obligation",
            ],
          ],
        },
        {
          type: "p",
          text: "We never sell your personal data, and we do not use it for advertising.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      blocks: [
        {
          type: "p",
          text: "We share personal data only with service providers that help us run the site, under contracts that require them to protect it and use it only on our instructions:",
        },
        {
          type: "list",
          items: [
            "Supabase: database and admin sign-in.",
            "Vercel: website hosting.",
            "Google (Gmail): our email inbox, where contact form messages are delivered.",
          ],
        },
        {
          type: "p",
          text: "We may also disclose data where the law requires it, or to protect our rights, our users or the public.",
        },
      ],
    },
    {
      id: "transfers",
      heading: "International transfers",
      blocks: [
        {
          type: "p",
          text: "Some of our providers store data on servers outside Rwanda. Where this happens, we transfer data only as permitted by Law No. 058/2021 and, for visitors in the European Union or United Kingdom, under recognised safeguards such as Standard Contractual Clauses.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        {
          type: "list",
          items: [
            "Contact messages: up to 24 months after our last exchange, unless they lead to a working relationship, in which case we keep what that relationship requires.",
            "Admin accounts: for as long as the person helps manage the site.",
            "Technical logs: for the short period set by our hosting provider.",
            "Records we must keep by law: for the period the law requires.",
          ],
        },
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        {
          type: "p",
          text: "Under Rwandan law, and the GDPR where it applies to you, you have the right to:",
        },
        {
          type: "list",
          items: [
            "Be informed about how your data is used.",
            "Access the personal data we hold about you.",
            "Have inaccurate data corrected.",
            "Have your data deleted.",
            "Restrict or object to how we use your data.",
            "Receive your data in a portable format.",
            "Withdraw consent at any time, without affecting earlier use.",
            "Not be subject to decisions based solely on automated processing.",
          ],
        },
        {
          type: "p",
          text: `To exercise any of these rights, email ${contact.email}. We will respond within 30 days and may ask you to confirm your identity first.`,
        },
      ],
    },
    {
      id: "complaints",
      heading: "Complaints",
      blocks: [
        {
          type: "p",
          text: "If you are unhappy with how we handle your data, please contact us first so we can put it right. You may also complain to the National Cyber Security Authority (NCSA), Rwanda's data protection supervisory authority. Visitors in the European Union or United Kingdom may contact their local data protection authority.",
        },
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        {
          type: "p",
          text: "Data is encrypted in transit, access to it is limited to the people who need it, and admin accounts are protected by authentication. No system is perfectly secure, but we will notify you and the authorities without delay if a breach puts your data at risk.",
        },
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: [
        {
          type: "p",
          text: `This website is not intended for children under 16. If you are under 16 and want to join a program, please ask a parent or guardian to contact us on your behalf. If you believe a child has sent us personal data, email ${contact.email} and we will delete it.`,
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "We will update this policy as our services change, for example when we add analytics. The date at the top shows the latest version. Significant changes will be highlighted on this page.",
        },
      ],
    },
  ],
};

export const cookiePolicy: LegalDocument = {
  eyebrow: "Your choices",
  title: "Cookies",
  lede: "What this website stores on your device, why, and how you stay in control of it.",
  updated: "7 October 2026",
  sections: [
    {
      id: "what-are-cookies",
      heading: "What cookies are",
      blocks: [
        {
          type: "p",
          text: "Cookies are small text files a website saves on your device. Browsers also offer similar storage, known as local storage and session storage. In this policy, “cookies” covers all three.",
        },
      ],
    },
    {
      id: "what-we-use",
      heading: "What we use",
      blocks: [
        {
          type: "p",
          text: "Today this website uses only strictly necessary storage. It makes the site work, contains no tracking, and is never shared with advertisers. Because it is essential, it does not require your consent.",
        },
        {
          type: "table",
          head: ["Name", "Purpose", "Type", "Duration"],
          rows: [
            [
              "forgehub-theme",
              "Remembers whether you chose the light or dark theme.",
              "Local storage",
              "Until you clear it",
            ],
            [
              "forgehub-loader",
              "Plays the opening animation once per visit, not on every page.",
              "Session storage",
              "Until you close the tab",
            ],
            [
              "forgehub-consent",
              "Remembers your answer to the cookie card.",
              "Local storage",
              "12 months",
            ],
            [
              "sb-…-auth-token",
              "Keeps team members signed in to the admin area. Set only when signing in.",
              "Cookie",
              "Until sign out",
            ],
          ],
        },
      ],
    },
    {
      id: "analytics",
      heading: "Analytics",
      blocks: [
        {
          type: "p",
          text: "We do not currently use analytics or advertising cookies. We plan to add analytics to understand how visitors use the site and improve it. When we do, those cookies will load only if you select Accept on the cookie card, and they will be listed in the table above.",
        },
      ],
    },
    {
      id: "your-choices",
      heading: "Your choices",
      blocks: [
        {
          type: "p",
          text: "You can change your answer at any time with the button below. You can also block or delete cookies in your browser settings, although the site may not remember your preferences if you do.",
        },
      ],
    },
    {
      id: "more",
      heading: "More information",
      blocks: [
        {
          type: "p",
          text: `Our privacy policy explains how we handle personal data and the rights you hold. For any question about cookies, email ${contact.email}.`,
        },
      ],
    },
  ],
};

/** The card shown until a visitor accepts or rejects. */
export const cookieConsent = {
  eyebrow: "Cookies",
  body: "We use essential storage to run this site. With your permission, we would also use analytics cookies to understand how it is used and make it better. Read our",
  link: { label: "cookie policy", href: "/cookies" },
  accept: "Accept",
  reject: "Reject",
  change: "Change cookie settings",
} as const;

/** The footer's legal links. */
export const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
] as const;
