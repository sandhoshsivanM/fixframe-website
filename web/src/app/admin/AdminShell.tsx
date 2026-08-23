"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";

type Me = { id: string; email: string; displayName: string; permissions: string[] };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    get<Me>("/auth/me").then((u) => { setMe(u); setChecked(true); });
  }, [path]);

  if (path === "/admin/login") return <>{children}</>;
  if (!checked) return <div className="wrap band"><p className="muted">Loading…</p></div>;
  if (!me) {
    return (
      <div className="wrap band">
        <h1 style={{ fontSize: "var(--step-2)" }}>Sign in required</h1>
        <Link href="/admin/login" className="btn btn-accent" style={{ marginTop: "1.5rem" }}>Go to sign in</Link>
      </div>
    );
  }

  // Nav is filtered by permission — presentation only; the API re-checks.
  const links: [string, string, string][] = [
    ["/admin", "Dashboard", "leads-read"],
    ["/admin/leads", "Leads", "leads-read"],
    ["/admin/projects", "Projects", "projects-read"],
    ["/admin/portfolio", "Portfolio", "portfolio-read"],
    ["/admin/rights", "Rights", "rights-read"],
    ["/admin/notifications", "Notifications", "leads-read"],
    ["/admin/audit", "Audit log", "audit-read"],
  ];

  async function signOut() {
    await post("/auth/logout", {});
    router.push("/admin/login");
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link href="/" className="brand">Fix<span>.</span>Frame</Link>
        <p className="muted" style={{ fontSize: "var(--step--1)", marginTop: "0.35rem" }}>Studio</p>
        <nav>
          {links.filter(([, , perm]) => me.permissions.includes(perm)).map(([href, label]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <div style={{ marginTop: "2rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
          <p className="soft" style={{ fontSize: "var(--step--1)", margin: 0 }}>{me.displayName}</p>
          <p className="muted" style={{ fontSize: "0.75rem", margin: "0.15rem 0 0.75rem" }}>{me.email}</p>
          <button className="btn" onClick={signOut} style={{ width: "100%" }}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
