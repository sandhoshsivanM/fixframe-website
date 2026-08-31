import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { getCategories, getProjects } from "@/lib/content";

export const metadata = { title: "Work", description: "Selected films, campaigns and edits." };

export default async function Work({
  searchParams,
}: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const projects = await getProjects({ category });
  const categories = await getCategories();
  const total = (await getProjects()).length;

  return (
    <div className="section wrap">
      <Heading white="Our" red="Work" sub="Films, campaigns and edits — shot and cut by the same team." size="lg" />

      {/* Real links here, not client state: work URLs must be shareable. */}
      <nav className="tabs" aria-label="Filter work by category">
        <Link href="/work" className="tab" aria-current={!category ? "true" : undefined}>All {total}</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/work?category=${c.slug}`} className="tab"
                aria-current={category === c.slug ? "true" : undefined}>
            {c.label} {c.count}
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        <div className="notice center">
          <p>Nothing published in this category yet.</p>
          <Link href="/work" className="btn" style={{ marginTop: "var(--sp-sm)" }}>See all work</Link>
        </div>
      ) : (
        <div className="work-grid">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 60}>
              <Link href={`/work/${p.slug}`} className="tile">
                <span className="tile-cat">{p.categoryLabel}</span>
                <Frame media={p.cover} label={p.categoryLabel} priority={i < 3} />
                <span className="tile-veil">
                  <h3>{p.title}</h3>
                  <p>{p.year} · {p.location} · {p.client}</p>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
