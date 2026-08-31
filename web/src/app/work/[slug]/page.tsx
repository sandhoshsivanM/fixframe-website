import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getNextProject, getProject, getProjects } from "@/lib/content";

// C03 · Project Case Study
// Hero → metadata → story → media blocks → credits → next story → CTA.
// An unknown or unpublished slug 404s — RULE-C13-3, it discloses nothing.

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const next = await getNextProject(slug);

  return (
    <article>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">
            {project.categoryLabel} · {project.year}
          </p>
          <h1 className="display display-lg" style={{ maxWidth: "16ch" }}>
            {project.title}
          </h1>
          <p className="lede" style={{ marginTop: "var(--space-md)", maxWidth: "50ch" }}>
            {project.standfirst}
          </p>
        </Reveal>
      </section>

      <div className="wrap">
        <Reveal>
          <Frame media={project.cover} label={project.title} priority />
        </Reveal>
      </div>

      <section className="section-sm wrap">
        <Reveal>
          <dl className="detail-grid">
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{project.location}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>{project.services.join(", ")}</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      <section className="section-sm wrap">
        <Reveal className="prose">
          {project.narrative.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Reveal>
      </section>

      {/* ── Media blocks, in authored order. */}
      {project.blocks.map((block, i) => (
        <section className="section-sm wrap" key={i}>
          {block.type === "text" && (
            <Reveal className="prose">
              {block.heading && <h2>{block.heading}</h2>}
              <p>{block.body}</p>
            </Reveal>
          )}

          {block.type === "video" && (
            <Reveal>
              <Frame media={block.media} label="Play" />
              {block.caption && <p className="caption">{block.caption}</p>}
            </Reveal>
          )}

          {block.type === "gallery" && (
            <Reveal>
              <div className="gallery" data-count={block.items.length}>
                {block.items.map((item, j) => (
                  <Frame key={j} media={item} />
                ))}
              </div>
              {block.caption && <p className="caption">{block.caption}</p>}
            </Reveal>
          )}

          {block.type === "beforeAfter" && (
            <Reveal>
              <BeforeAfter
                before={block.before}
                after={block.after}
                caption={block.caption}
              />
            </Reveal>
          )}

          {block.type === "quote" && (
            <Reveal className="pullquote">
              <p>&ldquo;{block.quote}&rdquo;</p>
              <footer>{block.attribution}</footer>
            </Reveal>
          )}
        </section>
      ))}

      <WaveDivider />

      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">Credits</p>
          <div className="grid-even" style={{ ["--cols" as string]: 3 }}>
            {project.credits.map((c) => (
              <div key={c.role}>
                <p className="meta" style={{ marginBottom: "0.2rem" }}>{c.role}</p>
                <p className="soft" style={{ margin: 0 }}>{c.name}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <WaveDivider accent />

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Want something like this?</p>
            <h2 className="display display-md" style={{ maxWidth: "14ch" }}>
              Start a similar project.
            </h2>
            {/* The CTA carries project context into the brief — V1 C03. */}
            <div className="actions" style={{ marginTop: "var(--space-md)" }}>
              <Link
                href={`/start-a-project?from=${project.slug}`}
                className="btn btn-accent"
              >
                Start a project
              </Link>
            </div>
          </div>

          {next && (
            <Link href={`/work/${next.slug}`} className="arrow-link">
              Next story: {next.title} →
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
