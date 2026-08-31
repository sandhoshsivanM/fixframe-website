"use client";

import { useId, useState } from "react";
import type { MediaSlot } from "@/content/types";
import { Frame } from "./Frame";

// Raw / final comparison.
//
// V1 C01 interaction 05 and C05: the comparison must remain usable when
// motion is disabled. So the position is driven by a real range input —
// keyboard-operable, screen-reader-labelled, and working identically with
// prefers-reduced-motion set. There is no drag-only path.
export function BeforeAfter({
  before,
  after,
  caption,
  beforeLabel = "Raw",
  afterLabel = "Final",
}: {
  before: MediaSlot;
  after: MediaSlot;
  caption?: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const id = useId();

  return (
    <figure className="compare" style={{ margin: 0 }}>
      <div className="compare-stack" style={{ position: "relative" }}>
        <Frame media={before} label={beforeLabel} />
        <div className="compare-after" style={{ ["--pos" as string]: `${pos}%` }}>
          <Frame media={after} label={afterLabel} />
        </div>
        <div className="compare-handle" style={{ ["--pos" as string]: `${pos}%` }} aria-hidden="true" />
      </div>

      <label htmlFor={id} className="visually-hidden" style={{ position: "absolute", left: -9999 }}>
        Reveal the {afterLabel.toLowerCase()} grade
      </label>
      <input
        id={id}
        className="compare-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparison position — ${pos}% ${afterLabel.toLowerCase()}`}
      />

      <div className="compare-tags">
        <span>{afterLabel}</span>
        <span>{beforeLabel}</span>
      </div>

      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}
