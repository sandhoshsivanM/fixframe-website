import type { SitePage } from "./types";

// System pages. Privacy and Terms cannot be removed while the enquiry
// consent step links to them (RULE-F13-1 / RULE-C11-1).

export const pages: SitePage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    standfirst:
      "PLACEHOLDER — requires legal review before launch. Tracked as UNRESOLVED-015.",
    systemPage: true,
    updated: "2026-08-31",
    body: [
      "## What we collect",
      "When you send a project brief we collect your name, the contact details you give us, the project details you describe, and — if you choose to share it — a budget range. We also record which page the enquiry came from.",
      "## Why we collect it",
      "To answer your enquiry, and if you become a client, to plan and deliver the work. We do not sell it, and we do not use it for advertising.",
      "## How long we keep it",
      "Enquiries that do not become projects are anonymised after 24 months. Project records are kept for seven years as a commercial record. Signed releases covering published work are kept for the life of the work plus seven years, because they are the authorisation for material that is already public.",
      "## Your rights",
      "You can ask us to delete your enquiry at any time and we will. Where we hold a release covering work that is already published, we will withdraw the work first and then remove the record — deleting the authorisation while the film is still online would leave you less protected, not more.",
      "## Contact",
      "Write to us at the address on the contact page and we will respond within the statutory period once the governing regime is confirmed.",
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    standfirst:
      "PLACEHOLDER — requires legal review before launch. Tracked as UNRESOLVED-015.",
    systemPage: true,
    updated: "2026-08-31",
    body: [
      "## Quotations",
      "Quotations are valid for 30 days from issue. Prices shown on this website are indicative starting points and are not a quotation.",
      "## Bookings",
      "A booking is confirmed on receipt of the retainer. Dates are not held without it.",
      "## Copyright and licensing",
      "Copyright in delivered work remains with the studio unless assigned in writing. Clients receive a licence for the agreed use. Where we intend to publish work in this portfolio, we ask for that permission separately and in writing.",
      "## Cancellation",
      "Cancellation terms are set out in the project agreement and vary with proximity to the shoot date.",
    ],
  },
];
