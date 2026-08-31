import Link from "next/link";
import { site } from "@/content/site";
import { WaveDivider } from "./WaveDivider";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-cta">
          <p className="eyebrow">Have a story in mind?</p>
          <h2 className="display display-md" style={{ maxWidth: "14ch" }}>
            Tell us what it&rsquo;s for.
          </h2>
          <div className="actions" style={{ marginTop: "var(--space-md)" }}>
            <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
            <Link href="/contact" className="btn">Contact the studio</Link>
          </div>
        </div>

        <WaveDivider />

        <div className="footer-cols">
          <div>
            <Link href="/" className="wordmark">
              {site.wordmark.first}<i>.</i>{site.wordmark.second}
            </Link>
            <p className="meta" style={{ marginTop: "var(--space-xs)", maxWidth: "34ch" }}>
              {site.tagline} {site.contact.serviceArea}.
            </p>
          </div>

          <div>
            <h4>Studio</h4>
            <ul>
              <li><Link href="/work">Work</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/editing">Editing</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
              <li><a href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>{site.contact.phone}</a></li>
              {/* ADR-006 — deep link. The system never sends WhatsApp messages. */}
              <li>
                <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
              <li><Link href="/contact">All contact details</Link></li>
            </ul>
          </div>

          <div>
            <h4>Elsewhere</h4>
            <ul>
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {year} {site.name}</span>
          <span style={{ display: "flex", gap: "var(--space-md)" }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
