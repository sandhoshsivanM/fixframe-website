import Link from "next/link";
import { WaveDivider } from "@/components/WaveDivider";

// C13 · 404. Returns a real HTTP 404, carries noindex, and offers routes
// onward rather than dead-ending.
//
// RULE-C13-3: an unpublished or rights-lapsed project renders exactly this
// page. It must not disclose that the resource ever existed.

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="section wrap">
      <p className="eyebrow">404</p>
      <h1 className="display display-lg" style={{ maxWidth: "14ch" }}>
        That page isn&rsquo;t here.
      </h1>
      <p className="lede" style={{ marginTop: "var(--space-md)" }}>
        It may have moved, or it may never have existed. These will get you
        back on track.
      </p>

      <div className="actions" style={{ marginTop: "var(--space-lg)" }}>
        <Link href="/work" className="btn btn-accent">View the work</Link>
        <Link href="/services" className="btn">Services</Link>
        <Link href="/contact" className="btn">Contact</Link>
      </div>

      <div style={{ marginTop: "var(--space-2xl)" }}>
        <WaveDivider />
      </div>
    </section>
  );
}
