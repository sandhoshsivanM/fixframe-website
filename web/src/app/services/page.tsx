import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getProjectsBySlugs, getServices, getSite } from "@/lib/content";

// C04 · Services
// "Oversized typographic service chapters, not six identical cards."
// Empty chapters are never rendered — the adapter filters them out.

export const metadata = {
  title: "Services",
  description: "Videography, post-production, photography, drone and short-form.",
};

export default async function Services() {
  const services = await getServices();
  const site = await getSite();

  const chapters = await Promise.all(
    services.map(async (service) => ({
      service,
      work: await getProjectsBySlugs(service.featuredWork),
    }))
  );

  return (
    <>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">What we do</p>
          <h1 className="display display-lg" style={{ maxWidth: "12ch" }}>
            Services
          </h1>
          <p className="lede" style={{ marginTop: "var(--space-md)" }}>
            Shot, cut, graded and delivered by the same team. Every chapter below
            starts the enquiry with that service already selected.
          </p>
        </Reveal>
      </section>

      <section className="wrap">
        <div className="chapters">
          {chapters.map(({ service, work }, i) => (
            <Reveal key={service.slug} className="chapter" as="section">
              <div>
                <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="display display-sm">{service.name}</h2>
                <Link
                  href={`/start-a-project?service=${service.slug}`}
                  className="btn"
                  style={{ marginTop: "var(--space-md)" }}
                >
                  Get a quote
                </Link>
              </div>

              <div>
                <p className="chapter-standfirst">{service.standfirst}</p>
                <p className="soft">{service.description}</p>

                <ul className="deliverables">
                  {service.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>

                {work.length > 0 && (
                  <div style={{ marginTop: "var(--space-lg)" }}>
                    <p className="meta" style={{ marginBottom: "var(--space-xs)" }}>
                      Relevant work
                    </p>
                    <div className="gallery" data-count={work.length}>
                      {work.map((p) => (
                        <Link key={p.slug} href={`/work/${p.slug}`} className="story">
                          <Frame media={p.cover} label={p.categoryLabel} />
                          <p className="meta" style={{ marginTop: "var(--space-2xs)" }}>
                            {p.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="display display-md" style={{ maxWidth: "16ch" }}>
            From first call to final master.
          </h2>
        </Reveal>
        <div className="steps" style={{ marginTop: "var(--space-lg)" }}>
          {site.process.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 70}>
              <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name display">{s.step}</p>
              <p className="step-body">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
