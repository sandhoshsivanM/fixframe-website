import Link from "next/link";
import type { Project } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";

/**
 * Editorial featured work — one full-width lead, then a pair beneath it.
 *
 * The equal-sized grid this replaces was the single strongest "template"
 * signal on the site: six identical rectangles, every project weighted the
 * same, nothing for the eye to land on first. Here the lead project gets
 * real scale and the pair below it alternate landscape against portrait,
 * so the composition tells you what to look at.
 *
 * Metadata (title, category, year) is always visible — blueprint §06 is
 * explicit that hover information must become visible content on touch,
 * and a caption you can only reach with a mouse is not a caption. Hover
 * and focus add the summary and the "View case study" cue on top.
 */
export function FeaturedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  const [lead, ...rest] = projects;
  const pair = rest.slice(0, 2);

  return (
    <div className="ework">
      <Reveal>
        <ProjectCard project={lead} size="lead" />
      </Reveal>

      {pair.length > 0 && (
        <div className="ework-pair">
          {pair.map((p, i) => (
            <Reveal key={p.slug} delay={80 + i * 90}>
              {/* Alternating crops: the first sits wide, the second upright.
                  Two identical boxes would put the grid straight back. */}
              <ProjectCard project={p} size={i === 0 ? "wide" : "tall"} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: p, size }: { project: Project; size: "lead" | "wide" | "tall" }) {
  return (
    <Link href={`/work/${p.slug}`} className="ecard" data-size={size}>
      <div className="ecard-media">
        <Frame media={p.cover} label={p.categoryLabel} />
        <span className="ecard-veil" aria-hidden="true" />
      </div>

      <div className="ecard-body">
        <p className="ecard-meta">
          <span>{p.categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{p.year}</span>
          {p.location && (
            <>
              <span aria-hidden="true">·</span>
              <span>{p.location}</span>
            </>
          )}
        </p>
        <h3 className="ecard-title">{p.title}</h3>
        {/* Revealed on hover and focus, but present in the document for
            screen readers and for touch, where there is no hover. */}
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
  );
}
