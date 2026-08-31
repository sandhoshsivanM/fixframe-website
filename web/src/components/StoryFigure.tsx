"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Project } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";

// A featured story on the home page.
//
// V1 C01 interaction 04: "Project item hover shows muted short preview
// after intent delay." The delay matters — firing on every pass of the
// cursor would start and stop media constantly. 220ms is long enough to
// mean intent and short enough not to feel broken.
//
// Nothing decodes until that intent is established, and on touch devices
// the hover path never runs at all.
const INTENT_DELAY = 220;

export function StoryFigure({ project, index }: { project: Project; index: number }) {
  const [intent, setIntent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEnter() {
    if (window.matchMedia("(hover: none)").matches) return;
    timer.current = setTimeout(() => setIntent(true), INTENT_DELAY);
  }
  function onLeave() {
    if (timer.current) clearTimeout(timer.current);
    setIntent(false);
  }

  return (
    <Reveal className="story-wrap" as="article" delay={index * 60}>
      <Link
        href={`/work/${project.slug}`}
        className="story"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={() => setIntent(true)}
        onBlur={onLeave}
      >
        <Frame
          media={project.cover}
          label={intent ? "Preview" : project.categoryLabel}
          priority={index === 1}
        />
        <div className="story-head">
          <h3 className="display">{project.title}</h3>
          <span className="story-index">{String(index).padStart(2, "0")}</span>
        </div>
        <p className="meta">
          {project.categoryLabel} · {project.year} · {project.location}
        </p>
        <p className="story-summary">{project.summary}</p>
      </Link>
    </Reveal>
  );
}
