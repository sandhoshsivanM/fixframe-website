"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";

type Cat = { slug: string; label: string; count: number };

/**
 * The /work archive.
 *
 * Filtering is driven by the URL (`?category=events`) so a filtered view
 * stays shareable and the browser's back button works — blueprint §10:
 * "Keep filter state in the URL for sharing and browser navigation."
 *
 * The Suspense fallback is the COMPLETE, unfiltered grid rather than a
 * spinner. That is deliberate: during prerender it is what gets written
 * into the static HTML, so a crawler and a visitor without JavaScript both
 * receive every project. Hydration then narrows it to the requested
 * category. Blueprint §20 asks for meaningful HTML without JavaScript, and
 * a skeleton would not have been meaningful.
 */
export function WorkArchive({ projects, categories }: { projects: Project[]; categories: Cat[] }) {
  return (
    <Suspense fallback={<Archive projects={projects} categories={categories} category={undefined} />}>
      <Filtered projects={projects} categories={categories} />
    </Suspense>
  );
}

function Filtered({ projects, categories }: { projects: Project[]; categories: Cat[] }) {
  const category = useSearchParams().get("category") ?? undefined;
  return <Archive projects={projects} categories={categories} category={category} />;
}

function Archive({
  projects, categories, category,
}: { projects: Project[]; categories: Cat[]; category?: string }) {
  const known = categories.some((c) => c.slug === category);
  const active = known ? category : undefined;
  const shown = active ? projects.filter((p) => p.category === active) : projects;

  return (
    <>
      <nav className="tabs" aria-label="Filter work by category">
        <Link href="/work" className="tab" aria-current={!active ? "true" : undefined}>
          All <span className="tab-n">{projects.length}</span>
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/work?category=${c.slug}`}
            className="tab"
            aria-current={active === c.slug ? "true" : undefined}
          >
            {c.label} <span className="tab-n">{c.count}</span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="notice center">
          <p>Nothing published in this category yet.</p>
          <Link href="/work" className="btn" style={{ marginTop: "var(--s3)" }}>See all work</Link>
        </div>
      ) : (
        <div className="warchive">
          {shown.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 60}>
              {/* Every third tile runs wide, so the archive reads as an
                  editorial page rather than a uniform portfolio grid. */}
              <Link href={`/work/${p.slug}`} className="ecard" data-size={i % 3 === 0 ? "wide" : "tall"}>
                <div className="ecard-media">
                  <Frame media={p.cover} label={p.categoryLabel} priority={i < 3} />
                  <span className="ecard-veil" aria-hidden="true" />
                </div>
                <div className="ecard-body">
                  <p className="ecard-meta">
                    <span>{p.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.year}</span>
                    {p.location && (<><span aria-hidden="true">·</span><span>{p.location}</span></>)}
                  </p>
                  <h3 className="ecard-title h">{p.title}</h3>
                  <p className="ecard-summary">{p.summary}</p>
                  <span className="ecard-cue">
                    View case study
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h13M12 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
