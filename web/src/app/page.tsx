import Link from "next/link";
import { ClientMarquee } from "@/components/ClientMarquee";
import { BeforeAfter } from "@/components/BeforeAfter";
import { ContactSection } from "@/components/ContactSection";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Frame } from "@/components/Frame";
import { Heading } from "@/components/Heading";
import { Icon } from "@/components/Icon";
import { Parallax } from "@/components/Parallax";
import { Reveal } from "@/components/Reveal";
import {
  getBeforeAfterPairs, getPackageGroups, getProjects, getServices, getSite,
} from "@/lib/content";

// C01 · Homepage.
//
// Restructured against the design review and blueprint §09. The page used
// to run twelve sections in the same shape — dark band, condensed heading,
// one red word, card grid — which is what made it read as a template no
// matter how good any single section was.
//
// It now runs seven, and each one is composed differently: a full-bleed
// hero, a showreel band, an editorial work layout, a service row, a dark
// comparison, a light PAPER section for the process, and the enquiry.
// Team, behind-the-scenes, packages and Instagram were cut from the
// homepage entirely — blueprint §04 puts them on their own pages, and the
// review was right that they do not all need a section here.

export default async function Home() {
  const site = await getSite();
  const services = await getServices();
  const projects = await getProjects({ limit: 3 });
  const packageGroups = await getPackageGroups();
  const pairs = await getBeforeAfterPairs();
  const grade = pairs[0];

  return (
    <>
      {/* ── 1 · HERO ─────────────────────────────────────────────────
          One primary action. The old hero had two equal buttons, a
          services list, a social row and a scroll cue all competing. */}
      <section className="hero">
        <div className="hero-bg">
          <Parallax strength={0.16}>
            <Frame media={site.hero.media} label="Showreel" priority />
          </Parallax>
        </div>

        <div className="wrap hero-in">
          <Reveal>
            <h1 className="hero-headline h">
              {site.hero.headline.a}{" "}
              <em>{site.hero.headline.b}</em>{" "}
              {site.hero.headline.c}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="hero-standfirst">{site.hero.standfirst}</p>
          </Reveal>
          <Reveal delay={220}>
            <div className="actions hero-actions">
              <Link href="/reels" className="btn btn-red">
                <Icon name="play" size={16} />
                Play showreel
              </Link>
              <Link href="/start-a-project" className="btn btn-quiet">
                Start a project
              </Link>
            </div>
            <p className="hero-services">{site.hero.services}</p>
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
            <span>Scroll</span>
            <span className="mouse" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── 2 · SHOWREEL ─────────────────────────────────────────────── */}
      <section className="reel-band">
        <div className="hero-bg">
          <Parallax strength={0.1}>
            <Frame media={site.showreel.media} label="Camera" />
          </Parallax>
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

      {/* ── 3 · SELECTED WORK ────────────────────────────────────────
          Three projects, composed editorially. Blueprint §09 caps the
          homepage at six; the review argued for fewer and larger. */}
      <section className="section wrap">
        <Heading
          white="Selected"
          red="Work"
          sub="Campus films, and the wedding and brand work the crew cut its teeth on."
          size="md"
          center={false}
        />
        <FeaturedWork projects={projects} />
        <Reveal delay={160}>
          <div className="actions" style={{ marginTop: "var(--s6)" }}>
            <Link href="/work" className="btn">View the full archive</Link>
          </div>
        </Reveal>
      </section>

      {/* ── 4 · WHAT WE DO ───────────────────────────────────────────── */}
      <section className="section band">
        <div className="wrap">
          <Heading
            white="What"
            red="We Do"
            sub="One crew from the first planning call to the final master."
            size="md"
            center={false}
          />
          <div className="cards">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 60}>
                <Link href={`/services#${s.slug}`} className="card" style={{ display: "block" }}>
                  <Icon name={s.icon} size={30} className="card-ico" />
                  <h3>{s.name}</h3>
                  <p>{s.short}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="actions" style={{ marginTop: "var(--s6)" }}>
              <Link href="/services" className="btn">All services</Link>
              <Link href="/packages" className="btn btn-quiet">Compare coverage</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5 · THE EDIT ─────────────────────────────────────────────
          The review called this the strongest possible page. On the
          homepage it earns its place as one interactive proof point. */}
      {grade && (
        <section className="section wrap">
          <div className="split">
            <Reveal>
              <p className="eyebrow">The edit</p>
              <h2 className="h h-md">The film is made<br /><em>after</em> the shoot.</h2>
              <hr className="tick" />
              <p className="soft" style={{ marginTop: "var(--s4)", maxWidth: "46ch" }}>
                Everything arrives flat and unsorted. Grading, sound and the
                cut are where a day of footage becomes something worth
                sitting through. Drag the handle to see one frame before and
                after.
              </p>
              <div className="actions" style={{ marginTop: "var(--s5)" }}>
                <Link href="/editing" className="btn">How we edit</Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <BeforeAfter
                before={grade.before}
                after={grade.after}
                caption={grade.caption}
                beforeLabel="Raw"
                afterLabel="Graded"
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 6 · HOW WE WORK ──────────────────────────────────────────
          A PAPER section. Blueprint §05: long reading belongs on a warm
          light surface, and it breaks a page of identical dark panels. */}
      <section className="section paper">
        <div className="wrap">
          <Heading
            white="How It"
            red="Works"
            sub="Five steps, agreed before anyone picks up a camera."
            size="md"
            center={false}
          />
          <div className="steps">
            {site.process.map((s, i) => (
              <Reveal key={s.step} delay={i * 70}>
                <div className="step">
                  <p className="step-n">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="step-name">{s.step}</h3>
                  <p>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="actions" style={{ marginTop: "var(--s6)" }}>
              <Link href="/about" className="btn">About the crew</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 7 · CLIENTS ──────────────────────────────────────────────
          Renders only when the list holds real names (blueprint §01). */}
      {site.clients.length > 0 && (
        <section className="section band">
          <div className="wrap">
            <Heading white="Trusted By" red="Colleges" sub="Campuses we film for" size="md" />
            <ClientMarquee clients={site.clients} />
          </div>
        </section>
      )}

      {/* ── 8 · ENQUIRY ──────────────────────────────────────────────── */}
      <ContactSection />
    </>
  );
}
