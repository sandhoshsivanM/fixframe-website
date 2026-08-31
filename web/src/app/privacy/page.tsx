import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getPage } from "@/lib/content";

// C11 · Privacy. A system page — it cannot be removed while the enquiry
// consent step links to it (RULE-C11-1). Copy is placeholder pending
// legal review (UNRESOLVED-015).

export const metadata = { title: "Privacy Policy" };

export default async function Privacy() {
  const page = await getPage("privacy");
  if (!page) notFound();
  return <LegalPage page={page} />;
}
