"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";

type Cat = { slug: string; label: string; count: number };

/**
 * Featured works grid with ALL / category tabs.
 * Filtering is client-side so the tabs feel instant; the /work page uses
 * real URLs instead, because those need to be linkable and crawlable.
 */
export function WorkGrid({ projects, categories }: { projects: Project[]; categories: Cat[] }) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Filter work">
        <button
          role="tab"
          className="tab"
          aria-current={active === "all" ? "true" : undefined}
          aria-selected={active === "all"}
          onClick={() => setActive("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            role="tab"
            className="tab"
            aria-current={active === c.slug ? "true" : undefined}
            aria-selected={active === c.slug}
            onClick={() => setActive(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="muted center">Nothing published in this category yet.</p>
      ) : (
        <div className="work-grid">
          {shown.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 60}>
              <Link href={`/work/${p.slug}`} className="tile">
                <Frame media={p.cover} label={p.categoryLabel} priority={i < 3} />
                <span className="tile-veil">
                  <h3>{p.title}</h3>
                  <p>{p.year} · {p.location}</p>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
