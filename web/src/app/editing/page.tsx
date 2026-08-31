import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Heading } from "@/components/Heading";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getBeforeAfterPairs, getService, getSite } from "@/lib/content";

export const metadata = {
  title: "Editing",
  description: "Offline edit, colour, sound and motion — on our footage or yours.",
};

const capabilities = [
  { icon: "edit", name: "Offline Edit", body: "Structure, pace and story. The part that decides whether the film works." },
  { icon: "camera", name: "Colour", body: "Log to delivery, graded for the room it was shot in." },
  { icon: "speed", name: "Sound", body: "Dialogue repair, design and mix. Mixed, not laid underneath." },
  { icon: "clapper", name: "Motion", body: "Titles and graphics that match the grade rather than fight it." },
  { icon: "reels", name: "Reels", body: "Vertical cutdowns framed for 9:16, storyboarded with the master." },
  { icon: "drone", name: "Long-form", body: "Documentary and event films that have to hold for twenty minutes." },
];

const workflow = [
  { step: "Receive", body: "Any format, any camera. We check it before we quote." },
  { step: "Brief", body: "What the film is for, who watches it, how long it must hold them." },
  { step: "First cut", body: "Structure only. The story has to work before anything is polished." },
  { step: "Review", body: "You watch it while it can still change." },
  { step: "Master", body: "Grade, mix, captions and every deliverable you need." },
];

export default async function Editing() {
  const site = await getSite();
  const pairs = await getBeforeAfterPairs();
  const service = await getService("video-editing");

  return (
    <>
      <section className="section-sm wrap center">
        <Reveal>
          <p className="crow-k">Post-production</p>
          <h1 className="h h-xl" style={{ marginTop: "var(--sp-sm)" }}>
            The Story Is Made<br />In The <em>Edit</em>
          </h1>
          <p className="sub" style={{ marginInline: "auto", maxWidth: "52ch" }}>
            Most studios treat post as a finishing pass. We built the studio around it —
            and we take on edits from footage we did not shoot.
          </p>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/start-a-project?service=video-editing" className="btn btn-red">Get an editing quote</Link>
            <Link href="/work" className="btn">View editing work</Link>
          </div>
        </Reveal>
      </section>

      <section className="section wrap">
        <Heading white="The" red="Sequence" sub="Five passes, in this order." size="md" />
        <div className="steps">
          {site.signature.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 60}>
              <p className="step-n">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name">{s.step}</p>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <Heading white="Before &" red="After" sub="Real pairs from delivered work. Drag the handle, or use the slider with a keyboard." size="md" />
        <div style={{ display: "grid", gap: "var(--sp-xl)" }}>
          {pairs.map((pair, i) => (
            <Reveal key={`${pair.projectSlug}-${i}`} delay={i * 70}>
              <BeforeAfter before={pair.before} after={pair.after} caption={pair.caption} />
              <p className="caption">
                From <Link href={`/work/${pair.projectSlug}`} className="red">{pair.projectTitle}</Link>
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <Heading white="What We Do" red="In Post" size="md" />
        <div className="cards">
          {capabilities.map((c, i) => (
            <Reveal key={c.name} delay={i * 55}>
              <div className="card">
                <Icon name={c.icon} size={32} className="card-ico" />
                <h3>{c.name}</h3>
                <p>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <Heading white="Send Us Your" red="Footage" size="md" />
        <div className="steps">
          {workflow.map((s, i) => (
            <Reveal key={s.step} className="step" delay={i * 60}>
              <p className="step-n">{String(i + 1).padStart(2, "0")}</p>
              <p className="step-name">{s.step}</p>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
        {service && (
          <Reveal delay={160}>
            <ul className="deliverables" style={{ marginTop: "var(--sp-lg)", maxWidth: "60ch" }}>
              {service.deliverables.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </Reveal>
        )}
        <Reveal className="center" delay={200}>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/start-a-project?service=video-editing" className="btn btn-red">Send your footage brief</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
