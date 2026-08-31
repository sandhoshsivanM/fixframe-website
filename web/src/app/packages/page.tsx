import Link from "next/link";
import { Heading } from "@/components/Heading";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getPackages } from "@/lib/content";

export const metadata = { title: "Packages", description: "Starting points for cinematic video projects." };

export default async function Packages() {
  const packages = await getPackages();

  if (packages.length === 0) {
    return (
      <section className="section wrap center">
        <Heading white="Every Project Is" red="Quoted Individually" size="md" />
        <Link href="/start-a-project" className="btn btn-red">Request a quote</Link>
      </section>
    );
  }

  return (
    <section className="section wrap">
      <Heading white="Packages" sub="Anchors, not limits. Most projects are scoped from a conversation." size="lg" />
      <div className="pkgs">
        {packages.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <div className="pkg" data-popular={p.popular ? "true" : undefined}>
              {p.popular && <span className="pkg-flag">Popular</span>}
              <Icon name="camera" size={30} className="pkg-ico" />
              <h3>{p.name}</h3>
              {/* A display string, never money. */}
              <p className="pkg-price">{p.displayPrice}</p>
              <ul>{p.inclusions.map((inc) => <li key={inc}>{inc}</li>)}</ul>
              {p.disclaimer && <p className="hint">{p.disclaimer}</p>}
              <Link href={`/start-a-project?package=${p.id}`} className={`btn ${p.popular ? "btn-red" : ""}`}>
                View details
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="center">
        <p className="sub-sm" style={{ marginTop: "var(--sp-md)" }}>
          Customized packages available as per your needs.
        </p>
      </Reveal>
    </section>
  );
}
