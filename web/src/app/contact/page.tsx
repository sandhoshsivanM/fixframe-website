import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getSite } from "@/lib/content";

// C09 · Contact. Closes V1 C06's [CONTACT] CTA, which pointed at nothing.

export const metadata = {
  title: "Contact",
  description: "Reach the studio directly, or send a project brief.",
};

export default async function Contact() {
  const site = await getSite();
  const { contact } = site;

  return (
    <>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">Get in touch</p>
          <h1 className="display display-lg" style={{ maxWidth: "13ch" }}>
            Talk to the studio.
          </h1>
          <p className="lede" style={{ marginTop: "var(--space-md)" }}>
            If you already know what you need, the project brief gets you a
            faster and more useful answer than an email will. Otherwise, reach
            us directly.
          </p>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/start-a-project" className="btn btn-accent">Send a project brief</Link>
          </div>
        </Reveal>
      </section>

      <WaveDivider accent />

      <section className="section wrap">
        <div className="grid-even" style={{ ["--cols" as string]: 3 }}>
          <Reveal className="step">
            <p className="chapter-number">Email</p>
            <p className="step-name display" style={{ fontSize: "var(--text-lg)" }}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p className="step-body">We reply {contact.responseTime}.</p>
          </Reveal>

          <Reveal className="step" delay={70}>
            <p className="chapter-number">Phone</p>
            <p className="step-name display" style={{ fontSize: "var(--text-lg)" }}>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
            </p>
            <p className="step-body">Weekdays, 10am–7pm IST.</p>
          </Reveal>

          <Reveal className="step" delay={140}>
            <p className="chapter-number">WhatsApp</p>
            <p className="step-name display" style={{ fontSize: "var(--text-lg)" }}>
              {/* ADR-006: a wa.me deep link. Nothing is sent by the system. */}
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
                Message us
              </a>
            </p>
            <p className="step-body">Opens in your own WhatsApp.</p>
          </Reveal>

          <Reveal className="step" delay={210}>
            <p className="chapter-number">Where we work</p>
            <p className="step-name display" style={{ fontSize: "var(--text-lg)" }}>
              {contact.serviceArea}
            </p>
            <p className="step-body">Travel outside the city is billed at cost.</p>
          </Reveal>

          <Reveal className="step" delay={280}>
            <p className="chapter-number">Elsewhere</p>
            <ul className="deliverables" style={{ marginTop: 0 }}>
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
