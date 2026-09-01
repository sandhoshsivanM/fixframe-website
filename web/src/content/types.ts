// Content types. Deliberately mirror the API DTOs in
// spec/reference/entities.md so the adapter can be repointed at the CRM
// later without any page changing.

export type Category = "cinematic" | "commercial" | "events" | "drone";

export type MediaSlot = {
  /** Filename under /public/media — omit while no real asset exists. */
  src?: string;
  /** Required for real images. Placeholders are decorative. */
  alt?: string;
  /** Drives the placeholder treatment and the aspect box. */
  ratio: "16/9" | "4/5" | "9/16" | "3/2" | "1/1" | "21/9";
  /** Stable seed for the deterministic placeholder. Defaults to alt/src. */
  seed?: string;
  /** Optional video slot; poster is `src`. */
  video?: string;
};

export type Credit = { role: string; name: string };

export type ProjectBlock =
  | { type: "text"; heading?: string; body: string }
  | { type: "gallery"; caption?: string; items: MediaSlot[] }
  | { type: "video"; caption?: string; media: MediaSlot }
  | { type: "beforeAfter"; caption?: string; before: MediaSlot; after: MediaSlot }
  | { type: "quote"; quote: string; attribution: string };

export type Project = {
  slug: string;
  title: string;
  category: Category;
  categoryLabel: string;
  year: number;
  location: string;
  client: string;
  /** One line for listings. */
  summary: string;
  /** The positioning line on the case-study hero. */
  standfirst: string;
  narrative: string;
  services: string[];
  featured: boolean;
  /** Lower sorts first among featured. */
  featuredOrder?: number;
  cover: MediaSlot;
  blocks: ProjectBlock[];
  credits: Credit[];
  /** Drives the editorial masonry: wide items span two columns. */
  span?: "wide" | "tall" | "normal";
};

export type Service = {
  slug: string;
  name: string;
  /** Key into the icon set — see components/Icon.tsx */
  icon: string;
  /** One line for the WHAT WE DO card. */
  short: string;
  /** Oversized display line — Part C04 "service chapters". */
  standfirst: string;
  description: string;
  deliverables: string[];
  /** Project slugs shown as proof under the chapter. */
  featuredWork: string[];
};

export type Package = {
  id: string;
  name: string;
  service: string;
  /** Tab the package sits under on the packages screen. */
  group: string;
  /** Neutral qualifier — e.g. a turnaround. Never a price: scope is quoted
      to the brief, so publishing figures would misrepresent the work. */
  note?: string;
  inclusions: string[];
  disclaimer?: string;
  popular?: boolean;
};

export type Reel = {
  id: string;
  title: string;
  caption: string;
  durationSeconds: number;
  media: MediaSlot;
  /** Omitted from the UI entirely if the project is not published. */
  projectSlug?: string;
  externalUrl?: string;
};

export type Testimonial = {
  quote: string;
  personName: string;
  personRole: string;
  /** Only approved testimonials are exported — RULE-F12-1. */
  approved: boolean;
  featured?: boolean;
};

export type TeamMember = {
  name: string;
  role: string;
  /** Optional on purpose: a card can ship with a name and role before the
      person has read and approved a biography. Blueprint §01 forbids
      invented team biographies in production, so an unwritten bio must be
      absent rather than filled in for them. */
  bio?: string;
  /** Tools this person actually works in — shown as tags. */
  skills: string[];
  portrait: MediaSlot;
  /** §09/§14 — the homepage shows featured members, capped at four. */
  featured?: boolean;
  order?: number;
};

export type SitePage = {
  slug: string;
  title: string;
  standfirst?: string;
  /** Paragraphs; `## ` prefix marks a subheading. */
  body: string[];
  updated: string;
  systemPage?: boolean;
};
