"use client";

import { useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:5180/api/v1";

/**
 * Short contact form for the homepage. Posts to the same lead endpoint as
 * the full brief — with the API stopped it says so plainly and offers email,
 * rather than pretending the message was sent.
 */
export function ContactForm({ email, responseTime }: { email: string; responseTime: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const key = useMemo(() => (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setProblem(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const mail = String(fd.get("email") ?? "").trim();
    const msg = String(fd.get("message") ?? "").trim();

    if (!name || !mail || msg.length < 10) {
      setProblem("Please fill in your name, email and a short message.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(`${API}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({
          name, email: mail, brief: msg,
          projectType: "Website enquiry",
          preferredContact: "Email",
          sourcePageUrl: window.location.href,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.reference) setDone(data.reference);
      else setProblem("couldn't-send");
    } catch {
      setProblem("couldn't-send");
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
    <form onSubmit={onSubmit} noValidate>
      {problem === "couldn't-send" ? (
        <div className="notice" style={{ marginBottom: "var(--sp-sm)" }}>
          <p style={{ marginBottom: "0.3rem" }}><strong>We couldn&rsquo;t send that.</strong></p>
          <p className="hint" style={{ margin: 0 }}>
            Please email <a href={`mailto:${email}`}>{email}</a> — your message is still here.
          </p>
        </div>
      ) : problem ? (
        <div className="notice" role="alert" style={{ marginBottom: "var(--sp-sm)" }}>
          <p style={{ margin: 0 }}>{problem}</p>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" type="text" placeholder="Your Name" required />
      </div>
      <div className="field">
        <label htmlFor="c-email">Your email</label>
        <input id="c-email" name="email" type="email" placeholder="Your Email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="c-msg">Your project</label>
        <textarea id="c-msg" name="message" placeholder="Your Project / Message" required />
      </div>

      <button className="btn btn-red" disabled={busy} style={{ width: "100%" }}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
