import { get } from "@/lib/api";
import { LeadForm } from "./LeadForm";

type Service = { name: string; slug: string };
type Pkg = { id: string; name: string; displayPrice: string };
export const metadata = { title: "Start a project — Fix Frame" };

export default async function StartProject({ searchParams }: { searchParams: Promise<{ service?: string; package?: string; from?: string }> }) {
  const sp = await searchParams;
  const services = (await get<Service[]>("/public/services")) ?? [];
  const packages = (await get<Pkg[]>("/public/packages")) ?? [];
  const settings = await get<{ settings: Record<string, string> }>("/public/settings");

  return (
    <div className="wrap band">
      <p className="eyebrow">Project brief</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "16ch" }}>Start a project</h1>
      <p className="lede">
        Five questions. Enough for us to answer properly rather than with a price range.
      </p>
      <LeadForm
        services={services}
        packages={packages}
        preselectedService={sp.service}
        preselectedPackage={sp.package}
        sourceProjectSlug={sp.from}
        responseTime={settings?.settings["contact.responseTime"] ?? "shortly"}
      />
    </div>
  );
}
