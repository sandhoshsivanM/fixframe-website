"use client";

import { useMemo, useState } from "react";
import { post } from "@/lib/api";

type Service = { name: string; slug: string };
type Pkg = { id: string; name: string; displayPrice: string };
type FieldError = { field: string; message: string };

export function LeadForm({
  services, packages, preselectedService, preselectedPackage, sourceProjectSlug, responseTime,
}: {
  services: Service[]; packages: Pkg[];
  preselectedService?: string; preselectedPackage?: string;
  sourceProjectSlug?: string; responseTime: string;
}) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [done, setDone] = useState<{ reference: string } | null>(null);

  // ADR-003: one key per form instance, so a double submit is one lead.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const err = (f: string) => errors.find((e) => e.field === f)?.message;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    const fd = new FormData(e.currentTarget);

    const res = await post<{ reference: string; error?: { details?: FieldError[] } }>(
      "/public/leads",
      {
        projectType: fd.get("projectType"),
        projectDate: fd.get("projectDate") || null,
        location: fd.get("location") || null,
        budgetRange: fd.get("budgetRange") || null,
        brief: fd.get("brief"),
        name: fd.get("name"),
        email: fd.get("email") || null,
        phone: fd.get("phone") || null,
        preferredContact: fd.get("preferredContact"),
        packageId: fd.get("packageId") || null,
        sourceProjectSlug: sourceProjectSlug ?? null,
        sourcePageUrl: typeof window !== "undefined" ? window.location.href : null,
      },
      { "Idempotency-Key": idempotencyKey }
    );

    setBusy(false);
    if (res.ok && res.data) setDone({ reference: res.data.reference });
    // Errors keep every answer on screen — AC-C08 "no data loss on validation".
    else setErrors(res.data?.error?.details ?? [{ field: "_", message: "Something went wrong. Please try again." }]);
  }

  if (done) {
    return (
      <div className="notice ok" style={{ marginTop: "2.5rem", maxWidth: 640 }}>
        <h2 style={{ fontSize: "var(--step-1)" }}>Brief received.</h2>
        <p style={{ marginTop: "0.75rem" }}>
          Your reference is <strong>{done.reference}</strong>. We reply {responseTime}.
        </p>
        <p className="muted" style={{ fontSize: "var(--step--1)", margin: 0 }}>
          Keep the reference handy if you follow up.
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} style={{ marginTop: "2.5rem" }} noValidate>
      {err("_") && <div className="notice" style={{ marginBottom: "1.5rem" }}>{err("_")}</div>}

      <div className="field">
        <label htmlFor="projectType">What kind of project? *</label>
        <select id="projectType" name="projectType" defaultValue={preselectedService ?? ""}>
          <option value="">Select…</option>
          {services.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
          <option value="Other">Something else</option>
        </select>
      </div>

      {packages.length > 0 && (
        <div className="field">
          <label htmlFor="packageId">Package (optional)</label>
          <select id="packageId" name="packageId" defaultValue={preselectedPackage ?? ""}>
            <option value="">No preference</option>
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.displayPrice}</option>)}
          </select>
        </div>
      )}

      <div className="field">
        <label htmlFor="projectDate">Date (if you know it)</label>
        <input id="projectDate" name="projectDate" type="date" />
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <input id="location" name="location" type="text" placeholder="City or venue" />
      </div>

      <div className="field">
        <label htmlFor="budgetRange">Budget range</label>
        <select id="budgetRange" name="budgetRange" defaultValue="">
          <option value="">Select…</option>
          <option value="Under50K">Under ₹50,000</option>
          <option value="50K-1L">₹50,000 – ₹1,00,000</option>
          <option value="1L-2L">₹1,00,000 – ₹2,00,000</option>
          <option value="2L+">Above ₹2,00,000</option>
          <option value="PreferNotToSay">Prefer not to say</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="brief">Tell us about the project *</label>
        <textarea id="brief" name="brief" required aria-describedby={err("brief") ? "brief-err" : undefined} />
        {err("brief") && <p className="err" id="brief-err">{err("brief")}</p>}
      </div>

      <div className="field">
        <label htmlFor="name">Your name *</label>
        <input id="name" name="name" type="text" required aria-describedby={err("name") ? "name-err" : undefined} />
        {err("name") && <p className="err" id="name-err">{err("name")}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" aria-describedby={err("email") ? "email-err" : undefined} />
        {err("email") && <p className="err" id="email-err">{err("email")}</p>}
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" />
        <p className="muted" style={{ fontSize: "var(--step--1)", marginTop: "0.4rem" }}>
          Email or phone — we need one way to reach you.
        </p>
      </div>

      <div className="field">
        <label htmlFor="preferredContact">Preferred contact</label>
        <select id="preferredContact" name="preferredContact" defaultValue="Email">
          <option value="Email">Email</option>
          <option value="Call">Call</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
      </div>

      <p className="muted" style={{ fontSize: "var(--step--1)" }}>
        By sending this you agree to our <a href="/p/privacy">privacy policy</a>.
      </p>

      <button type="submit" className="btn btn-accent" disabled={busy}>
        {busy ? "Sending…" : "Send project brief"}
      </button>
    </form>
  );
}
