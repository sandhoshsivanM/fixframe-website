// Prefix for files served straight out of /public.
//
// Next rewrites hrefs in <Link> and sources in next/image when basePath is
// set, but it does NOT touch a plain <img src="/media/…">. The site uses
// plain <img> throughout (deliberately — the media is pre-sized and needs no
// optimiser), so under a basePath deployment every one of those would 404.
//
// Anything that resolves against /public must go through this.

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Media lives under /public/media, addressed by its path within it. */
export function mediaUrl(src: string) {
  return asset(`/media/${src.replace(/^\/+/, "")}`);
}
