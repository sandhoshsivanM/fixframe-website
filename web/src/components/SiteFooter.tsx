import Link from "next/link";
import { site } from "@/content/site";
import { Icon } from "./Icon";

export function SiteFooter() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div className="ftr-brand">
            <Link href="/" aria-label="Fix Frame — home">
              <span className="logo-txt">Fix<em>·</em>Frame</span>
            </Link>
            <p className="ftr-line">{site.tagline}</p>
            <p className="ftr-note">
              A creative video production studio in {site.contact.location.split(",")[0]}.
              Cinematic videos, photography, drone and editing.
            </p>
            <div className="ftr-social">
              {site.social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                  <Icon name={s.icon} size={17} />
                </a>
              ))}
            </div>
          </div>

          <div className="ftr-col">
            <h4>Explore</h4>
            <ul>
              {site.nav.slice(1, 5).map((i) => (
                <li key={i.href}><Link href={i.href}>{i.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="ftr-col">
            <h4>Services</h4>
            <ul>
              <li><Link href="/services#cinematic-videos">Cinematic Videos</Link></li>
              <li><Link href="/services#photography">Photography</Link></li>
              <li><Link href="/services#drone-shoots">Drone Shoots</Link></li>
              <li><Link href="/editing">Video Editing</Link></li>
              <li><Link href="/services#reels-social">Reels &amp; Social</Link></li>
            </ul>
          </div>

          <div className="ftr-col">
            <h4>Get in touch</h4>
            <ul>
              <li>
                <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" size={14} /> {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`}>
                  <Icon name="email" size={14} /> {site.contact.email}
                </a>
              </li>
              <li className="ftr-loc">
                <Icon name="location" size={14} /> {site.contact.location}
              </li>
            </ul>
            <Link href="/start-a-project" className="btn btn-red ftr-cta">Book a shoot</Link>
          </div>
        </div>

        <div className="ftr-base">
          <span>© {new Date().getFullYear()} Fix Frame. All Rights Reserved.</span>
          <span className="ftr-base-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>Designed with Passion <span className="heart">♥</span></span>
          </span>
        </div>
      </div>
    </footer>
  );
}
