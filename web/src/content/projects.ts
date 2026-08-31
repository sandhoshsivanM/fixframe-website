import type { Project } from "./types";

// Six case studies. `span` drives the editorial masonry on /work — the
// public site uses editorial composition, never a uniform card grid
// (V1 Part B1: "Cards … for functional CRM grouping").

export const projects: Project[] = [
  {
    slug: "ananya-vikram",
    title: "Ananya & Vikram",
    category: "cinematic",
    categoryLabel: "Cinematic",
    year: 2025,
    location: "Pondicherry",
    client: "Private",
    summary: "A two-day wedding cut as one continuous story, not a montage.",
    standfirst:
      "Two days, four hundred guests, and a brief that asked us to avoid every wedding-film convention we knew.",
    narrative:
      "The couple had watched a lot of wedding films and disliked all of them. The complaint was always the same — the montage. Three minutes of slow motion set to a licensed ballad, with no sense of who anyone was.\n\nSo we shot it as documentary. Two operators, long lenses, almost no direction. We spent the first morning not filming at all, just working out where the actual conversations were happening.\n\nThe finished film is built around three of them — a grandmother explaining a ritual to a bored nephew, the couple negotiating the seating plan at 1am, and a speech that went badly and was better for it. The ceremony is there, but it is the context, not the subject.",
    services: ["Videography", "Post-production", "Drone"],
    featured: true,
    featuredOrder: 10,
    span: "wide",
    cover: { ratio: "21/9", seed: "ananya-vikram-cover", src: "work/ananya-vikram.jpg", alt: "Couple during an evening wedding ceremony" },
    blocks: [
      {
        type: "text",
        heading: "The brief",
        body: "Avoid the montage. Find the story in what actually happened rather than in what was scheduled to happen.",
      },
      {
        type: "gallery",
        caption: "Two days, shot documentary-style.",
        items: [
          { ratio: "4/5", seed: "av-still-1", src: "work/av-still-1.jpg", alt: "Guests during the ceremony" },
          { ratio: "4/5", seed: "av-still-2", src: "work/av-still-2.jpg", alt: "Detail from the wedding day" },
          { ratio: "4/5", seed: "av-still-3", src: "work/av-still-3.jpg", alt: "Evening reception" },
        ],
      },
      {
        type: "beforeAfter",
        caption: "Ungraded log against the delivered grade.",
        before: { ratio: "16/9", seed: "av-raw", src: "work/av-raw.jpg", alt: "Ungraded log footage, flat and desaturated" },
        after: { ratio: "16/9", seed: "av-graded", src: "work/av-graded.jpg", alt: "The same frame after the delivered grade" },
      },
      {
        type: "quote",
        quote:
          "They cut a film we still watch on anniversaries. The edit found a story we did not know was there.",
        attribution: "Ananya & Vikram",
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
      { role: "Colour", name: "Fix Frame" },
      { role: "Sound", name: "Fix Frame" },
    ],
  },
  {
    slug: "kestrel-coffee",
    title: "Kestrel Coffee — Origin",
    category: "drone",
    categoryLabel: "Drone",
    year: 2025,
    location: "Nilgiris",
    client: "Kestrel Coffee",
    summary: "A 90-second brand film across two estates, without the aerial-and-guitar formula.",
    standfirst:
      "Every coffee origin film looks identical. Kestrel asked for one that did not.",
    narrative:
      "The category has a template: drone over a hillside, acoustic guitar, a farmer's hands in soft focus, a voiceover about passion. Kestrel had seen their competitors make it four times over.\n\nWe shot handheld at working pace, at the altitude and in the weather the estates actually operate in. No lighting setups, no staged harvesting. The film is quiet where the template would be swelling.\n\nSound design carries the altitude — wind, distance, the specific noise of a wet hillside. The only music enters at seventy seconds and stops before the logo.",
    services: ["Videography", "Post-production"],
    featured: true,
    featuredOrder: 20,
    span: "normal",
    cover: { ratio: "4/5", seed: "kestrel-cover", src: "work/kestrel.jpg", alt: "Hillside coffee estate at altitude" },
    blocks: [
      {
        type: "text",
        heading: "The brief",
        body: "The sourcing story, told without the aerial-and-acoustic-guitar formula the category defaults to.",
      },
      {
        type: "video",
        caption: "The 90-second master.",
        media: { ratio: "16/9", seed: "kestrel-master", src: "work/kestrel-master.jpg", alt: "Poster frame from the Kestrel brand film" },
      },
      {
        type: "gallery",
        caption: "Two estates, three days, no staged setups.",
        items: [
          { ratio: "3/2", seed: "kestrel-still-1", src: "work/kestrel-still-1.jpg", alt: "Estate workers during harvest" },
          { ratio: "3/2", seed: "kestrel-still-2", src: "work/kestrel-still-2.jpg", alt: "Hillside in morning weather" },
        ],
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
      { role: "Sound design", name: "Fix Frame" },
    ],
  },
  {
    slug: "harbour-sessions",
    title: "Harbour Sessions",
    category: "events",
    categoryLabel: "Events",
    year: 2024,
    location: "Chennai",
    client: "Harbour Arts",
    summary: "Three nights of live music, delivered as one festival film in 72 hours.",
    standfirst:
      "Four cameras, no rehearsal, no second take, and a delivery deadline three days after the last set.",
    narrative:
      "Live music is unforgiving. There is one take, the light is whatever the lighting designer decided, and the audio you are given is a board mix that was never intended to be listened to on its own.\n\nWe ran four cameras across three nights and shot for coverage rather than beauty, on the assumption that the film would be found in the edit. It was. The final cut moves between nights rather than through them, so the film builds where the festival merely continued.\n\nDelivered seventy-two hours after the last set, in time for the festival's own post-event campaign.",
    services: ["Videography", "Post-production"],
    featured: true,
    featuredOrder: 30,
    span: "tall",
    cover: { ratio: "4/5", seed: "harbour-cover", src: "work/harbour.jpg", alt: "Live music stage under coloured light" },
    blocks: [
      {
        type: "text",
        heading: "The constraint",
        body: "One take, three nights, and a 72-hour turnaround. The edit is where this one was won.",
      },
      {
        type: "gallery",
        caption: "Four cameras, shot for coverage.",
        items: [
          { ratio: "16/9", seed: "harbour-still-1", src: "work/harbour-still-1.jpg", alt: "Performance from night two" },
          { ratio: "16/9", seed: "harbour-still-2", src: "work/harbour-still-2.jpg", alt: "Crowd during the closing set" },
        ],
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
      { role: "Sound mix", name: "Fix Frame" },
    ],
  },
  {
    slug: "meera-arjun",
    title: "Meera & Arjun",
    category: "cinematic",
    categoryLabel: "Cinematic",
    year: 2024,
    location: "Coonoor",
    client: "Private",
    summary: "Forty guests, one camera, and a film that feels like a memory.",
    standfirst: "The smallest crew we have ever sent, on purpose.",
    narrative:
      "An intimate ceremony in a house, with forty guests and no stage. A second operator would have been one person too many in the room.\n\nSo we sent one. Handheld, one lens, no lights. The film is closer and less composed than our usual work, and it is better for it — the couple asked for something that felt like a memory rather than a broadcast, and a small crew is the only way to get that.",
    services: ["Videography", "Photography"],
    featured: false,
    span: "normal",
    cover: { ratio: "3/2", seed: "meera-cover", src: "work/meera.jpg", alt: "Intimate ceremony in a family home" },
    blocks: [
      {
        type: "text",
        heading: "The approach",
        body: "One operator, one lens, no lighting. Presence over production value.",
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
    ],
  },
  {
    slug: "northline-launch",
    title: "Northline — Product Launch",
    category: "commercial",
    categoryLabel: "Commercial",
    year: 2024,
    location: "Bengaluru",
    client: "Northline",
    summary: "One shoot, eleven deliverables, with the vertical cuts storyboarded — not salvaged.",
    standfirst:
      "Most launch films get cropped into vertical afterwards. It always shows.",
    narrative:
      "Northline needed a launch film and a full paid-social set from a single day of shooting. The usual approach is to shoot the master and crop it later, which produces vertical cuts with the subject wedged against one edge and the product out of frame.\n\nWe storyboarded the verticals alongside the master and framed for both, using a wider capture area and composing with the crop in mind. Eleven deliverables came out of one shoot, and none of them looks like an afterthought.",
    services: ["Videography", "Post-production", "Social"],
    featured: false,
    span: "wide",
    cover: { ratio: "16/9", seed: "northline-cover", src: "work/northline.jpg", alt: "Product launch film setup" },
    blocks: [
      {
        type: "text",
        heading: "The problem with cropping later",
        body: "Verticals framed as an afterthought always look like one. We storyboarded them alongside the master.",
      },
      {
        type: "beforeAfter",
        caption: "Cropped-after against framed-for.",
        before: { ratio: "9/16", seed: "northline-cropped", src: "work/northline-cropped.jpg", alt: "A landscape master cropped to vertical after the fact" },
        after: { ratio: "9/16", seed: "northline-framed", src: "work/northline-framed.jpg", alt: "The same subject framed for vertical at the shoot" },
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
      { role: "Motion", name: "Fix Frame" },
    ],
  },
  {
    slug: "the-long-room",
    title: "The Long Room",
    category: "events",
    categoryLabel: "Events",
    year: 2023,
    location: "Chennai",
    client: "The Long Room",
    summary: "A restaurant opening, shot as a single unbroken evening.",
    standfirst: "No interviews. No voiceover. The room does the talking.",
    narrative:
      "A restaurant opening film is usually a sizzle reel — plating close-ups, a chef talking about provenance, guests laughing at nothing. It tells you the food is good without ever showing you why anyone would want to be there.\n\nWe shot the evening as it happened, in sequence, and cut it that way. The film runs from an empty room at five o'clock to a full one at eleven. There is no narration, and the only close-ups are of people rather than plates.",
    services: ["Videography", "Photography"],
    featured: false,
    span: "normal",
    cover: { ratio: "4/5", seed: "long-room-cover", src: "work/long-room.jpg", alt: "Restaurant dining room at service" },
    blocks: [
      {
        type: "text",
        heading: "The approach",
        body: "Shot in sequence, cut in sequence. Five o'clock to eleven, in one unbroken evening.",
      },
    ],
    credits: [
      { role: "Director", name: "Fix Frame" },
      { role: "Cinematography", name: "Fix Frame" },
      { role: "Editor", name: "Fix Frame" },
    ],
  },
];
