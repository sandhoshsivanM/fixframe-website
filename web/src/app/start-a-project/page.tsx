import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getPackages, getProject, getServices, getSite } from "@/lib/content";
import { BriefForm } from "./BriefForm";

export const metadata = {
  title: "Book a shoot",
  description: "Tell us about the project. We reply within 24 business hours.",
};

export default async function BookAShoot({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; package?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const site = await getSite();
  const services = await getServices();
  const packages = await getPackages();
  const sourceProject = sp.from ? await getProject(sp.from) : null;

  const assurances = [
    `We reply ${site.contact.responseTime}`,
    "No obligation — a brief is not a booking",
    "Quoted to your scope, not a fixed price list",
  ];

  return (
    <section className="section-sm wrap">
      <Reveal className="center">
        <h1 className="h h-lg">Book A <em>Shoot</em></h1>
        <p className="sub" style={{ marginInline: "auto" }}>
          Four short groups of questions. Enough for us to answer properly.
        </p>
        <hr className="tick" />
      </Reveal>

      {/* Two columns, so the whole form is visible without a long scroll. */}
      <div className="book">
        <Reveal className="book-aside">
          <div className="panel">
            <h2 className="h h-sm">What happens next</h2>
            <ol className="book-steps">
              <li><span>1</span> You send the brief</li>
              <li><span>2</span> We come back with a quote or questions</li>
              <li><span>3</span> We agree scope, dates and deliverables</li>
              <li><span>4</span> A retainer confirms the booking</li>
            </ol>

            <ul className="assurances">
              {assurances.map((a) => (
                <li key={a}><Icon name="check" size={15} /> {a}</li>
              ))}
            </ul>

            <div className="book-direct">
              <p className="crow-k">Prefer to talk?</p>
              <a className="crow-v" href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={15} /> {site.contact.phone}
              </a>
              <a className="crow-v" href={`mailto:${site.contact.email}`}>
                <Icon name="email" size={15} /> {site.contact.email}
              </a>
            </div>
          </div>

          {sourceProject && (
            <div className="notice" style={{ marginTop: "var(--sp-sm)" }}>
              <p className="hint" style={{ margin: 0 }}>
                Starting from <strong>{sourceProject.title}</strong> — we&rsquo;ll have
                that context when we read your brief.
              </p>
            </div>
          )}
        </Reveal>

        <Reveal delay={100} className="book-form">
          <div className="panel">
            <BriefForm
              services={services.map((s) => ({ slug: s.slug, name: s.name }))}
              packages={packages.map((p) => ({ id: p.id, name: p.name }))}
              preselectedService={sp.service}
              preselectedPackage={sp.package}
              sourceProjectSlug={sourceProject?.slug}
              responseTime={site.contact.responseTime}
              email={site.contact.email}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
