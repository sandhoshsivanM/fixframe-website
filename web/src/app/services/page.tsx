import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getProjectsBySlugs, getServices, getSite } from "@/lib/content";

export const metadata = { title: "Services", description: "End to end visual solutions." };

export default async function Services() {
  const services = await getServices();
  const site = await getSite();
  const chapters = await Promise.all(
    services.map(async (s) => ({ service: s, work: await getProjectsBySlugs(s.featuredWork) }))
  );

  return (
    <>
      <section className="section-sm wrap">
        <Heading white="What" red="We Do" sub="End to End Visual Solutions" size="lg" />
        <div className="cards">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 55}>
              <a href={`#${s.slug}`} className="card" style={{ display: "block" }}>
                <Icon name={s.icon} size={34} className="card-ico" />
                <h3>{s.name}</h3>
                <p>{s.short}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap">
        {chapters.map(({ service, work }, i) => (
          <Reveal key={service.slug} className="chapter" as="section">
            <div id={service.slug} style={{ scrollMarginTop: "90px" }}>
              <p className="step-n">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="h h-md">{service.name}</h2>
              <hr className="tick" />
              <Link href={`/start-a-project?service=${service.slug}`} className="btn btn-red" style={{ marginTop: "var(--sp-md)" }}>
                Get a quote
              </Link>
            </div>
            <div>
              <p className="lede">{service.standfirst}</p>
              <p className="soft">{service.description}</p>
              <ul className="deliverables">
                {service.deliverables.map((d) => <li key={d}>{d}</li>)}
              </ul>
              {work.length > 0 && (
                <div style={{ marginTop: "var(--sp-md)" }}>
                  <p className="crow-k" style={{ marginBottom: "0.5rem" }}>Relevant work</p>
                  <div className="gallery" data-count={work.length}>
                    {work.map((p) => (
                      <Link key={p.slug} href={`/work/${p.slug}`} className="tile">
                        <Frame media={p.cover} label={p.categoryLabel} />
                        <span className="tile-veil"><h3>{p.title}</h3></span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </section>

      <section className="section wrap">
        <Heading white="How It" red="Works" size="md" />
        <div className="steps">
          {site.process.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 60}>
              <p className="step-n">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name">{s.step}</p>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
