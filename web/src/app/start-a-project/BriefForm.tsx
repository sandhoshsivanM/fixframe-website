"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LEAD_ENDPOINT } from "@/lib/leads";
import { Field, ErrorSummary } from "@/components/form/Field";
import { useFieldErrors, newIdempotencyKey } from "@/components/form/useFieldErrors";

type Option = { slug: string; name: string };
type Pkg = { id: string; name: string };

// C08 · the enquiry.
//
// Field groups follow blueprint §12 — event, coverage, deliverables, you —
// in the college-event register the studio actually works in. Two departures
// from §12, both deliberate:
//
//   · NO BUDGET FIELD. §12 lists "budget range"; the studio has instructed
//     that no budget or price appears anywhere on this site, because scope
//     varies per event. That instruction wins. Pricing has already been
//     removed from this codebase once — do not reintroduce it here.
//
//   · Attribution (§12 group 6) is captured but never shown. It arrives in
//     the query string from a service page or case study.
//
// Answers are never cleared on a failed submit — V1's acceptance criterion
// is "no data loss on validation" — so the form is uncontrolled and only the
// error list re-renders.

const EVENT_TYPES = [
  "College fest",
  "Graduation / convocation",
  "Sports meet",
  "Tech symposium",
  "Cultural night",
  "Farewell",
  "Wedding",
  "Brand / commercial film",
  "Something else",
];

const COVERAGE = [
  { id: "video", label: "Video" },
  { id: "photo", label: "Photography" },
  { id: "reels", label: "Reels / vertical" },
  { id: "interviews", label: "Interviews" },
  { id: "drone", label: "Drone" },
  { id: "livestream", label: "Live stream" },
  { id: "sameday", label: "Same-day edit" },
];

type Props = {
  services: Option[];
  packages: Pkg[];
  projects: { slug: string; title: string }[];
  responseTime: string;
  email: string;
};

/**
 * The preselection (?service=, ?package=, ?from=) is read here rather than on
 * the server, so this page stays statically exportable and still supports deep
 * links. The Suspense fallback is the same form with nothing preselected —
 * the correct prerendered state, and the one a visitor without JS keeps.
 */
export function BriefForm(props: Props) {
  return (
    <Suspense fallback={<Form {...props} />}>
      <Preselected {...props} />
    </Suspense>
  );
}

function Preselected(props: Props) {
  const sp = useSearchParams();
  const from = sp.get("from") ?? undefined;
  return (
    <Form
      {...props}
      preselectedService={sp.get("service") ?? undefined}
      preselectedPackage={sp.get("package") ?? undefined}
      campaign={sp.get("utm_campaign") ?? sp.get("campaign") ?? undefined}
      sourceProject={props.projects.find((p) => p.slug === from)}
    />
  );
}

function Form({
  services,
  packages,
  preselectedService,
  preselectedPackage,
  campaign,
  sourceProject,
  responseTime,
  email,
}: Props & {
  preselectedService?: string;
  preselectedPackage?: string;
  campaign?: string;
  sourceProject?: { slug: string; title: string };
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [offline, setOffline] = useState(false);
  const { errors, errorFor, fail, clear, formRef, summaryRef } = useFieldErrors();
  const keyRef = useRef<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    clear();
    setOffline(false);

    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    const eventType = get("eventType");
    const college = get("college");
    const name = get("name");
    const mail = get("email");
    const phone = get("phone");
    const brief = get("brief");
    const coverage = COVERAGE.filter((c) => fd.get(`cov-${c.id}`)).map((c) => c.id);

    const problems: { field: string; message: string }[] = [];
    if (!eventType) problems.push({ field: "eventType", message: "Tell us what kind of event it is." });
    if (!college) problems.push({ field: "college", message: "Which college or organisation is this for?" });
    if (!name) problems.push({ field: "name", message: "Please tell us your name." });
    if (!mail && !phone)
      problems.push({ field: "phone", message: "Give us a phone number or an email so we can reply." });
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      problems.push({ field: "email", message: "That email address doesn't look right." });
    if (coverage.length === 0)
      problems.push({ field: "cov-video", message: "Pick at least one kind of coverage." });

    if (problems.length > 0) {
      fail(problems);
      setBusy(false);
      return;
    }

    // ADR-003 — one key per submission attempt, generated here rather than
    // during render (calling crypto during render is impure and React 19
    // flags it).
    keyRef.current ??= newIdempotencyKey();

    // No endpoint configured — don't pretend, and don't post at the
    // visitor's own localhost.
    if (!LEAD_ENDPOINT) {
      setOffline(true);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": keyRef.current },
        body: JSON.stringify({
          // §12 · event
          eventType, eventName: get("eventName"), eventDate: get("eventDate") || null,
          days: get("days") || null, venue: get("venue") || null, city: get("city") || null,
          audienceEstimate: get("audience") || null,
          // §12 · coverage
          coverage,
          // §12 · deliverables
          highlightLength: get("highlightLength") || null,
          reelQuantity: get("reelQuantity") || null,
          completeRecordings: Boolean(fd.get("completeRecordings")),
          photoCount: get("photoCount") || null,
          deadline: get("deadline") || null,
          // §12 · contact
          college, designation: get("designation") || null,
          name, email: mail || null, phone: phone || null,
          preferredContact: get("preferredContact"),
          brief,
          // §12 · attribution (never shown)
          serviceId: preselectedService ?? null,
          packageId: preselectedPackage ?? null,
          sourceProjectSlug: sourceProject?.slug ?? null,
          campaign: campaign ?? null,
          sourcePageUrl: window.location.href,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.reference) setDone({ reference: data.reference });
      else if (data?.error?.details) fail(data.error.details);
      else setOffline(true);
    } catch {
      setOffline(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="notice notice-ok">
        <p className="crow-k">Brief received</p>
        <p className="panel-title" style={{ marginTop: "var(--s2)" }}>
          Thank you — we have it.
        </p>
        <p>
          Your reference is <strong>{done.reference}</strong>. We reply {responseTime}.
        </p>
        <p className="hint" style={{ margin: 0 }}>Keep the reference handy if you follow up.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      {offline && (
        <div className="notice notice-error" style={{ marginBottom: "var(--s5)" }}>
          <p style={{ marginBottom: "var(--s1)" }}><strong>We couldn&rsquo;t send that.</strong></p>
          <p className="hint" style={{ margin: 0 }}>
            The enquiry service isn&rsquo;t reachable right now. Please email{" "}
            <a href={`mailto:${email}`}>{email}</a> and we&rsquo;ll pick it up from
            there — your answers are still on screen.
          </p>
        </div>
      )}

      <ErrorSummary errors={errors} innerRef={summaryRef} />

      {sourceProject && (
        <p className="hint" style={{ marginBottom: "var(--s4)" }}>
          Starting from <strong>{sourceProject.title}</strong> — we&rsquo;ll have that
          context when we read your brief.
        </p>
      )}

      {/* ── §12 · The event ────────────────────────────────────────── */}
      <fieldset className="fieldset">
        <legend>01 — The event</legend>

        <Field id="eventType" label="What kind of event is it?" error={errorFor("eventType")}>
          {(p) => (
            <select {...p} name="eventType" defaultValue="">
              <option value="">Select…</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </Field>

        <Field id="eventName" label="Event name" optional>
          {(p) => <input {...p} name="eventName" type="text" placeholder="e.g. Kalotsav 2027" />}
        </Field>

        <div className="field-row">
          <Field id="eventDate" label="Date" optional>
            {(p) => <input {...p} name="eventDate" type="date" />}
          </Field>
          <Field id="days" label="How many days?" optional>
            {(p) => <input {...p} name="days" type="number" min="1" max="30" inputMode="numeric" placeholder="1" />}
          </Field>
        </div>

        <div className="field-row">
          <Field id="venue" label="Venue" optional>
            {(p) => <input {...p} name="venue" type="text" placeholder="Auditorium, ground, campus…" />}
          </Field>
          <Field id="city" label="City" optional>
            {(p) => <input {...p} name="city" type="text" placeholder="Coimbatore" />}
          </Field>
        </div>

        <Field id="audience" label="Roughly how many people?" optional
               hint="Helps us size the crew and the audio plan.">
          {(p) => (
            <select {...p} name="audience" defaultValue="">
              <option value="">Not sure yet</option>
              <option>Under 200</option>
              <option>200 – 500</option>
              <option>500 – 1,500</option>
              <option>1,500 – 5,000</option>
              <option>Over 5,000</option>
            </select>
          )}
        </Field>
      </fieldset>

      {/* ── §12 · Coverage ─────────────────────────────────────────── */}
      <fieldset className="fieldset">
        <legend>02 — What you need covered</legend>
        {errorFor("cov-video") && <p className="err" style={{ marginTop: 0 }}>{errorFor("cov-video")}</p>}
        <ul className="checks">
          {COVERAGE.map((c) => (
            <li key={c.id}>
              <label className="check">
                <input type="checkbox" name={`cov-${c.id}`} />
                <span>{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* ── §12 · Deliverables — present for those who know, out of the
             way for those who don't. ──────────────────────────────── */}
      <details className="more">
        <summary>Add delivery detail <span className="muted">(optional)</span></summary>
        <div className="more-in">
          <div className="field-row">
            <Field id="highlightLength" label="Highlight film length" optional>
              {(p) => (
                <select {...p} name="highlightLength" defaultValue="">
                  <option value="">No preference</option>
                  <option>Under 1 minute</option>
                  <option>1 – 3 minutes</option>
                  <option>3 – 5 minutes</option>
                  <option>Over 5 minutes</option>
                </select>
              )}
            </Field>
            <Field id="reelQuantity" label="How many reels?" optional>
              {(p) => <input {...p} name="reelQuantity" type="number" min="0" max="50" inputMode="numeric" placeholder="e.g. 4" />}
            </Field>
          </div>
          <div className="field-row">
            <Field id="photoCount" label="Edited photographs" optional>
              {(p) => <input {...p} name="photoCount" type="text" placeholder="e.g. 150" />}
            </Field>
            <Field id="deadline" label="Needed by" optional>
              {(p) => <input {...p} name="deadline" type="date" />}
            </Field>
          </div>
          <label className="check">
            <input type="checkbox" name="completeRecordings" />
            <span>We also need the complete unedited recordings</span>
          </label>
        </div>
      </details>

      {/* ── §12 · Contact ──────────────────────────────────────────── */}
      <fieldset className="fieldset">
        <legend>03 — You</legend>

        <Field id="college" label="College or organisation" error={errorFor("college")}>
          {(p) => <input {...p} name="college" type="text" autoComplete="organization" />}
        </Field>

        <div className="field-row">
          <Field id="name" label="Your name" error={errorFor("name")}>
            {(p) => <input {...p} name="name" type="text" autoComplete="name" />}
          </Field>
          <Field id="designation" label="Your role" optional>
            {(p) => <input {...p} name="designation" type="text" placeholder="Secretary, HOD, organiser…" />}
          </Field>
        </div>

        <div className="field-row">
          <Field id="phone" label="Phone" error={errorFor("phone")}>
            {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" />}
          </Field>
          <Field id="email" label="Email" error={errorFor("email")}>
            {(p) => <input {...p} name="email" type="email" inputMode="email" autoComplete="email" />}
          </Field>
        </div>

        <Field id="preferredContact" label="How should we reply?">
          {(p) => (
            <select {...p} name="preferredContact" defaultValue="WhatsApp">
              <option>WhatsApp</option>
              <option>Phone call</option>
              <option>Email</option>
            </select>
          )}
        </Field>

        <Field id="brief" label="Anything else we should know?" optional
               hint="The more you tell us, the more useful our first reply is.">
          {(p) => <textarea {...p} name="brief" />}
        </Field>
      </fieldset>

      {packages.length > 0 && (
        <input type="hidden" name="packageId" defaultValue={preselectedPackage ?? ""} />
      )}
      {services.length > 0 && (
        <input type="hidden" name="serviceId" defaultValue={preselectedService ?? ""} />
      )}

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send enquiry"}
        </button>
        <p className="hint">
          We reply {responseTime}. A brief is not a booking.
        </p>
      </div>
    </form>
  );
}
