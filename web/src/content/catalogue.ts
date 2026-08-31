import type { Package, Reel, Service, TeamMember, Testimonial } from "./types";

// C04 — service chapters. Oversized typographic treatment, not six
// identical cards. Empty chapters are never rendered.
export const services: Service[] = [
  {
    slug: "videography",
    name: "Videography",
    standfirst: "Films that hold together when the music stops.",
    description:
      "Weddings, events, commercial and corporate. Small crews, documentary pace, and an edit that starts on the shoot day rather than after it.",
    deliverables: [
      "Full-day or multi-day coverage",
      "Highlight film and documentary edit",
      "Colour grade and sound mix",
      "Licensed music",
      "Masters plus social cutdowns",
    ],
    featuredWork: ["ananya-vikram", "harbour-sessions"],
  },
  {
    slug: "post-production",
    name: "Post-production",
    standfirst: "The service most studios treat as a finishing pass.",
    description:
      "Offline edit, colour, sound and motion — on footage we shot, or on yours. This is the part of the process the studio was built around.",
    deliverables: [
      "Offline edit from your rushes",
      "Colour grade, log to delivery",
      "Sound design and mix",
      "Motion graphics and titles",
      "Captions, transcripts and deliverable masters",
    ],
    featuredWork: ["kestrel-coffee", "northline-launch"],
  },
  {
    slug: "photography",
    name: "Photography",
    standfirst: "Stills that were not an afterthought on a video shoot.",
    description:
      "Event, portrait, product and campaign photography — shot as its own discipline, with its own operator.",
    deliverables: [
      "Full culled gallery",
      "Retouched selects",
      "Web and print exports",
      "Usage licence in writing",
    ],
    featuredWork: ["meera-arjun", "the-long-room"],
  },
  {
    slug: "drone",
    name: "Drone",
    standfirst: "Aerial that earns its place in the cut.",
    description:
      "As an add-on or a standalone shoot, subject to permissions. We handle the permits, and we leave the footage out if it does not serve the film.",
    deliverables: [
      "Aerial coverage",
      "Permit and permission handling",
      "Graded aerial cuts",
    ],
    featuredWork: ["ananya-vikram"],
  },
  {
    slug: "social",
    name: "Social & Reels",
    standfirst: "Vertical framed for vertical, not cropped into it.",
    description:
      "Short-form packages cut for 9:16 and storyboarded alongside the master, delivered on a monthly cadence.",
    deliverables: [
      "Monthly reel package",
      "Vertical masters",
      "Caption files",
      "Platform-ready exports",
    ],
    featuredWork: ["northline-launch"],
  },
];

// C07 — price anchoring. displayPrice is a STRING, never money (RULE-F11-1).
export const packages: Package[] = [
  {
    id: "essential",
    name: "Essential",
    service: "Videography",
    displayPrice: "from ₹85,000",
    inclusions: [
      "Single camera operator",
      "Six hours of coverage",
      "3–4 minute highlight film",
      "Colour grade and sound mix",
      "Two rounds of revisions",
    ],
    disclaimer: "Travel outside the city billed at cost. Taxes extra.",
  },
  {
    id: "signature",
    name: "Signature",
    service: "Videography",
    displayPrice: "from ₹1,65,000",
    emphasis: true,
    inclusions: [
      "Two operators",
      "Full-day coverage",
      "Highlight film and documentary edit",
      "Drone add-on available",
      "Three rounds of revisions",
    ],
    disclaimer: "Travel outside the city billed at cost. Taxes extra.",
  },
  {
    id: "premium",
    name: "Premium",
    service: "Videography",
    displayPrice: "Custom quote",
    inclusions: [
      "Multi-camera crew",
      "Multi-day coverage",
      "Full post-production suite",
      "Unlimited revisions within scope",
    ],
  },
  {
    id: "editing-only",
    name: "Editing only",
    service: "Post-production",
    displayPrice: "from ₹35,000",
    inclusions: [
      "Offline edit from your footage",
      "Colour grade",
      "Sound mix",
      "Two rounds of revisions",
    ],
    disclaimer: "Priced per finished minute above five minutes.",
  },
];

// C10 — short-form. 9:16 throughout.
export const reels: Reel[] = [
  {
    id: "ananya-vikram-cutdown",
    title: "Ananya & Vikram — cutdown",
    caption: "Thirty seconds from a two-day documentary edit.",
    durationSeconds: 28,
    media: { ratio: "9/16", seed: "reel-ananya" },
    projectSlug: "ananya-vikram",
  },
  {
    id: "kestrel-origin-vertical",
    title: "Kestrel — Origin, vertical",
    caption: "The estate film, framed for 9:16 rather than cropped into it.",
    durationSeconds: 22,
    media: { ratio: "9/16", seed: "reel-kestrel" },
    projectSlug: "kestrel-coffee",
  },
  {
    id: "harbour-night-two",
    title: "Harbour Sessions — night two",
    caption: "Four cameras, one take, no rehearsal.",
    durationSeconds: 34,
    media: { ratio: "9/16", seed: "reel-harbour" },
    projectSlug: "harbour-sessions",
  },
  {
    id: "grade-breakdown",
    title: "Grade breakdown",
    caption: "Log to delivery, in fifteen seconds.",
    durationSeconds: 15,
    media: { ratio: "9/16", seed: "reel-grade" },
  },
  {
    id: "northline-social-set",
    title: "Northline — social set",
    caption: "One of eleven deliverables from a single shoot day.",
    durationSeconds: 18,
    media: { ratio: "9/16", seed: "reel-northline" },
    projectSlug: "northline-launch",
  },
  {
    id: "sound-pass",
    title: "Sound pass",
    caption: "What a mix does that a music bed cannot.",
    durationSeconds: 24,
    media: { ratio: "9/16", seed: "reel-sound" },
  },
];

// RULE-F12-1 — only approved testimonials ever reach the public site.
// The unapproved one is kept here deliberately to prove the filter works.
export const testimonials: Testimonial[] = [
  {
    quote:
      "They cut a film we still watch on anniversaries. The edit found a story we did not know was there.",
    personName: "Ananya & Vikram",
    personRole: "Wedding, 2025",
    approved: true,
    featured: true,
  },
  {
    quote:
      "Briefed on Monday, first cut on Thursday. The turnaround was the reason we came back for the campaign.",
    personName: "Priya Raman",
    personRole: "Marketing Lead, Kestrel Coffee",
    approved: true,
    featured: true,
  },
  {
    quote:
      "We sent them six hours of footage from another crew and got back something we were proud of.",
    personName: "Rahul Iyer",
    personRole: "Northline",
    approved: true,
  },
  {
    quote: "Awaiting client sign-off before this goes public.",
    personName: "Withheld",
    personRole: "Pending approval",
    approved: false,
  },
];

export const team: TeamMember[] = [
  {
    name: "[FOUNDER NAME]",
    role: "Director / Editor",
    bio: "Started the studio because the edit kept getting handed to someone who had not been on the shoot.",
    portrait: { ratio: "4/5", seed: "team-founder" },
  },
  {
    name: "[DOP NAME]",
    role: "Cinematographer",
    bio: "Shoots long-lens and documentary. Prefers to be ignored on set.",
    portrait: { ratio: "4/5", seed: "team-dop" },
  },
  {
    name: "[COLOURIST NAME]",
    role: "Colour / Finishing",
    bio: "Grades for the room it was shot in, not for the LUT it was shot on.",
    portrait: { ratio: "4/5", seed: "team-colour" },
  },
];
