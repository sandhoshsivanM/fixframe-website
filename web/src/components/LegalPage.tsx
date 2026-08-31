import { Reveal } from "./Reveal";
import type { SitePage } from "@/content/types";

// Shared shell for the legal pages. `## ` at the head of a paragraph marks
// a subheading — enough structure for policy copy without pulling in a
// markdown renderer.
export function LegalPage({ page }: { page: SitePage }) {
  const updated = new Date(page.updated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="section-sm wrap">
      <Reveal>
        <p className="crow-k">Legal</p>
        <h1 className="h h-lg">{page.title}</h1>
        {/* RULE-C11-4 — a visible last-updated date. */}
        <p className="meta" style={{ marginTop: "var(--sp-sm)" }}>Last updated {updated}</p>
        {page.standfirst && (
          <div className="notice" style={{ marginTop: "var(--sp-md)", maxWidth: "68ch" }}>
            <p className="meta" style={{ margin: 0 }}>{page.standfirst}</p>
          </div>
        )}
      </Reveal>

      <Reveal className="prose" delay={80}>
        {page.body.map((para, i) =>
          para.startsWith("## ") ? (
            <h2 key={i}>{para.slice(3)}</h2>
          ) : (
            <p key={i}>{para}</p>
          )
        )}
      </Reveal>
    </section>
  );
}
