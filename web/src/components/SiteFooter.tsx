import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <Link href="/" aria-label="Fix Frame — home">
          <span className="logo-txt">Fix<em>·</em>Frame</span>
        </Link>

        <nav className="ftr-nav" aria-label="Footer">
          {site.nav.map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
        </nav>

        <div className="ftr-legal">
          <div>© {new Date().getFullYear()} Fix Frame. All Rights Reserved.</div>
          <div style={{ marginTop: "0.2rem" }}>
            Designed with Passion <span className="red">♥</span> ·{" "}
            <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
