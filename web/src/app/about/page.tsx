import Link from "next/link";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getSite, getTeam } from "@/lib/content";

// C06 · About / Studio
// "Build trust through real people, BTS and operational credibility."
// V1 C06 business logic: only verifiable stats. The three in site.ts are
// the kind a studio can actually stand behind.

export const metadata = {
  title: "Studio",
  description: "Who we are, how we work, and why the edit comes first.",
};

const bts = [
  { ratio: "4/5", seed: "bts-1" },
  { ratio: "3/2", seed: "bts-2" },
  { ratio: "4/5", seed: "bts-3" },
] as const;

export default async function About() {
  const site = await getSite();
  const team = await getTeam();

  return (
    <>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">The studio</p>
          <h1 className="display display-lg" style={{ maxWidth: "15ch" }}>
            A small crew that shoots and cuts its own work.
          </h1>
        </Reveal>
      </section>

      <section className="section-sm wrap">
        <Reveal className="prose">
          <p>
            {site.name} started because the edit kept getting handed to someone
            who had not been on the shoot. The footage would come back cut by a
            stranger, competently, and it would be missing the one moment that
            mattered — because they were not there when it happened.
          </p>
          <p>
            So we built the studio the other way round. The people who shoot are
            the people who cut. Colour and sound are done in-house rather than
            outsourced as a finishing pass. Nothing is subcontracted, and there
            is no stock footage anywhere in this portfolio standing in for work
            we did not do.
          </p>
          <p>
            It makes us slower to scale and better at the part clients actually
            remember.
          </p>
        </Reveal>
      </section>

      <WaveDivider accent />

      {/* ── Verifiable numbers only — V1 C06 forbids invented stats. */}
      <section className="section-sm wrap">
        <div className="grid-even" style={{ ["--cols" as string]: 3 }}>
          {site.stats.map((s, i) => (
            <Reveal key={s.label} className="step" delay={i * 70}>
              <p className="display display-sm">{s.value}</p>
              <p className="step-body">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">The crew</p>
          <h2 className="display display-md" style={{ maxWidth: "14ch" }}>
            Who you actually work with.
          </h2>
        </Reveal>
        <div className="grid-even" style={{ ["--cols" as string]: 3, marginTop: "var(--space-lg)" }}>
          {team.map((member, i) => (
            <Reveal key={member.role} delay={i * 80}>
              <Frame media={member.portrait} label={member.role} />
              <h3 className="display" style={{ fontSize: "var(--text-xl)", marginTop: "var(--space-sm)" }}>
                {member.name}
              </h3>
              <p className="meta">{member.role}</p>
              <p className="story-summary">{member.bio}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Behind the scenes</p>
          <h2 className="display display-md" style={{ maxWidth: "16ch" }}>
            How it actually looks on the day.
          </h2>
        </Reveal>
        <div className="gallery" data-count={3} style={{ marginTop: "var(--space-lg)" }}>
          {bts.map((slot, i) => (
            <Reveal key={slot.seed} delay={i * 70}>
              <Frame media={slot} label="BTS" />
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">What we hold to</p>
          <h2 className="display display-md" style={{ maxWidth: "14ch" }}>
            Four things, consistently.
          </h2>
        </Reveal>
        <div className="grid-even" style={{ ["--cols" as string]: 4, marginTop: "var(--space-lg)" }}>
          {site.values.map((v, i) => (
            <Reveal key={v.title} className="step" delay={i * 60}>
              <p className="step-name display">{v.title}</p>
              <p className="step-body">{v.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={220}>
          <div className="actions" style={{ marginTop: "var(--space-xl)" }}>
            <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
            <Link href="/contact" className="btn">Contact the studio</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
