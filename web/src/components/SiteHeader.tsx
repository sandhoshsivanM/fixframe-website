"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { label: string; href: string };

export function SiteHeader({
  nav,
  wordmark,
}: {
  nav: readonly NavItem[];
  wordmark: { first: string; second: string };
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation, and lock the page behind the panel while it is open.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <div className="wrap bar">
          <Link href="/" className="wordmark" aria-label={`${wordmark.first} ${wordmark.second} — home`}>
            {wordmark.first}<i>.</i>{wordmark.second}
          </Link>

          <nav className="nav-desktop" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
          </nav>

          <button
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {open && (
        <div className="nav-mobile" id="mobile-nav">
          <nav aria-label="Primary, mobile">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="display"
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="actions">
            <Link href="/start-a-project" className="btn btn-accent">Start a project</Link>
          </div>
        </div>
      )}
    </>
  );
}
