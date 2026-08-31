import Link from "next/link";
import { notFound } from "next/navigation";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="section-sm wrap">
      <Reveal>
        <p className="crow-k">
          {post.category} · {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {post.readMinutes} min read
        </p>
        <h1 className="h h-lg" style={{ marginTop: "var(--sp-sm)" }}>{post.title}</h1>
        <p className="sub">{post.excerpt}</p>
      </Reveal>

      <Reveal delay={80} style={{ marginTop: "var(--sp-lg)" }}>
        <Frame media={post.cover} label={post.category} priority />
      </Reveal>

      <Reveal className="prose" delay={120} style={{ marginTop: "var(--sp-lg)" }}>
        {post.body.map((para, i) => <p key={i}>{para}</p>)}
      </Reveal>

      <Reveal delay={160} style={{ marginTop: "var(--sp-lg)" }}>
        <Link href="/blog" className="btn">← All posts</Link>
      </Reveal>
    </article>
  );
}
