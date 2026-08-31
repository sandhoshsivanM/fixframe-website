"use client";

import { useEffect, useRef, useState } from "react";

// Editorial reveal (B3: 700–1000ms tier). IntersectionObserver rather than a
// scroll library — no dependency, and it degrades to "just visible" when
// prefers-reduced-motion is set, which the stylesheet already enforces.
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  dataSpan,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
  /** Drives the editorial masonry column span on /work. */
  dataSpan?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Honour the OS setting directly: never even start the observer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      data-span={dataSpan}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
