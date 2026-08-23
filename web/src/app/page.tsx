import Link from "next/link";
import { get } from "@/lib/api";
import { Poster } from "./Poster";

type Project = { slug: string; title: string; summary: string; year: number; location: string | null; category: string; clientDisplayName: string | null };
type Testimonial = { quote: string; personName: string; personRole: string | null };

export default async function Home() {
  const work = await get<{ items: Project[] }>("/public/projects?limit=6");
  const testimonials = await get<Testimonial[]>("/public/testimonials");
  const featured = work?.items ?? [];

  return (
    <>
      <section className="wrap hero">
        <p className="eyebrow">Videography · Photography · Post-production</p>
        <h1>The story is made in the edit.</h1>
        <p className="lede">
          We shoot and cut everything in-house. No subcontracted editors, no stock
          footage standing in for work we did not do.
        </p>
        <div className="actions">
          <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
          <Link href="/work" className="btn">View work</Link>
        </div>
      </section>

      <hr className="rule" />

      <section className="wrap band">
        <div className="section-head">
          <h2>Selected work</h2>
          <Link href="/work" className="soft">All work →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="muted">No published work yet.</p>
        ) : (
          <div className="work-grid">
            {featured.map((p) => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="work-card">
                <Poster title={p.title} />
                <h3>{p.title}</h3>
                <p className="work-meta">{p.category} · {p.year}{p.location ? ` · ${p.location}` : ""}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <hr className="rule" />

      <section className="wrap band">
        <div className="section-head"><h2>How the edit works</h2></div>
        <div className="work-grid">
          {[
            ["RAW", "Everything we shot, unsorted and honest."],
            ["EDIT", "Structure first. The story decides the cut, not the timeline."],
            ["GRADE", "Colour built for the room it was shot in."],
            ["SOUND", "Mixed, not just laid under."],
            ["FINAL", "Masters and deliverables, in the formats you need."],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="eyebrow">{k}</p>
              <p className="soft">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <>
          <hr className="rule" />
          <section className="wrap band">
            <div className="section-head"><h2>What clients say</h2></div>
            <div className="work-grid">
              {testimonials.map((t, i) => (
                <blockquote key={i} style={{ margin: 0 }}>
                  <p style={{ fontSize: "var(--step-1)" }}>&ldquo;{t.quote}&rdquo;</p>
                  <p className="work-meta">{t.personName}{t.personRole ? ` · ${t.personRole}` : ""}</p>
                </blockquote>
              ))}
            </div>
          </section>
        </>
      )}

      <hr className="rule" />
      <section className="wrap band" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "var(--step-3)" }}>Have a story in mind?</h2>
        <p className="lede" style={{ marginInline: "auto" }}>Tell us about it. We reply within 24 business hours.</p>
        <div className="actions" style={{ justifyContent: "center" }}>
          <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
        </div>
      </section>
    </>
  );
}
