import Link from "next/link";
import { ClientMarquee } from "@/components/ClientMarquee";
import { ContactSection } from "@/components/ContactSection";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { PackageTabs } from "@/components/PackageTabs";
import { TeamGrid } from "@/components/TeamGrid";
import { WorkGrid } from "@/components/WorkGrid";
import {
  getCategories, getPackageGroups, getPackages, getProjects, getServices, getSite, getTeam,
} from "@/lib/content";

export default async function Home() {
  const site = await getSite();
  const services = await getServices();
  const projects = await getProjects({ limit: 6 });
  const categories = await getCategories();
  const packages = await getPackages();
  const packageGroups = await getPackageGroups();
  const team = await getTeam();

  return (
    <>
      {/* ── 1 · HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <Frame media={site.hero.media} label="Showreel" priority />
        </div>

        <div className="wrap hero-in">
          <Reveal>
            <h1 className="hero-lockup">
              {site.hero.lockup.left}<em>✕</em>{site.hero.lockup.right}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="hero-tag">
              {site.hero.tagline.a} {site.hero.tagline.b} <em>{site.hero.tagline.c}</em>
            </p>
            <p className="hero-services">{site.hero.services}</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="actions">
              <Link href="/work" className="btn btn-red">View our work</Link>
              <Link href="/start-a-project" className="btn">Book a shoot</Link>
            </div>
          </Reveal>
        </div>

        <div className="wrap hero-foot">
          <div className="socials">
            {site.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                <Icon name={s.icon} size={19} />
              </a>
            ))}
          </div>
          <div className="scroll-cue">
            <span>Scroll down</span>
            <span className="mouse" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── 2 · SHOWREEL ─────────────────────────────────────────── */}
      <section className="reel-band">
        <div className="hero-bg">
          <Frame media={site.showreel.media} label="Camera" />
        </div>
        <div className="wrap hero-in">
          <Reveal>
            <h2 className="h h-lg">
              {site.showreel.title.a}<em>{site.showreel.title.b}</em>
            </h2>
            <p className="sub">{site.showreel.line}</p>
            <Link href="/reels" className="play" aria-label="Play showreel">
              <Icon name="play" size={28} />
            </Link>
            <p className="play-label">Play showreel</p>
          </Reveal>
        </div>
      </section>

      {/* ── 3 · WHAT WE DO ───────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
        <Heading white="What" red="We Do" sub="End to End Visual Solutions" size="md" />
        <div className="cards">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <Link href={`/services#${s.slug}`} className="card" style={{ display: "block" }}>
                <Icon name={s.icon} size={34} className="card-ico" />
                <h3>{s.name}</h3>
                <p>{s.short}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="center" delay={200}>
          <div className="actions" style={{ marginTop: "var(--sp-md)" }}>
            <Link href="/services" className="btn btn-red">View all services</Link>
          </div>
        </Reveal>
        </div>
      </section>

      {/* ── 4 · FEATURED WORKS ───────────────────────────────────── */}
      <section className="section wrap">
        <Heading white="Featured" red="Works" size="md" />
        <WorkGrid projects={projects} categories={categories} />
        <Reveal className="center" delay={160}>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/work" className="btn">View all works</Link>
          </div>
        </Reveal>
      </section>

      {/* ── 5 · ABOUT ────────────────────────────────────────────── */}
      <section className="section wrap">
        <div className="split">
          <Reveal>
            <h2 className="h h-md">About<br /><em>Fix Frame</em></h2>
            <hr className="tick" />
            <p className="soft" style={{ marginTop: "var(--sp-md)", maxWidth: "46ch" }}>
              {site.about.body}
            </p>
            <p className="red" style={{ fontStyle: "italic", marginTop: "var(--sp-sm)" }}>
              {site.hero.tagline.a} {site.hero.tagline.b} {site.hero.tagline.c}
            </p>
            <div className="actions" style={{ marginTop: "var(--sp-md)" }}>
              <Link href="/about" className="btn">Know more about us</Link>
            </div>
          </Reveal>
          <Reveal className="split-media" delay={120}>
            <Frame media={site.about.media} label="Studio" />
          </Reveal>
        </div>
      </section>

      {/* ── 6 · PACKAGES ─────────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
        <Heading white="Packages" size="md" />
        <PackageTabs groups={packageGroups} packages={packages} />
        <Reveal className="center" delay={200}>
          <p className="sub-sm" style={{ marginTop: "var(--sp-md)" }}>
            Every project is scoped and quoted to the brief — these are the
            shapes we work in, not a price list.
          </p>
        </Reveal>
        </div>
      </section>

      {/* ── 7 · BEHIND THE SCENES ────────────────────────────────── */}
      <section className="section wrap">
        <Heading white="Behind The" red="Scenes" sub="This is where the magic happens." size="md" />
        <div className="strip">
          {site.bts.map((slot, i) => (
            <Reveal key={slot.seed} delay={i * 55}>
              <Frame media={slot} label="BTS" />
            </Reveal>
          ))}
        </div>
        <Reveal className="center" delay={180}>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/reels" className="btn">View BTS reel</Link>
          </div>
        </Reveal>
      </section>

      {/* ── 7b · TEAM ────────────────────────────────────────────── */}
      <section className="section wrap">
        <Heading white="Meet The" red="Team" sub="The people who shoot and cut your film — no subcontractors." size="md" />
        <TeamGrid team={team} />
      </section>

      {/* ── 8 · CLIENTS ──────────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
        <Heading white="Our" red="Clients" sub="Brands that trust us" size="md" />
        <ClientMarquee clients={site.clients} />

        <Reveal className="center" delay={200}>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/start-a-project" className="btn btn-red">Join our list</Link>
          </div>
        </Reveal>
        </div>
      </section>

      {/* ── 9 · INSTAGRAM FEED ───────────────────────────────────── */}
      <section className="section wrap">
        <Heading white="Instagram" red="Feed" sub={site.contact.instagram} size="md" />
        <div className="feed">
          {site.feed.map((f, i) => (
            <Reveal key={f.seed} delay={i * 40}>
              <a href={f.href} target="_blank" rel="noreferrer" aria-label={`View on Instagram`}>
                <Frame media={{ ratio: "1/1", seed: f.seed, src: f.src, alt: "Fix Frame on Instagram" }} />
                <Icon name="instagram" size={16} className="feed-ico" />
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal className="center" delay={200}>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <a
              href={site.social[0].href}
              target="_blank"
              rel="noreferrer"
              className="btn btn-red"
            >
              Follow us on Instagram
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── 10 · LET'S WORK TOGETHER ─────────────────────────────── */}
      <ContactSection />
    </>
  );
}
