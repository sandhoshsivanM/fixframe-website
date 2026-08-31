"use client";

import { useEffect, useRef } from "react";

/**
 * Slow-drifts hero media against the scroll so the type sits in front of a
 * moving plate. Uses transform only (compositor-friendly) and is disabled
 * entirely under prefers-reduced-motion.
 */
export function Parallax({ strength = 0.18, children }: { strength?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        node.style.transform = `translate3d(0, ${rect.top * -strength}px, 0) scale(1.12)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [strength]);

  return <div ref={ref} className="parallax">{children}</div>;
}
