import Link from "next/link";
import { get } from "@/lib/api";
import { Poster } from "../Poster";

type Project = { slug: string; title: string; summary: string; year: number; location: string | null; category: string; categorySlug: string };
type Cat = { name: string; slug: string };

export const metadata = { title: "Work — Fix Frame" };

export default async function Work({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const data = await get<{ items: Project[]; categories: Cat[] }>(
    `/public/projects${category ? `?category=${encodeURIComponent(category)}` : ""}`
  );
  const items = data?.items ?? [];
  const cats = data?.categories ?? [];

  return (
    <div className="wrap band">
      <p className="eyebrow">Selected work</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "20ch" }}>Films, campaigns and edits.</h1>

      <div className="filters">
        <Link href="/work" className="chip" aria-current={!category}>All</Link>
        {cats.map((c) => (
          <Link key={c.slug} href={`/work?category=${c.slug}`} className="chip" aria-current={category === c.slug}>
            {c.name}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="notice">
          <p style={{ margin: 0 }}>Nothing published in this category yet.</p>
          <p style={{ margin: "0.5rem 0 0" }}><Link href="/work" className="soft">See all work →</Link></p>
        </div>
      ) : (
        <div className="work-grid">
          {items.map((p) => (
            <Link key={p.slug} href={`/work/${p.slug}`} className="work-card">
              <Poster title={p.title} />
              <h3>{p.title}</h3>
              <p className="work-meta">{p.category} · {p.year}{p.location ? ` · ${p.location}` : ""}</p>
              <p className="soft" style={{ fontSize: "var(--step--1)", marginTop: "0.5rem" }}>{p.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
