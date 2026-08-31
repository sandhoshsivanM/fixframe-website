import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <section className="section wrap center">
      <p className="crow-k">404</p>
      <h1 className="h h-xl" style={{ marginTop: "var(--sp-sm)" }}>
        That Page Isn&rsquo;t <em>Here</em>
      </h1>
      <p className="sub" style={{ marginInline: "auto" }}>
        It may have moved, or it may never have existed.
      </p>
      <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
        <Link href="/work" className="btn btn-red">View our work</Link>
        <Link href="/services" className="btn">Services</Link>
        <Link href="/contact" className="btn">Contact</Link>
      </div>
    </section>
  );
}
