import type { Metadata } from "next";
import Link from "next/link";
import { get } from "@/lib/api";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fix Frame — The story is made in the edit.",
  description: "Videography, photography and post-production. Shot and cut in-house.",
};

type Settings = { settings: Record<string, string>; nav: { reels: boolean; packages: boolean } };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await get<Settings>("/public/settings");
  const s = data?.settings ?? {};
  const nav = data?.nav ?? { reels: false, packages: false };

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap inner">
            <Link href="/" className="brand">Fix<span>.</span>Frame</Link>
            <nav className="nav">
              <Link href="/work">Work</Link>
              <Link href="/services">Services</Link>
              {/* RULE-F11-2 / RULE-C10-2: routes hide entirely when empty */}
              {nav.packages && <Link href="/packages">Packages</Link>}
              {nav.reels && <Link href="/reels">Reels</Link>}
              <Link href="/contact">Contact</Link>
              <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="wrap cols">
            <div>
              <div className="brand" style={{ marginBottom: "0.75rem" }}>Fix<span>.</span>Frame</div>
              <p>{s["studio.tagline"]}</p>
            </div>
            <div>
              <p><strong className="soft">Contact</strong></p>
              <p><a href={`mailto:${s["contact.email"]}`}>{s["contact.email"]}</a></p>
              <p><a href={`tel:${s["contact.phone"]}`}>{s["contact.phone"]}</a></p>
              <p>{s["contact.serviceArea"]}</p>
            </div>
            <div>
              <p><strong className="soft">Studio</strong></p>
              <p><Link href="/work">Work</Link></p>
              <p><Link href="/services">Services</Link></p>
              <p><Link href="/contact">Contact</Link></p>
            </div>
            <div>
              <p><strong className="soft">Legal</strong></p>
              <p><Link href="/p/privacy">Privacy</Link></p>
              <p><Link href="/p/terms">Terms</Link></p>
              <p style={{ marginTop: "1rem" }}><Link href="/admin">Studio login</Link></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
