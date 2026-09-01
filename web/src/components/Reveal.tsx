"use client";

import { useEffect, useRef, useState } from "react";

// Scroll reveal as progressive enhancement: content is visible by default
// and the hidden start state only applies once [data-js] is set, so
// crawlers and no-JS readers always see the page.
export function Reveal({
  children, delay = 0, as: Tag = "div", className = "", dataSpan, style,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
  dataSpan?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Under reduced motion the stylesheet already forces every .reveal to
    // its resting state, so there is nothing to observe and no state to set.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
      // A pixel margin, not a percentage: -10% of viewport height means a
      // tall phone needs far more scroll to trigger than a short one, which
      // is what made the timing feel inconsistent between devices. 64px is
      // one scroll-nudge anywhere.
      //
      // threshold 0 rather than 0.06: on an element taller than the
      // viewport a 6% threshold is met by a sliver, so tall and short
      // siblings in the same group never landed together.
    }, { rootMargin: "0px 0px -64px 0px", threshold: 0 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${on ? "on" : ""} ${className}`}
      data-span={dataSpan}
      // Capped: a long stagger leaves the last item still arriving after
      // the group has been read.
      style={{ "--rd": `${Math.min(delay, 240)}ms`, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
