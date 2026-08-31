// Studio-wide content. Everything here is editable copy — it becomes
// ENT-SiteSetting when the CMS lands (screen F14).

export const site = {
  name: "Fix Frame",
  wordmark: { first: "Fix", second: "Frame" },
  tagline: "The story is made in the edit.",
  description:
    "Videography, photography and post-production. Shot and cut in-house, in Chennai and across India.",

  contact: {
    email: "hello@fixframe.studio",
    phone: "+91 90000 00000",
    /** Digits only — ADR-006: WhatsApp is a wa.me deep link, never an API. */
    whatsapp: "919000000000",
    serviceArea: "Chennai · working across India",
    responseTime: "within 24 business hours",
  },

  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Vimeo", href: "https://vimeo.com/" },
    { label: "YouTube", href: "https://youtube.com/" },
  ],

  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "Editing", href: "/editing" },
    { label: "Packages", href: "/packages" },
    { label: "Reels", href: "/reels" },
    { label: "Studio", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  /** C01 hero. Poster paints first; the video slot is optional. */
  hero: {
    eyebrow: "Videography · Photography · Post-production",
    headline: "The story is made in the edit.",
    standfirst:
      "We shoot and cut everything in-house. No subcontracted editors, no stock footage standing in for work we did not do.",
    media: { ratio: "21/9", seed: "hero-showreel", src: undefined, video: undefined } as const,
  },

  /** C01 "Editing Signature" — RAW → EDIT → GRADE → SOUND → FINAL. */
  signature: [
    { step: "Raw", body: "Everything we shot, unsorted and honest." },
    { step: "Edit", body: "Structure first. The story decides the cut, not the timeline." },
    { step: "Grade", body: "Colour built for the room it was shot in." },
    { step: "Sound", body: "Mixed, not laid underneath." },
    { step: "Final", body: "Masters and deliverables, in the formats you actually need." },
  ],

  /** C01 process — Discover → Plan → Create → Edit → Deliver. */
  process: [
    { step: "Discover", body: "We learn what the film is for before we discuss what it costs." },
    { step: "Plan", body: "Shot list, crew, schedule and the deliverables written down." },
    { step: "Create", body: "The shoot. Small crew, documentary pace, minimal interference." },
    { step: "Edit", body: "Offline, colour and sound — in-house, with you in the loop." },
    { step: "Deliver", body: "Masters, cutdowns, captions and archive, on the agreed date." },
  ],

  /** Only verifiable numbers — V1 C06 "no fake stats". */
  stats: [
    { value: "120+", label: "films delivered" },
    { value: "8 yrs", label: "in production" },
    { value: "100%", label: "edited in-house" },
  ],

  values: [
    { title: "Story", body: "If the film does not say something, the coverage does not matter." },
    { title: "Craft", body: "Colour and sound are the work, not a finishing pass." },
    { title: "Reliability", body: "Dates hold. Deliverables arrive in the format agreed." },
    { title: "Collaboration", body: "You see the cut while it can still change." },
  ],
} as const;
