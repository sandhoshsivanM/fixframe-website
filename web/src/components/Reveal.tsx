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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${on ? "on" : ""} ${className}`}
      data-span={dataSpan}
      style={{ "--rd": `${delay}ms`, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
