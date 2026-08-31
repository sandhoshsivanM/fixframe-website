import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { WaveDivider } from "@/components/WaveDivider";
import { StoryFigure } from "@/components/StoryFigure";
import {
  getFeaturedProjects,
  getServices,
  getSite,
  getTestimonials,
} from "@/lib/content";

// C01 · Home / Cinematic Landing
// Hero → Selected Stories (asymmetric editorial) → Editing Signature →
// Service chapters → Process → Proof → Final CTA.

export default async function Home() {
  const site = await getSite();
  const featured = await getFeaturedProjects(4);
  const services = await getServices();
  const testimonials = await getTestimonials({ featuredOnly: true });

  return (
    <>
      {/* ── Hero. Poster paints first; the video slot stays empty until
             real footage exists, and the layout never shifts when it does. */}
      <section className="hero">
        <div className="hero-media">
          <Frame media={site.hero.media} label="Showreel" priority />
        </div>
        <div className="wrap hero-inner">
          <Reveal>
            <p className="eyebrow">{site.hero.eyebrow}</p>
            <h1 className="display display-xl">{site.hero.headline}</h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede">{site.hero.standfirst}</p>
          </Reveal>
          <Reveal delay={220}>
            <div className="actions">
              <Link href="/work" className="btn btn-accent">View work</Link>
              <Link href="/start-a-project" className="btn">Start a project</Link>
            </div>
            <p className="hero-scroll">Scroll — selected work</p>
          </Reveal>
        </div>
      </section>

      <WaveDivider accent />

      {/* ── Selected stories. Asymmetric editorial composition, not cards. */}
      <section className="section wrap">
        <SectionHeading
          eyebrow="Selected work"
          title="Recent stories"
          action={<Link href="/work" className="arrow-link">All work →</Link>}
        />
        {featured.length === 0 ? (
          <p className="muted">No published work yet.</p>
        ) : (
          <div className="stories">
            {featured.map((project, i) => (
              <StoryFigure key={project.slug} project={project} index={i + 1} />
            ))}
          </div>
        )}
      </section>

      <WaveDivider />

      {/* ── Editing signature: RAW → EDIT → GRADE → SOUND → FINAL. */}
      <section className="section wrap">
        <SectionHeading eyebrow="The editing signature" title="What happens after the shoot" />
        <div className="steps">
          {site.signature.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 70}>
              <p className="step-name display">{s.step}</p>
              <p className="step-body">{s.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/editing" className="arrow-link">See the edit in detail →</Link>
          </div>
        </Reveal>
      </section>

      <WaveDivider />

      {/* ── Service chapters. Oversized typographic, never six identical cards. */}
      <section className="section wrap">
        <SectionHeading
          eyebrow="What we do"
          title="Services"
          action={<Link href="/services" className="arrow-link">All services →</Link>}
        />
        <div className="chapters">
          {services.slice(0, 3).map((service, i) => (
            <Reveal key={service.slug} className="chapter" delay={i * 60}>
              <div>
                <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display display-sm">{service.name}</h3>
              </div>
              <div>
                <p className="chapter-standfirst">{service.standfirst}</p>
                <p className="soft">{service.description}</p>
                <Link
                  href={`/start-a-project?service=${service.slug}`}
                  className="arrow-link"
                  style={{ marginTop: "var(--space-sm)" }}
                >
                  Get a quote →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      {/* ── Process. */}
      <section className="section wrap">
        <SectionHeading eyebrow="How it works" title="From first call to final master" />
        <div className="steps">
          {site.process.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 70}>
              <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name display">{s.step}</p>
              <p className="step-body">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Proof. Approved testimonials only — the adapter enforces it. */}
      {testimonials.length > 0 && (
        <>
          <WaveDivider />
          <section className="section wrap">
            <SectionHeading eyebrow="Proof" title="What clients say" />
            <div className="grid-even" style={{ ["--cols" as string]: testimonials.length }}>
              {testimonials.map((t, i) => (
                <Reveal
                  key={t.personName}
                  delay={i * 80}
                  className="pullquote"
                  as="article"
                >
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <footer>
                    {t.personName} · {t.personRole}
                  </footer>
                </Reveal>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
