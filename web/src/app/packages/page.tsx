import Link from "next/link";
import { get } from "@/lib/api";

type Pkg = { id: string; name: string; displayPrice: string; inclusions: string[]; disclaimer: string | null; service: string | null };
export const metadata = { title: "Packages — Fix Frame" };

export default async function Packages() {
  const packages = (await get<Pkg[]>("/public/packages")) ?? [];
  // RULE-F11-2: with nothing active the route degrades to a custom quote.
  if (packages.length === 0) {
    return (
      <div className="wrap band">
        <h1 style={{ fontSize: "var(--step-3)" }}>Every project is quoted individually.</h1>
        <Link href="/start-a-project" className="btn btn-accent" style={{ marginTop: "2rem" }}>Request a quote</Link>
      </div>
    );
  }

  return (
    <div className="wrap band">
      <p className="eyebrow">Starting points</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "18ch" }}>Packages</h1>
      <p className="lede">Anchors, not limits. Most projects are scoped from a conversation.</p>

      <div className="pkg-grid" style={{ marginTop: "3rem" }}>
        {packages.map((p) => (
          <div key={p.id} className="pkg">
            <p className="eyebrow">{p.service}</p>
            <h3>{p.name}</h3>
            {/* displayPrice is a string, never money — RULE-F11-1 */}
            <p className="price">{p.displayPrice}</p>
            <ul>{p.inclusions.map((i) => <li key={i}>{i}</li>)}</ul>
            {p.disclaimer && <p className="muted" style={{ fontSize: "var(--step--1)", marginTop: "1rem" }}>{p.disclaimer}</p>}
            {/* packageId travels into the lead — RULE-F11-3 */}
            <Link href={`/start-a-project?package=${p.id}`} className="btn btn-accent">Request this package</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
