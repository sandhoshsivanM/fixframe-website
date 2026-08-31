"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import type { Reel } from "@/content/types";

type ReelWithProject = Reel & { projectTitle?: string };

// C10 player rules:
//   RULE-C10-1  nothing decodes until a tile is opened
//   RULE-C10-5  exactly one item mounted at a time
//   RULE-C10-6  focus trapped while open, restored to the opener on close
// Arrow keys and Escape are handled; every gesture has a visible control.

export function ReelGrid({ reels }: { reels: ReelWithProject[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = () => {
    setOpen(null);
    openerRef.current?.focus();
  };

  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : Math.min(i + 1, reels.length - 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : Math.max(i - 1, 0)));

      // Focus trap.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, reels.length]);

  // Route and nav hide entirely when nothing is published — RULE-C10-2 sibling.
  if (reels.length === 0) return <p className="muted">No reels published yet.</p>;

  const current = open === null ? null : reels[open];

  return (
    <>
      <div className="reel-grid">
        {reels.map((reel, i) => (
          <button
            key={reel.id}
            className="reel-tile"
            aria-haspopup="dialog"
            onClick={(e) => { openerRef.current = e.currentTarget; setOpen(i); }}
          >
            <Frame media={reel.media} label="Play">
              <span className="reel-dur">{reel.durationSeconds}s</span>
            </Frame>
            <h3>{reel.title}</h3>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="overlay-panel" ref={panelRef} tabIndex={-1}>
            <Frame media={current.media} label={current.title} />

            <div className="overlay-bar">
              <div>
                <h2 className="h h-sm">{current.title}</h2>
                <p className="hint">{current.caption}</p>
                {/* RULE-C10-10 — omitted entirely if the project is unpublished. */}
                {current.projectSlug && (
                  <Link href={`/work/${current.projectSlug}`} className="red">
                    From {current.projectTitle} →
                  </Link>
                )}
              </div>
              <button className="btn" onClick={close}>Close</button>
            </div>

            <div className="actions" style={{ marginTop: "var(--sp-sm)" }}>
              <button className="btn" onClick={() => setOpen(Math.max(open! - 1, 0))} disabled={open === 0}>
                ← Previous
              </button>
              <button
                className="btn"
                onClick={() => setOpen(Math.min(open! + 1, reels.length - 1))}
                disabled={open === reels.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
