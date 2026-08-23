import Link from "next/link";

// C13 — real 404 page. Returns HTTP 404 (Next does this for notFound()),
// noindex, and offers routes onward. RULE-C13-3: an unpublished or
// rights-lapsed project renders exactly this, disclosing nothing.
export const metadata = { robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="wrap hero">
      <p className="eyebrow">404</p>
      <h1>That page isn&apos;t here.</h1>
      <p className="lede">It may have moved, or never existed. These will get you back on track.</p>
      <div className="actions">
        <Link href="/work" className="btn btn-accent">View the work</Link>
        <Link href="/services" className="btn">Services</Link>
        <Link href="/contact" className="btn">Contact</Link>
      </div>
    </div>
  );
}
