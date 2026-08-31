import Link from "next/link";
import { ContactSection } from "@/components/ContactSection";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";
import { TeamGrid } from "@/components/TeamGrid";
import { getSite, getTeam } from "@/lib/content";

export const metadata = { title: "About Us", description: "Who we are and how we work." };

export default async function About() {
  const site = await getSite();
  const team = await getTeam();

  return (
    <>
      <section className="section-sm wrap">
        <div className="split">
          <Reveal>
            <h1 className="h h-lg">About<br /><em>Fix Frame</em></h1>
            <hr className="tick" />
            <p className="soft" style={{ marginTop: "var(--sp-md)" }}>{site.about.body}</p>
            <p className="soft">
              We shoot and cut everything in-house. No subcontracted editors, and no stock
              footage standing in for work we did not do.
            </p>
            <p className="red" style={{ fontStyle: "italic" }}>
              {site.hero.tagline.a} {site.hero.tagline.b} {site.hero.tagline.c}
            </p>
          </Reveal>
          <Reveal className="split-media" delay={120}>
            <Frame media={site.about.media} label="Studio" priority />
          </Reveal>
        </div>
      </section>

      <section className="section-sm wrap">
        <div className="cards">
          {site.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="card">
                <h3 className="h h-md" style={{ color: "var(--red)" }}><Counter value={s.value} /></h3>
                <p>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <Heading white="The" red="Crew" sub="Who you actually work with." size="md" />
        <TeamGrid team={team} />
      </section>

      <section className="section wrap">
        <Heading white="Behind The" red="Scenes" sub="This is where the magic happens." size="md" />
        <div className="strip">
          {site.bts.map((slot, i) => (
            <Reveal key={slot.seed} delay={i * 55}><Frame media={slot} label="BTS" /></Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <Heading white="What We" red="Hold To" size="md" />
        <div className="cards">
          {site.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 60}>
              <div className="card">
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="center">
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/start-a-project" className="btn btn-red">Book a shoot</Link>
            <Link href="/work" className="btn">View our work</Link>
          </div>
        </Reveal>
      </section>

      <ContactSection />
    </>
  );
}
