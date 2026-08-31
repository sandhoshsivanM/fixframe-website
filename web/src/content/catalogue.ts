import type { Package, Reel, Service, TeamMember, Testimonial } from "./types";

// C04 — service chapters. Oversized typographic treatment, not six
// identical cards. Empty chapters are never rendered.
export const services: Service[] = [
  {
    slug: "cinematic-videos",
    name: "Cinematic Videos",
    icon: "clapper",
    short: "High quality cinematic videos for brands, business & events.",
    standfirst: "Films that hold together when the music stops.",
    description:
      "Brand films, events, weddings and corporate work. Small crews, documentary pace, and an edit that starts on the shoot day rather than after it.",
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
    slug: "photography",
    name: "Photography",
    icon: "camera",
    short: "Professional photography for products, portraits, events & more.",
    standfirst: "Stills shot as their own discipline, not an afterthought.",
    description:
      "Event, portrait, product and campaign photography — with its own operator rather than a second job for the video crew.",
    deliverables: ["Full culled gallery", "Retouched selects", "Web and print exports", "Usage licence in writing"],
    featuredWork: ["meera-arjun", "the-long-room"],
  },
  {
    slug: "drone-shoots",
    name: "Drone Shoots",
    icon: "drone",
    short: "Aerial visuals that give your story a new perspective.",
    standfirst: "Aerial that earns its place in the cut.",
    description:
      "As an add-on or a standalone shoot, subject to permissions. We handle the permits — and we leave the footage out if it does not serve the film.",
    deliverables: ["Aerial coverage", "Permit and permission handling", "Graded aerial cuts"],
    featuredWork: ["ananya-vikram"],
  },
  {
    slug: "speed-ramp",
    name: "Speed Ramp",
    icon: "speed",
    short: "Cinematic speed ramp videos with smooth transitions.",
    standfirst: "Motion that carries the cut rather than decorating it.",
    description:
      "High-energy speed-ramped edits for launches, automotive and social — planned at the shoot so the transitions are real rather than faked in post.",
    deliverables: ["Ramp-planned coverage", "Frame-blended transitions", "Vertical and landscape masters"],
    featuredWork: ["northline-launch"],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    icon: "edit",
    short: "Professional editing that brings your vision to life.",
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
    slug: "reels-social",
    name: "Reels & Social",
    icon: "reels",
    short: "Short form content that connects & engages.",
    standfirst: "Vertical framed for vertical, not cropped into it.",
    description:
      "Short-form packages cut for 9:16 and storyboarded alongside the master, delivered on a monthly cadence.",
    deliverables: ["Monthly reel package", "Vertical masters", "Caption files", "Platform-ready exports"],
    featuredWork: ["northline-launch"],
  },
];

// C07 — price anchoring. displayPrice is a STRING, never money (RULE-F11-1).
export const packageGroups = [
  { slug: "cinematic-video", label: "Cinematic Video" },
  { slug: "speed-ramp", label: "Speed Ramp" },
  { slug: "delivery", label: "Delivery" },
];

export const packages: Package[] = [
  {
    id: "cinematic-still",
    name: "Cinematic Still Video",
    service: "Cinematic Video",
    group: "cinematic-video",
    displayPrice: "from ₹18,000",
    inclusions: ["1 Cinematic Video", "Professional Editing", "Color Grading", "High Quality Output"],
  },
  {
    id: "running-cine",
    name: "Running + Cine Video",
    service: "Cinematic Video",
    group: "cinematic-video",
    displayPrice: "from ₹32,000",
    popular: true,
    inclusions: ["Running Shots", "Cinematic Editing", "Color Grading", "High Quality Output"],
  },
  {
    id: "face-included",
    name: "Face Included Cinematic Content",
    service: "Cinematic Video",
    group: "cinematic-video",
    displayPrice: "Custom quote",
    inclusions: ["Best for Personal Brand", "Cinematic Editing", "Color Grading", "High Quality Output"],
  },

  {
    id: "ramp-single",
    name: "Single Speed Ramp",
    service: "Speed Ramp",
    group: "speed-ramp",
    displayPrice: "from ₹12,000",
    inclusions: ["1 Ramp Sequence", "Frame-Blended Transitions", "Color Grading", "Vertical + Landscape"],
  },
  {
    id: "ramp-series",
    name: "Ramp Series",
    service: "Speed Ramp",
    group: "speed-ramp",
    displayPrice: "from ₹28,000",
    popular: true,
    inclusions: ["3 Ramp Sequences", "Shoot-Planned Transitions", "Color Grading", "Platform Exports"],
  },
  {
    id: "ramp-campaign",
    name: "Campaign Ramp Pack",
    service: "Speed Ramp",
    group: "speed-ramp",
    displayPrice: "Custom quote",
    inclusions: ["Full Campaign Set", "Motion Graphics", "Color Grading", "All Aspect Ratios"],
  },

  {
    id: "delivery-standard",
    name: "Standard Delivery",
    service: "Delivery",
    group: "delivery",
    displayPrice: "10 working days",
    inclusions: ["Graded Master", "Social Cutdowns", "Caption Files", "Cloud Delivery"],
  },
  {
    id: "delivery-priority",
    name: "Priority Delivery",
    service: "Delivery",
    group: "delivery",
    displayPrice: "5 working days",
    popular: true,
    inclusions: ["Graded Master", "Social Cutdowns", "Caption Files", "Priority Queue"],
  },
  {
    id: "delivery-express",
    name: "Express Turnaround",
    service: "Delivery",
    group: "delivery",
    displayPrice: "72 hours",
    inclusions: ["Graded Master", "Priority Edit Suite", "Caption Files", "Same-Week Revisions"],
  },
];

// C10 — short-form. 9:16 throughout.
export const reels: Reel[] = [
  {
    id: "ananya-vikram-cutdown",
    title: "Ananya & Vikram — cutdown",
    caption: "Thirty seconds from a two-day documentary edit.",
    durationSeconds: 28,
    media: { ratio: "9/16", seed: "reel-ananya", src: "reels/reel-1.jpg", alt: "Vertical short-form still" },
    projectSlug: "ananya-vikram",
  },
  {
    id: "kestrel-origin-vertical",
    title: "Kestrel — Origin, vertical",
    caption: "The estate film, framed for 9:16 rather than cropped into it.",
    durationSeconds: 22,
    media: { ratio: "9/16", seed: "reel-kestrel", src: "reels/reel-2.jpg", alt: "Vertical short-form still" },
    projectSlug: "kestrel-coffee",
  },
  {
    id: "harbour-night-two",
    title: "Harbour Sessions — night two",
    caption: "Four cameras, one take, no rehearsal.",
    durationSeconds: 34,
    media: { ratio: "9/16", seed: "reel-harbour", src: "reels/reel-3.jpg", alt: "Vertical short-form still" },
    projectSlug: "harbour-sessions",
  },
  {
    id: "grade-breakdown",
    title: "Grade breakdown",
    caption: "Log to delivery, in fifteen seconds.",
    durationSeconds: 15,
    media: { ratio: "9/16", seed: "reel-grade", src: "reels/reel-4.jpg", alt: "Vertical short-form still" },
  },
  {
    id: "northline-social-set",
    title: "Northline — social set",
    caption: "One of eleven deliverables from a single shoot day.",
    durationSeconds: 18,
    media: { ratio: "9/16", seed: "reel-northline", src: "reels/reel-5.jpg", alt: "Vertical short-form still" },
    projectSlug: "northline-launch",
  },
  {
    id: "sound-pass",
    title: "Sound pass",
    caption: "What a mix does that a music bed cannot.",
    durationSeconds: 24,
    media: { ratio: "9/16", seed: "reel-sound", src: "reels/reel-6.jpg", alt: "Vertical short-form still" },
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
    portrait: { ratio: "4/5", seed: "team-founder", src: "team/founder.jpg", alt: "Studio team portrait" },
  },
  {
    name: "[DOP NAME]",
    role: "Cinematographer",
    bio: "Shoots long-lens and documentary. Prefers to be ignored on set.",
    portrait: { ratio: "4/5", seed: "team-dop", src: "team/dop.jpg", alt: "Studio team portrait" },
  },
  {
    name: "[COLOURIST NAME]",
    role: "Colour / Finishing",
    bio: "Grades for the room it was shot in, not for the LUT it was shot on.",
    portrait: { ratio: "4/5", seed: "team-colour", src: "team/colour.jpg", alt: "Studio team portrait" },
  },
];
