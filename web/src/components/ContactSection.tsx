import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { Heading } from "./Heading";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

const rows = [
  { icon: "whatsapp", k: "WhatsApp", v: site.contact.phone, href: `https://wa.me/${site.contact.whatsapp}` },
  { icon: "instagram", k: "Instagram", v: site.contact.instagram, href: site.social[0].href },
  { icon: "email", k: "Email", v: site.contact.email, href: `mailto:${site.contact.email}` },
  { icon: "location", k: "Location", v: site.contact.location },
];

export function ContactSection({ asPageTitle = false }: { asPageTitle?: boolean }) {
  return (
    <section className="section wrap" id="contact">
      <Heading
        as={asPageTitle ? "h1" : "h2"}
        white="Let's Work"
        red="Together"
        sub="Have a project in mind? Let's create something amazing."
        size="md"
        center={false}
      />

      <div className="contact">
        <Reveal className="contact-rows">
          {rows.map((r) => (
            <div className="crow" key={r.k}>
              <span className="crow-ico"><Icon name={r.icon} size={17} /></span>
              <span>
                <span className="crow-k">{r.k}</span>
                <br />
                {r.href ? (
                  <a className="crow-v" href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {r.v}
                  </a>
                ) : (
                  <span className="crow-v">{r.v}</span>
                )}
              </span>
            </div>
          ))}
        </Reveal>

        <Reveal delay={120}>
          <div className="panel">
            <ContactForm email={site.contact.email} responseTime={site.contact.responseTime} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
