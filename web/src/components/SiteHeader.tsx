"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { label: string; href: string };

export function SiteHeader({ nav }: { nav: readonly NavItem[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="hdr">
        <div className="wrap hdr-bar">
          <Link href="/" aria-label="Fix Frame — home">
            <span className="logo-txt">Fix<em>·</em>Frame</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            {nav.map((i) => (
              <Link key={i.href} href={i.href} aria-current={current(i.href) ? "page" : undefined}>
                {i.label}
              </Link>
            ))}
          </nav>

          <button
            className="burger"
            aria-expanded={open}
            aria-controls="drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {open && (
        <div className="drawer" id="drawer">
          <nav aria-label="Primary, mobile">
            {nav.map((i) => (
              <Link key={i.href} href={i.href} aria-current={current(i.href) ? "page" : undefined}>
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="actions" style={{ marginTop: "var(--sp-lg)" }}>
            <Link href="/start-a-project" className="btn btn-red">Book a shoot</Link>
          </div>
        </div>
      )}
    </>
  );
}
