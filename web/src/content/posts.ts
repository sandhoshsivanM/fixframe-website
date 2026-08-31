export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  category: string;
  cover: { ratio: "16/9"; seed: string; src?: string; alt?: string };
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "why-the-edit-decides-the-film",
    title: "Why the edit decides the film",
    excerpt: "Coverage is not a story. What happens after the shoot is where most films are won or lost.",
    date: "2026-07-18",
    readMinutes: 4,
    category: "Craft",
    cover: { ratio: "16/9", seed: "post-edit", src: "work/kestrel-master.jpg", alt: "Editing suite during a grade" },
    body: [
      "Every brief we receive is about the shoot. How many cameras, how many hours, whether a drone is included. Almost none of them are about the edit — which is where the film actually gets made.",
      "A day of coverage gives you material. It does not give you a story. The story is a decision about what to leave out, and that decision happens weeks later, in a dark room, by someone who has watched the footage forty times.",
      "This is why we do not subcontract editing. The person cutting the film was on the shoot. They know that the good moment happened at 4pm when nobody was looking, not during the scheduled speech.",
    ],
  },
  {
    slug: "shooting-for-vertical",
    title: "Shooting for vertical, not cropping into it",
    excerpt: "Most vertical cuts are landscape films with the sides removed. It always shows.",
    date: "2026-06-02",
    readMinutes: 3,
    category: "Short-form",
    cover: { ratio: "16/9", seed: "post-vertical", src: "work/northline.jpg", alt: "Vertical framing on a product shoot" },
    body: [
      "The standard approach to social deliverables is to shoot a landscape master and crop it afterwards. The subject ends up wedged against one edge, the product leaves frame, and the composition the DoP built is gone.",
      "We storyboard the verticals alongside the master and frame for both — capturing wider, and composing with the crop in mind. It costs nothing extra on the day and saves the whole set in post.",
    ],
  },
  {
    slug: "what-a-grade-actually-does",
    title: "What a colour grade actually does",
    excerpt: "A grade is not a filter. It is the difference between footage and a film.",
    date: "2026-04-21",
    readMinutes: 5,
    category: "Post-production",
    cover: { ratio: "16/9", seed: "post-grade", src: "work/av-graded.jpg", alt: "Graded frame from a delivered film" },
    body: [
      "Log footage looks wrong on purpose. It is flat, desaturated and low in contrast because it is holding as much information as the sensor could capture, waiting for someone to decide what the image should look like.",
      "That decision is the grade. It sets where the blacks sit, how skin reads, which colours lead and which recede. Done well it is invisible; done badly, or skipped, the film looks like footage.",
      "It is also the single cheapest way to make a modest shoot look considered — which is why we treat it as part of the work rather than a finishing pass.",
    ],
  },
];
