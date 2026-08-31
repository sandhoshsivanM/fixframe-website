import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { getPackages } from "@/lib/content";

// C07 · Packages — "useful price anchoring while keeping custom-scope
// flexibility". With nothing active the route degrades to a custom quote
// rather than rendering an empty page (RULE-F11-2).

export const metadata = {
  title: "Packages",
  description: "Starting points for videography and editing projects.",
};

export default async function Packages() {
  const packages = await getPackages();

  if (packages.length === 0) {
    return (
      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Pricing</p>
          <h1 className="display display-lg" style={{ maxWidth: "16ch" }}>
            Every project is quoted individually.
          </h1>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/start-a-project" className="btn btn-accent">Request a quote</Link>
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <>
      <section className="section-sm wrap">
        <Reveal>
          <p className="eyebrow">Starting points</p>
          <h1 className="display display-lg" style={{ maxWidth: "12ch" }}>Packages</h1>
          <p className="lede" style={{ marginTop: "var(--space-md)" }}>
            Anchors, not limits. Most projects are scoped from a conversation —
            these exist so you know roughly where the conversation starts.
          </p>
        </Reveal>
      </section>

      <section className="wrap">
        <div className="pkg-grid">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.id} className="pkg" delay={i * 60}>
              <div data-emphasis={pkg.emphasis ? "true" : undefined}>
                <p className="meta">{pkg.service}</p>
                <h2 className="display">{pkg.name}</h2>
                {/* A display string, never money — RULE-F11-1. */}
                <p className="pkg-price">{pkg.displayPrice}</p>
              </div>
              <ul>
                {pkg.inclusions.map((inc) => <li key={inc}>{inc}</li>)}
              </ul>
              {pkg.disclaimer && <p className="meta">{pkg.disclaimer}</p>}
              {/* packageId travels into the brief — RULE-F11-3. */}
              <Link href={`/start-a-project?package=${pkg.id}`} className="btn btn-accent">
                Request this
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <WaveDivider />

      <section className="section wrap">
        <Reveal>
          <p className="eyebrow">Not on the list?</p>
          <h2 className="display display-md" style={{ maxWidth: "16ch" }}>
            Most of our work is scoped from scratch.
          </h2>
          <p className="lede" style={{ marginTop: "var(--space-md)" }}>
            Tell us what the film is for and we will quote it properly rather
            than fitting you into a tier.
          </p>
          <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
            <Link href="/start-a-project" className="btn btn-accent">Request a custom quote</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
