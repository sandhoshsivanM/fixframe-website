import Link from "next/link";
import { Heading } from "@/components/Heading";
import { PackageTabs } from "@/components/PackageTabs";
import { Reveal } from "@/components/Reveal";
import { getPackageGroups, getPackages } from "@/lib/content";

export const metadata = { title: "Packages", description: "Starting points for cinematic video projects." };

export default async function Packages() {
  const packages = await getPackages();
  const groups = await getPackageGroups();

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
      <Heading white="Packages" sub="What each package includes. Every project is scoped and quoted to the brief." size="lg" />
      <PackageTabs groups={groups} packages={packages} />
      <Reveal className="center">
        <p className="sub-sm" style={{ marginTop: "var(--sp-md)" }}>
          Customized packages available as per your needs.
        </p>
      </Reveal>
    </section>
  );
}
