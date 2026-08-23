import Link from "next/link";
import { get } from "@/lib/api";

type Service = { name: string; slug: string; description: string; deliverables: string[] };
export const metadata = { title: "Services — Fix Frame" };

export default async function Services() {
  const services = (await get<Service[]>("/public/services")) ?? [];
  return (
    <div className="wrap band">
      <p className="eyebrow">What we do</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "18ch" }}>Services</h1>
      <p className="lede">Shot, cut, graded and delivered by the same team.</p>

      <div className="chapters" style={{ marginTop: "3rem" }}>
        {services.map((s) => (
          <div key={s.slug} className="chapter">
            <div>
              <h3>{s.name}</h3>
              <Link href={`/start-a-project?service=${s.slug}`} className="btn" style={{ marginTop: "1rem" }}>
                Get a quote
              </Link>
            </div>
            <div>
              <p className="soft">{s.description}</p>
              <ul>{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
