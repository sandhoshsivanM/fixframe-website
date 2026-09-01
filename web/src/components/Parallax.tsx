"use client";

import { useEffect, useRef } from "react";

/**
 * Slow-drifts hero media against the scroll so the type sits in front of a
 * moving plate. Uses transform only (compositor-friendly) and is disabled
 * entirely under prefers-reduced-motion.
 *
 * The drift carries no scale. It used to hold scale(1.12) permanently — a
 * 12% crop of the footage, applied forever, fighting the 1.02 -> 1.00
 * settle blueprint §07 asks for. The overscan the drift needs now lives in
 * the plate's own box (.parallax { inset }), so the frame is never cropped
 * and §07's settle runs unopposed.
 */
export function Parallax({ strength = 0.06, children }: { strength?: number; children: React.ReactNode }) {
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
        node.style.transform = `translate3d(0, ${rect.top * -strength}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [strength]);

  return <div ref={ref} className="parallax">{children}</div>;
}
