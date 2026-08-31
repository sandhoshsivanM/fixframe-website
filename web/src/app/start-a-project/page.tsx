import { Reveal } from "@/components/Reveal";
import { getPackages, getProject, getServices, getSite } from "@/lib/content";
import { BriefForm } from "./BriefForm";

// C08 · Start a Project
// "Capture a qualified brief while keeping the form easy enough to complete
// on mobile." Five grouped steps rather than one long column.

export const metadata = {
  title: "Start a project",
  description: "Send us a project brief. We reply within 24 business hours.",
};

export default async function StartProject({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; package?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const site = await getSite();
  const services = await getServices();
  const packages = await getPackages();

  // Context carried in from a case study or a package — the V1 dead-end
  // where C03/C07 passed these into a form that had no field for them.
  const sourceProject = sp.from ? await getProject(sp.from) : null;

  return (
    <section className="section-sm wrap">
      <Reveal>
        <p className="crow-k">Project brief</p>
        <h1 className="h h-lg">Book A <em>Shoot</em></h1>
        <p className="sub">
          Five short groups of questions — enough for us to answer properly
          rather than with a price range. We reply {site.contact.responseTime}.
        </p>
      </Reveal>

      {sourceProject && (
        <Reveal delay={80}>
          <div className="notice" style={{ marginTop: "var(--sp-lg)", maxWidth: 720 }}>
            <p className="meta" style={{ margin: 0 }}>
              Starting from <strong>{sourceProject.title}</strong>. We&rsquo;ll
              have that context when we read your brief.
            </p>
          </div>
        </Reveal>
      )}

      <Reveal delay={120}>
        <BriefForm
          services={services.map((s) => ({ slug: s.slug, name: s.name }))}
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            displayPrice: p.displayPrice,
          }))}
          preselectedService={sp.service}
          preselectedPackage={sp.package}
          sourceProjectSlug={sourceProject?.slug}
          responseTime={site.contact.responseTime}
          email={site.contact.email}
        />
      </Reveal>
    </section>
  );
}
