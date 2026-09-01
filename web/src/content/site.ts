// Studio-wide content. Everything here is editable copy — it becomes
// ENT-SiteSetting when the CMS lands (screen F14).

export const site = {
  name: "Fix Frame",
  wordmark: { first: "Fix", second: "Frame" },
  tagline: "We Capture. We Create. We Deliver.",
  description:
    "Cinematic videos, photography, drone and editing. A creative video production company in Coimbatore.",

  contact: {
    email: "hello@fixframe.media",
    phone: "+91 12345 67890",
    /** Digits only — WhatsApp is a wa.me deep link, never an API. */
    whatsapp: "911234567890",
    instagram: "@fixframe.media",
    location: "Coimbatore, Tamil Nadu, India",
    serviceArea: "Coimbatore · working across India",
    responseTime: "within 24 business hours",
  },

  social: [
    { label: "Instagram", icon: "instagram", href: "https://instagram.com/fixframe.media" },
    { label: "YouTube", icon: "youtube", href: "https://youtube.com/" },
    { label: "TikTok", icon: "tiktok", href: "https://tiktok.com/" },
  ],

  nav: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "Packages", href: "/packages" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  /** C01 hero. Poster paints first; the video slot is optional. */
  hero: {
    /** Rendered as FIX + monogram + FRAME */
    lockup: { left: "Fix", right: "Frame" },
    tagline: { a: "We Capture.", b: "We Create.", c: "We Deliver." },
    services: "Cinematic Videos | Photography | Drone | Editing",
    media: { ratio: "21/9", seed: "hero-operator", src: "hero/operator.jpg", alt: "Camera operator with a gimbal rig on location" },
  },

  showreel: {
    title: { a: "Show", b: "reel" },
    line: "We don't just shoot, we tell stories.",
    media: { ratio: "21/9", seed: "showreel-camera", src: "hero/showreel.jpg", alt: "Cinema camera body in low light" },
  },

  /** Colleges and organisations Fix Frame has actually worked with.
   *
   *  DELIBERATELY EMPTY. Blueprint §01 is non-negotiable on this: the
   *  production website must not contain invented client logos. This list
   *  previously held ten global brands taken from a design mockup, which
   *  claimed a commercial relationship that does not exist.
   *
   *  Add real names only — the client section hides itself while this is
   *  empty, so an unfilled list can never become a false claim. */
  clients: [] as string[],

  /** Behind-the-scenes strip. */
  bts: [
    { ratio: "4/5", seed: "bts-rig", src: "studio/bts-1.jpg", alt: "Behind the scenes on a Fix Frame shoot" },
    { ratio: "4/5", seed: "bts-set", src: "studio/bts-2.jpg", alt: "Behind the scenes on a Fix Frame shoot" },
    { ratio: "4/5", seed: "bts-drone", src: "studio/bts-3.jpg", alt: "Behind the scenes on a Fix Frame shoot" },
    { ratio: "4/5", seed: "bts-suite", src: "studio/bts-4.jpg", alt: "Behind the scenes on a Fix Frame shoot" },
    { ratio: "4/5", seed: "bts-lighting", src: "studio/bts-5.jpg", alt: "Behind the scenes on a Fix Frame shoot" },
  ],

  /** Instagram grid. Swap `href` for real post links. */
  feed: [
    { seed: "ig-1", src: "studio/ig-1.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-2", src: "studio/ig-2.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-3", src: "studio/ig-3.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-4", src: "studio/ig-4.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-5", src: "studio/ig-5.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-6", src: "studio/ig-6.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-7", src: "studio/ig-7.jpg", href: "https://instagram.com/fixframe.media" },
    { seed: "ig-8", src: "studio/ig-8.jpg", href: "https://instagram.com/fixframe.media" },
  ],

  about: {
    body: "Fix Frame is a creative video production company passionate about storytelling through visuals. We believe every brand has a unique story, and we are here to frame it in the most cinematic way possible.",
    media: { ratio: "4/5", seed: "about-neon", src: "studio/about.jpg", alt: "Operator lit by red practical lights" },
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

  /** Track record figures.
   *
   *  DELIBERATELY EMPTY. "120+ films delivered / 8 yrs / 100% in-house"
   *  were written to fill a layout, not counted. Blueprint §01 forbids
   *  invented statistics in production, and a number a prospect can ask
   *  you to substantiate is worse than no number.
   *
   *  Add only figures the studio can evidence. The strip hides itself
   *  while this is empty. */
  stats: [] as { value: string; label: string }[],

  values: [
    { title: "Story", body: "If the film does not say something, the coverage does not matter." },
    { title: "Craft", body: "Colour and sound are the work, not a finishing pass." },
    { title: "Reliability", body: "Dates hold. Deliverables arrive in the format agreed." },
    { title: "Collaboration", body: "You see the cut while it can still change." },
  ],
} as const;
