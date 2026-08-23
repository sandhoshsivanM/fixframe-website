import Link from "next/link";
import { notFound } from "next/navigation";
import { get } from "@/lib/api";
import { Poster } from "../../Poster";

type Block = { type: string; content: string };
type Project = {
  slug: string; title: string; summary: string; narrative: string; year: number;
  location: string | null; clientDisplayName: string | null; category: string;
  seoTitle: string | null; seoDescription: string | null; hasCaptions: boolean; blocks: Block[];
};
type Payload = { project: Project; next: { slug: string; title: string } | null };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await get<Payload>(`/public/projects/${slug}`);
  if (!data) return { title: "Not found" };
  return { title: data.project.seoTitle ?? data.project.title, description: data.project.seoDescription ?? data.project.summary };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await get<Payload>(`/public/projects/${slug}`);
  // An unpublished or rights-lapsed project 404s indistinguishably — RULE-C13-3.
  if (!data) notFound();
  const { project, next } = data;

  return (
    <article className="wrap band">
      <p className="eyebrow">{project.category} · {project.year}</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "18ch" }}>{project.title}</h1>
      <p className="lede">{project.summary}</p>

      <div style={{ margin: "2.5rem 0" }}>
        <Poster title={project.title} />
      </div>

      <dl className="work-grid" style={{ margin: "0 0 3rem" }}>
        {[
          ["Client", project.clientDisplayName ?? "—"],
          ["Location", project.location ?? "—"],
          ["Year", String(project.year)],
          ["Captions", project.hasCaptions ? "Available" : "Not required"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="eyebrow">{k}</dt>
            <dd style={{ margin: "0.35rem 0 0" }} className="soft">{v}</dd>
          </div>
        ))}
      </dl>

      <div style={{ maxWidth: "var(--measure)" }}>
        <h2 style={{ fontSize: "var(--step-2)", marginBottom: "1rem" }}>The brief</h2>
        <p className="soft">{project.narrative}</p>
      </div>

      {project.blocks.filter((b) => b.type === "Credits").map((b, i) => {
        const credits = JSON.parse(b.content) as Record<string, string>;
        return (
          <div key={i} style={{ marginTop: "3rem" }}>
            <h2 style={{ fontSize: "var(--step-1)", marginBottom: "1rem" }}>Credits</h2>
            <div className="work-grid">
              {Object.entries(credits).map(([role, who]) => (
                <div key={role}>
                  <p className="eyebrow">{role}</p>
                  <p className="soft" style={{ margin: 0 }}>{who}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <hr className="rule" style={{ margin: "3rem 0" }} />
      <div className="section-head">
        <div>
          <h2 style={{ fontSize: "var(--step-2)" }}>Want something like this?</h2>
          {/* CTA carries project context — closes the V1 C03 dead-end. */}
          <Link href={`/start-a-project?from=${project.slug}`} className="btn btn-accent" style={{ marginTop: "1rem" }}>
            Start a similar project
          </Link>
        </div>
        {next && <Link href={`/work/${next.slug}`} className="soft">Next: {next.title} →</Link>}
      </div>
    </article>
  );
}
