import { Reveal } from "@/components/Reveal";
import { getReels } from "@/lib/content";
import { ReelGrid } from "./ReelGrid";

// C10 · Reels. The public destination V1 never specified — it had a Reel
// entity and an upload wizard with nowhere for them to appear.

export const metadata = {
  title: "Reels",
  description: "Short-form work, framed for vertical rather than cropped into it.",
};

export default async function Reels() {
  const reels = await getReels();

  return (
    <section className="section-sm wrap">
      <Reveal>
        <p className="eyebrow">Short-form</p>
        <h1 className="display display-lg" style={{ maxWidth: "12ch" }}>Reels</h1>
        <p className="lede" style={{ marginTop: "var(--space-md)" }}>
          Vertical cuts, storyboarded alongside the master rather than salvaged
          from it. Nothing here is a cropped 16:9.
        </p>
      </Reveal>

      <div style={{ marginTop: "var(--space-xl)" }}>
        <ReelGrid reels={reels} />
      </div>
    </section>
  );
}
