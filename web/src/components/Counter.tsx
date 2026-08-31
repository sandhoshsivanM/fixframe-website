"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up when it scrolls into view. Splits the value so "120+" and
 * "8 yrs" animate the number and keep their suffix. Static under reduced motion.
 */
export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr);
    const decimals = (numStr.split(".")[1] ?? "").length;

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1300;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        // easeOutExpo — fast then settles, which reads as a counter landing.
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setShown(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
        if (p < 1) requestAnimationFrame(tick);
      };
      setShown(`${prefix}0${suffix}`);
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    io.observe(node);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref}>{shown}</span>;
}
