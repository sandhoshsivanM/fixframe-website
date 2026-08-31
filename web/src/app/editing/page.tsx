import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getBeforeAfterPairs, getService, getSite } from "@/lib/content";

// C05 · Editing / Post-production
// "Demonstrate post-production as a premium service using real before/after
// material rather than generic claims." The comparison stays operable with
// motion disabled — the BeforeAfter component is range-driven, not drag-only.

export const metadata = {
  title: "Editing",
  description:
    "Offline edit, colour, sound and motion — on footage we shot, or on yours.",
};

const capabilities = [
  { name: "Offline edit", body: "Structure, pace and story. The part that decides whether the film works." },
  { name: "Colour", body: "Log to delivery. Graded for the room it was shot in, not for the LUT it was shot on." },
  { name: "Sound", body: "Dialogue repair, design and mix. Mixed, not laid underneath." },
  { name: "Motion", body: "Titles, lower thirds and graphics that match the grade rather than fight it." },
  { name: "Reels", body: "Vertical cutdowns framed for 9:16, storyboarded alongside the master." },
  { name: "Long-form", body: "Documentary and event films where the edit runs to twenty minutes and has to hold." },
];

const workflow = [
  { step: "Receive footage", body: "Any format, any camera. We check it before we quote." },
  { step: "Brief", body: "What the film is for, who watches it, and how long it has to hold them." },
  { step: "First cut", body: "Structure only. No colour, no sound polish — the story has to work first." },
  { step: "Review", body: "You watch it while it can still change. Feedback recorded against timecode." },
  { step: "Master", body: "Grade, mix, captions and every deliverable in the format you need." },
];

export default async function Editing() {
  const site = await getSite();
  const pairs = await getBeforeAfterPairs();
  const service = await getService("post-production");

  return (
    <>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">Post-production</p>
          <h1 className="display display-xl" style={{ maxWidth: "13ch" }}>
            The story is made in the edit.
          </h1>
          <p className="lede" style={{ marginTop: "var(--space-md)", maxWidth: "52ch" }}>
            Most studios treat post as a finishing pass. We built the studio
            around it — and we take on edits from footage we did not shoot.
          </p>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/start-a-project?service=post-production" className="btn btn-accent">
              Get an editing quote
            </Link>
            <Link href="/work" className="btn">View editing work</Link>
          </div>
        </Reveal>
      </section>

      <WaveDivider accent />

      {/* ── RAW → EDIT → GRADE → SOUND → FINAL */}
      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">The sequence</p>
          <h2 className="display display-md" style={{ maxWidth: "16ch" }}>
            Five passes, in this order.
          </h2>
        </Reveal>
        <div className="steps" style={{ marginTop: "var(--space-lg)" }}>
          {site.signature.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 70}>
              <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name display">{s.step}</p>
              <p className="step-body">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      {/* ── Real paired material, not generic claims. */}
      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Before and after</p>
          <h2 className="display display-md" style={{ maxWidth: "18ch" }}>
            Real pairs from delivered work.
          </h2>
          <p className="lede" style={{ marginTop: "var(--space-md)" }}>
            Drag the handle, or use the slider with a keyboard. Both work with
            animation switched off.
          </p>
        </Reveal>

        <div style={{ display: "grid", gap: "var(--space-xl)", marginTop: "var(--space-lg)" }}>
          {pairs.map((pair, i) => (
            <Reveal key={`${pair.projectSlug}-${i}`} delay={i * 80}>
              <BeforeAfter
                before={pair.before}
                after={pair.after}
                caption={pair.caption}
              />
              <p className="meta" style={{ marginTop: "var(--space-2xs)" }}>
                From{" "}
                <Link href={`/work/${pair.projectSlug}`} className="arrow-link">
                  {pair.projectTitle} →
                </Link>
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Capabilities</p>
          <h2 className="display display-md" style={{ maxWidth: "16ch" }}>
            What we actually do in post.
          </h2>
        </Reveal>
        <div className="grid-even" style={{ ["--cols" as string]: 3, marginTop: "var(--space-lg)" }}>
          {capabilities.map((c, i) => (
            <Reveal key={c.name} className="step" delay={i * 50}>
              <p className="step-name display">{c.name}</p>
              <p className="step-body">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Workflow</p>
          <h2 className="display display-md" style={{ maxWidth: "18ch" }}>
            Send us your footage.
          </h2>
        </Reveal>
        <div className="steps" style={{ marginTop: "var(--space-lg)" }}>
          {workflow.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 70}>
              <p className="chapter-number">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name display">{s.step}</p>
              <p className="step-body">{s.body}</p>
            </Reveal>
          ))}
        </div>

        {service && (
          <Reveal delay={200}>
            <ul className="deliverables" style={{ marginTop: "var(--space-lg)", maxWidth: "var(--measure)" }}>
              {service.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={260}>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/start-a-project?service=post-production" className="btn btn-accent">
              Send us your footage brief
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
