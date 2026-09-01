// THE CONTENT ADAPTER.
//
// Every public page reads the site through these functions and nothing else.
// Today they resolve against typed files in src/content. When the CRM lands,
// each body is replaced with a fetch against the API in spec/reference/api.md
// — same names, same return shapes — and no page changes.
//
// They are async on purpose. Making them synchronous now would mean rewriting
// every call site later, which is exactly the coupling this file exists to
// prevent.

import { pages } from "@/content/pages";
import { projects } from "@/content/projects";
import { packageGroups, packages, reels, services, team, testimonials } from "@/content/catalogue";
import { posts } from "@/content/posts";
import { site } from "@/content/site";
import type { Category, Project, SitePage } from "@/content/types";

export type { Project, Service, Package, Reel, Testimonial, MediaSlot, ProjectBlock } from "@/content/types";

export async function getSite() {
  return site;
}

/** Featured first (by featuredOrder), then newest — V1 C02 ordering. */
export async function getProjects(filter?: { category?: string; limit?: number }) {
  let list = [...projects];

  if (filter?.category && filter.category !== "all") {
    list = list.filter((p) => p.category === filter.category);
  }

  list.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.featured && b.featured) {
      return (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999);
    }
    return b.year - a.year;
  });

  return filter?.limit ? list.slice(0, filter.limit) : list;
}

export async function getFeaturedProjects(limit = 4) {
  const list = await getProjects();
  return list.filter((p) => p.featured).slice(0, limit);
}

export async function getProject(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug) ?? null;
}

/** Editorial next-project navigation (V1 C03). Wraps at the end. */
export async function getNextProject(slug: string): Promise<Project | null> {
  const list = await getProjects();
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1 || list.length < 2) return null;
  return list[(index + 1) % list.length];
}

export async function getProjectsBySlugs(slugs: string[]) {
  return slugs
    .map((s) => projects.find((p) => p.slug === s))
    .filter((p): p is Project => Boolean(p));
}

/** Category facets, with counts, derived from published work only. */
export async function getCategories() {
  const counts = new Map<Category, { label: string; count: number }>();
  for (const p of projects) {
    const entry = counts.get(p.category);
    counts.set(p.category, {
      label: p.categoryLabel,
      count: (entry?.count ?? 0) + 1,
    });
  }
  return [...counts.entries()].map(([slug, v]) => ({ slug, ...v }));
}

/** Empty chapters are never shown — V1 C04 empty state. */
export async function getServices() {
  return services.filter((s) => s.deliverables.length > 0);
}

export async function getService(slug: string) {
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getPackages(group?: string) {
  return group ? packages.filter((p) => p.group === group) : packages;
}

export async function getPackageGroups() {
  return packageGroups;
}

export async function getPosts() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getReels() {
  // A reel never links to a project that is not published — RULE-C10-10.
  const published = new Set(projects.map((p) => p.slug));
  return reels.map((r) => ({
    ...r,
    projectSlug: r.projectSlug && published.has(r.projectSlug) ? r.projectSlug : undefined,
    projectTitle: r.projectSlug
      ? projects.find((p) => p.slug === r.projectSlug)?.title
      : undefined,
  }));
}

/** RULE-F12-1 — approved only, enforced here so no page can forget. */
export async function getTestimonials(opts?: { featuredOnly?: boolean }) {
  return testimonials
    .filter((t) => t.approved)
    .filter((t) => (opts?.featuredOnly ? t.featured : true));
}

/**
 * §11 ordering, and one guard: a member with no name is not published.
 *
 * That guard is what lets `catalogue.ts` carry the crew's roles, portraits
 * and tools while the names are still being confirmed — the section stays
 * hidden until a real name is filled in, so nothing invented can reach
 * production (§01), and it appears the moment one is.
 */
export async function getTeam(opts?: { featuredOnly?: boolean }) {
  return team
    .filter((m) => m.name.trim().length > 0)
    .filter((m) => (opts?.featuredOnly ? m.featured : true))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function getPage(slug: string): Promise<SitePage | null> {
  return pages.find((p) => p.slug === slug) ?? null;
}

/** Before/after pairs shown on the editing page (C05). */
export async function getBeforeAfterPairs() {
  const pairs: {
    projectSlug: string;
    projectTitle: string;
    caption: string;
    before: Project["cover"];
    after: Project["cover"];
  }[] = [];

  for (const p of projects) {
    for (const block of p.blocks) {
      if (block.type === "beforeAfter") {
        pairs.push({
          projectSlug: p.slug,
          projectTitle: p.title,
          caption: block.caption ?? "",
          before: block.before,
          after: block.after,
        });
      }
    }
  }
  return pairs;
}
