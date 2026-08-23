import { get } from "@/lib/api";
import { ReelGrid } from "./ReelGrid";

export const metadata = { title: "Reels — Fix Frame" };
export type Reel = {
  id: string; title: string; caption: string | null; poster: string | null;
  duration: number | null; externalUrl: string | null;
  project: { slug: string; title: string } | null;
};

export default async function Reels() {
  const reels = (await get<Reel[]>("/public/reels")) ?? [];
  return (
    <div className="wrap band">
      <p className="eyebrow">Short-form</p>
      <h1 style={{ fontSize: "var(--step-3)", maxWidth: "16ch" }}>Reels</h1>
      <p className="lede">Vertical cuts, built alongside the master rather than salvaged from it.</p>
      <div style={{ marginTop: "2.5rem" }}><ReelGrid reels={reels} /></div>
    </div>
  );
}
