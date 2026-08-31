import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Reveal } from "@/components/Reveal";
import { getPosts } from "@/lib/content";

export const metadata = { title: "Blog", description: "Notes on shooting, editing and delivering film." };

export default async function Blog() {
  const posts = await getPosts();

  return (
    <section className="section wrap">
      <Heading white="The" red="Blog" sub="Notes on shooting, editing and delivering film." size="lg" />
      {posts.length === 0 ? (
        <p className="muted center">Nothing published yet.</p>
      ) : (
        <div className="work-grid">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <Link href={`/blog/${post.slug}`} className="tile">
                <Frame media={post.cover} label={post.category} priority={i < 3} />
                <span className="tile-veil">
                  <h3>{post.title}</h3>
                  <p>{post.readMinutes} min read</p>
                </span>
              </Link>
              <h3 className="h h-sm" style={{ marginTop: "var(--sp-sm)" }}>{post.title}</h3>
              <p className="crow-k" style={{ marginTop: "0.3rem" }}>
                {post.category} · {new Date(post.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </p>
              <p className="soft" style={{ fontSize: "var(--t-sm)", marginTop: "0.4rem" }}>{post.excerpt}</p>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
