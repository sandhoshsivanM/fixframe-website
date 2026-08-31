// The wave motif. V1 B1 is explicit: "thin waveform-like paths, progress
// lines, timeline curves; NOT decorative blobs everywhere." So it appears
// only as a chapter transition — a single hairline that draws itself once.
export function WaveDivider({
  accent = false,
  animate = true,
}: {
  accent?: boolean;
  animate?: boolean;
}) {
  return (
    <svg
      className={`wave-divider ${accent ? "is-accent" : ""}`}
      data-animate={animate ? "true" : "false"}
      viewBox="0 0 1200 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ ["--len" as string]: "1300" }}
    >
      <path d="M0 14 C 100 14, 140 3, 200 3 S 300 25, 360 25 S 460 6, 520 8 S 640 22, 720 18 S 860 9, 960 12 S 1120 16, 1200 14" />
    </svg>
  );
}
