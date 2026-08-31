"use client";

import { useRef, useState } from "react";

/**
 * Continuously scrolling client logos.
 *
 * The track is rendered twice and translated by exactly -50%, so the loop is
 * seamless with no jump. Pauses on hover and on focus, and the whole
 * animation is disabled under prefers-reduced-motion — a marquee that cannot
 * be stopped is a WCAG 2.2.2 failure.
 */
export function ClientMarquee({ clients }: { clients: readonly string[] }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Two identical runs; the second is hidden from assistive tech.
  const run = (hidden: boolean) =>
    clients.map((c, i) => (
      <span className="marq-item" key={`${hidden ? "b" : "a"}-${c}-${i}`} aria-hidden={hidden || undefined}>
        {c}
      </span>
    ));

  return (
    <div
      className="marq"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="marq-track" ref={trackRef} data-paused={paused ? "true" : undefined}>
        {run(false)}
        {run(true)}
      </div>

      <button
        type="button"
        className="marq-toggle"
        onClick={() => setPaused((v) => !v)}
        aria-pressed={paused}
      >
        {paused ? "Resume" : "Pause"} logo scroll
      </button>
    </div>
  );
}
