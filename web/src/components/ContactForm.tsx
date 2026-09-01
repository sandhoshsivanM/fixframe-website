"use client";

import { useRef, useState } from "react";
import { LEAD_ENDPOINT } from "@/lib/leads";
import { Field, ErrorSummary } from "./form/Field";
import { useFieldErrors, newIdempotencyKey } from "./form/useFieldErrors";

/**
 * Short contact form. Posts to the same lead endpoint as the full enquiry —
 * with no API configured it says so plainly and offers email, rather than
 * pretending the message was sent.
 *
 * Validation is per-field and ARIA-wired, exactly as the enquiry form is.
 * This used to show one global sentence and mark nothing, which meant two
 * different validation behaviours on one site.
 */
export function ContactForm({ email, responseTime }: { email: string; responseTime: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
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
    const name = get("name");
    const mail = get("email");
    const msg = get("message");

    const problems: { field: string; message: string }[] = [];
    if (!name) problems.push({ field: "name", message: "Please tell us your name." });
    if (!mail) problems.push({ field: "email", message: "We need an email address to reply to." });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      problems.push({ field: "email", message: "That email address doesn't look right." });
    if (msg.length < 10)
      problems.push({ field: "message", message: "A sentence or two about the project, please." });

    if (problems.length > 0) {
      fail(problems);
      setBusy(false);
      return;
    }

    keyRef.current ??= newIdempotencyKey();

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
          name, email: mail, brief: msg,
          eventType: "Website enquiry",
          preferredContact: "Email",
          sourcePageUrl: window.location.href,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.reference) setDone(data.reference);
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
        <p><strong>Message sent.</strong> Reference {done}.</p>
        <p className="hint" style={{ margin: 0 }}>We reply {responseTime}.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      {offline && (
        <div className="notice notice-error" style={{ marginBottom: "var(--s4)" }}>
          <p style={{ marginBottom: "var(--s1)" }}><strong>We couldn&rsquo;t send that.</strong></p>
          <p className="hint" style={{ margin: 0 }}>
            Please email <a href={`mailto:${email}`}>{email}</a> — your message is still here.
          </p>
        </div>
      )}

      <ErrorSummary errors={errors} innerRef={summaryRef} />

      <Field id="c-name" label="Your name" error={errorFor("name")}>
        {(p) => <input {...p} name="name" type="text" autoComplete="name" />}
      </Field>
      <Field id="c-email" label="Your email" error={errorFor("email")}>
        {(p) => <input {...p} name="email" type="email" inputMode="email" autoComplete="email" />}
      </Field>
      <Field id="c-msg" label="Your project" error={errorFor("message")}>
        {(p) => <textarea {...p} name="message" />}
      </Field>

      <div className="form-actions">
        <button className="btn btn-red" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
