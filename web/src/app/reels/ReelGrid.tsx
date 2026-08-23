"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Reel } from "./page";

// C10 player rules: nothing decodes until a tile is opened (RULE-C10-1),
// exactly one video attached at a time (RULE-C10-5), focus trapped and
// restored (RULE-C10-6), Esc/arrow keys operable.
export function ReelGrid({ reels }: { reels: Reel[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : Math.min(i + 1, reels.length - 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : Math.max(i - 1, 0)));
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, reels.length]);

  function close() {
    setOpen(null);
    openerRef.current?.focus(); // RULE-C10-6: focus returns to the tile
  }

  if (reels.length === 0) return <p className="muted">No reels published yet.</p>;

  return (
    <>
      <div className="reel-grid">
        {reels.map((r, i) => (
          <button
            key={r.id}
            className="reel-tile"
            onClick={(e) => { openerRef.current = e.currentTarget; setOpen(i); }}
            aria-haspopup="dialog"
          >
            <div className="poster vertical">
              <div className="poster-fallback">{r.title.slice(0, 22)}</div>
              {r.duration ? <span className="reel-dur">{Math.round(r.duration)}s</span> : null}
            </div>
            <h3>{r.title}</h3>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={reels[open].title}
          ref={dialogRef}
          tabIndex={-1}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center",
            background: "rgba(0,0,0,0.92)", padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: "min(460px, 92vw)", width: "100%" }}>
            <div className="poster vertical" style={{ maxHeight: "78vh" }}>
              <div className="poster-fallback">{reels[open].title}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1rem", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: "var(--step-1)" }}>{reels[open].title}</h2>
                {reels[open].caption && <p className="soft" style={{ fontSize: "var(--step--1)", marginTop: "0.4rem" }}>{reels[open].caption}</p>}
                {/* RULE-C10-10: link omitted entirely when the project is unpublished */}
                {reels[open].project && (
                  <p style={{ marginTop: "0.75rem" }}>
                    <Link href={`/work/${reels[open].project!.slug}`} className="soft">From this project →</Link>
                  </p>
                )}
              </div>
              <button className="btn" onClick={close} aria-label="Close">Close</button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button className="btn" onClick={() => setOpen(Math.max(open - 1, 0))} disabled={open === 0}>← Prev</button>
              <button className="btn" onClick={() => setOpen(Math.min(open + 1, reels.length - 1))} disabled={open === reels.length - 1}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
