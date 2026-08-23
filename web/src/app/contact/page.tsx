import Link from "next/link";
import { get } from "@/lib/api";

type Settings = { settings: Record<string, string> };
export const metadata = { title: "Contact — Fix Frame" };

export default async function Contact() {
  const data = await get<Settings>("/public/settings");
  const s = data?.settings ?? {};
  // ADR-006: WhatsApp is a deep link. Nothing is sent by the system.
  const wa = s["contact.whatsapp"];

  return (
    <div className="wrap band">
      <p className="eyebrow">Get in touch</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "16ch" }}>Contact</h1>
      <p className="lede">
        Ready to brief a project? The project form gets you a faster, better answer.
        Otherwise, reach us directly.
      </p>
      <div className="actions">
        <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
      </div>

      <hr className="rule" style={{ margin: "3rem 0" }} />

      <div className="work-grid">
        <div>
          <p className="eyebrow">Email</p>
          <p className="soft"><a href={`mailto:${s["contact.email"]}`}>{s["contact.email"]}</a></p>
        </div>
        <div>
          <p className="eyebrow">Phone</p>
          <p className="soft"><a href={`tel:${s["contact.phone"]}`}>{s["contact.phone"]}</a></p>
        </div>
        {wa && (
          <div>
            <p className="eyebrow">WhatsApp</p>
            <p className="soft"><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">Message us →</a></p>
          </div>
        )}
        <div>
          <p className="eyebrow">Service area</p>
          <p className="soft">{s["contact.serviceArea"]}</p>
        </div>
        <div>
          <p className="eyebrow">Response time</p>
          <p className="soft">We reply {s["contact.responseTime"]}.</p>
        </div>
      </div>
    </div>
  );
}
