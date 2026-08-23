"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await post<{ error?: { message: string } }>("/auth/login", {
      email: fd.get("email"), password: fd.get("password"),
    });
    setBusy(false);
    // RULE-N3-1: one generic message, whatever the cause.
    if (res.ok) router.push("/admin");
    else setError(res.data?.error?.message ?? "Email or password is incorrect.");
  }

  return (
    <div className="wrap band" style={{ maxWidth: 420 }}>
      <p className="eyebrow">Studio</p>
      <h1 style={{ fontSize: "var(--step-2)" }}>Sign in</h1>
      <form className="form" onSubmit={onSubmit} style={{ marginTop: "2rem" }}>
        {error && <div className="notice" style={{ marginBottom: "1.5rem" }}>{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required defaultValue="owner@fixframe.local" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required defaultValue="fixframe-dev-2026" />
        </div>
        <button className="btn btn-accent" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="muted" style={{ fontSize: "var(--step--1)", marginTop: "2rem" }}>
        Local dev credentials are pre-filled. No sign-up — users are invited (Part N).
      </p>
    </div>
  );
}
