import { notFound } from "next/navigation";
import { get } from "@/lib/api";

type Page = { slug: string; title: string; body: string; seoTitle: string | null; seoDescription: string | null; updatedAt: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await get<Page>(`/public/pages/${slug}`);
  return { title: page?.seoTitle ?? page?.title ?? "Not found" };
}

export default async function SitePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await get<Page>(`/public/pages/${slug}`);
  if (!page) notFound();

  return (
    <div className="wrap band" style={{ maxWidth: "var(--measure)" }}>
      <h1 style={{ fontSize: "var(--step-3)" }}>{page.title}</h1>
      {/* RULE-C11-4: visible last-updated date */}
      <p className="muted" style={{ fontSize: "var(--step--1)" }}>
        Last updated {new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="soft" style={{ marginTop: "2rem" }}>
        {page.body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </div>
  );
}
