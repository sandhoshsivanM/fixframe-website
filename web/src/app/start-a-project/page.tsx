import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getPackages, getProjects, getServices, getSite } from "@/lib/content";
import { BriefForm } from "./BriefForm";

export const metadata = {
  title: "Book a shoot",
  description: "Tell us about the project. We reply within 24 business hours.",
};

// Fully static. The preselection carried in the URL (?service=, ?package=,
// ?from=) is read on the client by BriefForm, so linking straight into a
// pre-filled brief from a service or case study still works without a
// server rendering the page.
export default async function BookAShoot() {
  const site = await getSite();
  const services = await getServices();
  const packages = await getPackages();
  const projects = await getProjects();

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

        </Reveal>

        <Reveal delay={100} className="book-form">
          <div className="panel">
            <BriefForm
              services={services.map((s) => ({ slug: s.slug, name: s.name }))}
              packages={packages.map((p) => ({ id: p.id, name: p.name }))}
              projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
              responseTime={site.contact.responseTime}
              email={site.contact.email}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
