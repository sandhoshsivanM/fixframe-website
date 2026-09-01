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
      {/* Raw sits left, graded right — the direction people read a
          transformation in. The graded frame is the base layer and the raw
          one is clipped over it from the left edge, so the divider reveals
          the finished image as it travels left. */}
      <div className="compare-stack" style={{ position: "relative" }}>
        <Frame media={after} label={afterLabel} />
        <div className="compare-before" style={{ ["--pos" as string]: `${pos}%` }}>
          <Frame media={before} label={beforeLabel} />
        </div>
        <div className="compare-handle" style={{ ["--pos" as string]: `${pos}%` }} aria-hidden="true" />
      </div>

      <label htmlFor={id} className="visually-hidden">
        Move the divider between {beforeLabel.toLowerCase()} and {afterLabel.toLowerCase()}
      </label>
      <input
        id={id}
        className="compare-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparison divider — ${pos}% ${beforeLabel.toLowerCase()}, ${100 - pos}% ${afterLabel.toLowerCase()}`}
      />

      <div className="compare-tags">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>

      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}
