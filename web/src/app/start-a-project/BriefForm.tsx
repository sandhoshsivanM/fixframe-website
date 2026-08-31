"use client";

import { useMemo, useRef, useState } from "react";

type Option = { slug: string; name: string };
type Pkg = { id: string; name: string };
type FieldError = { field: string; message: string };

const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:5180/api/v1";

// C08 · the brief form.
//
// Client-side validation mirrors the server, but the server stays
// authoritative. Answers are never cleared on a failed submit — V1's
// acceptance criterion is "no data loss on validation", so the form is
// uncontrolled and only the error list re-renders.
//
// The lead endpoint is the one part of this site that genuinely needs a
// backend. With the API stopped it fails honestly and offers email instead,
// rather than pretending the brief was received.

export function BriefForm({
  services,
  packages,
  preselectedService,
  preselectedPackage,
  sourceProjectSlug,
  responseTime,
  email,
}: {
  services: Option[];
  packages: Pkg[];
  preselectedService?: string;
  preselectedPackage?: string;
  sourceProjectSlug?: string;
  responseTime: string;
  email: string;
}) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [offline, setOffline] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // ADR-003 — one key per form instance, so a double submit is one lead.
  const idempotencyKey = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
    []
  );

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    setOffline(false);

    const fd = new FormData(e.currentTarget);
    const local: FieldError[] = [];
    const name = String(fd.get("name") ?? "").trim();
    const brief = String(fd.get("brief") ?? "").trim();
    const mail = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    if (!name) local.push({ field: "name", message: "Please tell us your name." });
    if (!mail && !phone)
      local.push({ field: "email", message: "Give us an email or a phone number so we can reply." });
    if (brief.length < 20)
      local.push({ field: "brief", message: "A sentence or two about the project, please." });

    if (local.length > 0) {
      setErrors(local);
      setBusy(false);
      // Move focus to the first problem — WCAG 3.3.1.
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${local[0].field}"]`)
        ?.focus();
      return;
    }

    try {
      const res = await fetch(`${API}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          projectType: fd.get("projectType"),
          serviceId: null,
          projectDate: fd.get("projectDate") || null,
          location: fd.get("location") || null,
          brief,
          name,
          email: mail || null,
          phone: phone || null,
          preferredContact: fd.get("preferredContact"),
          packageId: fd.get("packageId") || null,
          sourceProjectSlug: sourceProjectSlug ?? null,
          sourcePageUrl: window.location.href,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.reference) setDone({ reference: data.reference });
      else if (data?.error?.details) setErrors(data.error.details);
      else setOffline(true);
    } catch {
      // The API is not running. Say so plainly.
      setOffline(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="notice notice-ok" style={{ marginTop: "var(--sp-xl)", maxWidth: 720 }}>
        <p className="crow-k">Brief received</p>
        <h2 className="h h-sm">
          Thank you — we have it.
        </h2>
        <p style={{ marginTop: "var(--sp-sm)" }}>
          Your reference is <strong>{done.reference}</strong>. We reply {responseTime}.
        </p>
        <p className="meta" style={{ margin: 0 }}>Keep the reference handy if you follow up.</p>
      </div>
    );
  }

  return (
    <form className="form" ref={formRef} onSubmit={onSubmit} noValidate style={{ marginTop: "var(--sp-xl)" }}>
      {offline && (
        <div className="notice" style={{ marginBottom: "var(--sp-lg)" }}>
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>We couldn&rsquo;t send that.</strong>
          </p>
          <p className="meta" style={{ margin: 0 }}>
            The enquiry service isn&rsquo;t reachable right now. Please email{" "}
            <a href={`mailto:${email}`}>{email}</a> and we&rsquo;ll pick it up
            from there — your answers are still on screen.
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="notice" role="alert" style={{ marginBottom: "var(--sp-lg)" }}>
          <p style={{ margin: 0 }}>
            {errors.length === 1 ? "One answer needs" : `${errors.length} answers need`} attention.
          </p>
        </div>
      )}

      <fieldset className="fieldset">
        <legend>01 — The project</legend>
        <div className="field">
          <label htmlFor="projectType">What kind of project is it?</label>
          <select id="projectType" name="projectType" defaultValue={preselectedService ?? ""}>
            <option value="">Select…</option>
            {services.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            <option value="Other">Something else</option>
          </select>
        </div>

        {packages.length > 0 && (
          <div className="field">
            <label htmlFor="packageId">A package in mind? <span className="muted">Optional</span></label>
            <select id="packageId" name="packageId" defaultValue={preselectedPackage ?? ""}>
              <option value="">No preference</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </fieldset>

      <fieldset className="fieldset">
        <legend>02 — When and where</legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="projectDate">Date <span className="muted">If you know it</span></label>
            <input id="projectDate" name="projectDate" type="date" />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" placeholder="City or venue" />
          </div>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>03 — The idea</legend>
        <div className={`field ${errorFor("brief") ? "field-error" : ""}`}>
          <label htmlFor="brief">Tell us about it *</label>
          <textarea
            id="brief"
            name="brief"
            required
            placeholder="What the film is for, who watches it, and anything you already know you want."
            aria-invalid={Boolean(errorFor("brief"))}
            aria-describedby={errorFor("brief") ? "brief-err" : undefined}
          />
          {errorFor("brief") && <p className="err" id="brief-err">{errorFor("brief")}</p>}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>04 — You</legend>
        <div className={`field ${errorFor("name") ? "field-error" : ""}`}>
          <label htmlFor="name">Your name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-invalid={Boolean(errorFor("name"))}
            aria-describedby={errorFor("name") ? "name-err" : undefined}
          />
          {errorFor("name") && <p className="err" id="name-err">{errorFor("name")}</p>}
        </div>

        <div className="field-row">
          <div className={`field ${errorFor("email") ? "field-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errorFor("email"))}
              aria-describedby={errorFor("email") ? "email-err" : undefined}
            />
            {errorFor("email") && <p className="err" id="email-err">{errorFor("email")}</p>}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
        </div>
        <p className="hint" style={{ marginTop: "-0.5rem" }}>
          Email or phone — we need one way to reach you.
        </p>

        <div className="field" style={{ marginTop: "var(--sp-md)" }}>
          <label htmlFor="preferredContact">How should we reply?</label>
          <select id="preferredContact" name="preferredContact" defaultValue="Email">
            <option value="Email">Email</option>
            <option value="Call">Call</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>
      </fieldset>

      <p className="hint">
        By sending this you agree to our <a href="/privacy">privacy policy</a>.
      </p>

      <button type="submit" className="btn btn-red" disabled={busy} style={{ marginTop: "var(--sp-sm)" }}>
        {busy ? "Sending…" : "Send project brief"}
      </button>
    </form>
  );
}
