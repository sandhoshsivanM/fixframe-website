import { notFound } from "next/navigation";
import { LegalPage } from "@/components/LegalPage";
import { getPage } from "@/lib/content";

// C12 · Terms. System page — see RULE-C11-1.
export const metadata = { title: "Terms" };

export default async function Terms() {
  const page = await getPage("terms");
  if (!page) notFound();
  return <LegalPage page={page} />;
}
