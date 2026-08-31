import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { getCategories, getProjects } from "@/lib/content";

// C02 · Work / Portfolio
// "Editorial list/masonry" — deliberately not a uniform gallery grid.
// Item width is driven by each project's `span`, so the page has rhythm.

export const metadata = {
  title: "Work",
  description: "Selected films, campaigns and edits.",
};

export default async function Work({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const projects = await getProjects({ category });
  const categories = await getCategories();
  const total = (await getProjects()).length;

  return (
    <div className="section wrap">
      <Reveal>
        <p className="eyebrow">Selected work</p>
        <h1 className="display display-lg" style={{ maxWidth: "14ch" }}>
          Films, campaigns and edits.
        </h1>
        <p className="lede" style={{ marginTop: "var(--space-md)" }}>
          Every project here was shot and cut by the same team. Filter by what
          you need, or read them in order.
        </p>
      </Reveal>

      {/* Horizontal scroll on mobile — V1 C02 responsive rule. */}
      <nav className="filters" aria-label="Filter work by category">
        <Link href="/work" className="chip" aria-current={!category ? "true" : undefined}>
          All <span className="count">{total}</span>
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/work?category=${c.slug}`}
            className="chip"
            aria-current={category === c.slug ? "true" : undefined}
          >
            {c.label} <span className="count">{c.count}</span>
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        <div className="notice">
          <p>Nothing published in this category yet.</p>
          <Link href="/work" className="arrow-link">See all work →</Link>
        </div>
      ) : (
        <div className="work-stream">
          {projects.map((project, i) => (
            <Reveal
              key={project.slug}
              as="article"
              delay={(i % 3) * 70}
              className="work-item"
              dataSpan={project.span ?? "normal"}
            >
              <Link href={`/work/${project.slug}`} className="story">
                <Frame
                  media={project.cover}
                  label={project.categoryLabel}
                  priority={i < 2}
                />
                <div className="story-head">
                  <h2 className="display">{project.title}</h2>
                  <span className="story-index">{project.year}</span>
                </div>
                {/* Metadata is always visible — never hover-only (C02). */}
                <p className="meta">
                  {project.categoryLabel} · {project.location} · {project.client}
                </p>
                <p className="story-summary">{project.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
