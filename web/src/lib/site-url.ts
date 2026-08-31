// The canonical origin the site is served from.
//
// Used for absolute URLs that must be right in the wild — Open Graph images,
// canonical links, robots.txt and the sitemap. Getting this wrong doesn't
// break a page, it breaks link previews and search indexing, which is the
// kind of thing nobody notices until a client shares the site.
//
// Set NEXT_PUBLIC_SITE_URL once the real domain is live. Until then Vercel
// supplies its own production hostname, and local dev falls back to :3000.

const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  fromEnv ??
  (fromVercel ? `https://${fromVercel}` : "http://localhost:3000")
).replace(/\/+$/, "");
