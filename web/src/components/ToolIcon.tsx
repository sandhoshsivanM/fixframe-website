// Tool marks for the team's skill tags.
//
// These are stylised badges in the studio's own palette, not reproductions of
// the vendors' logos — enough to be recognisable at 18px while staying clearly
// our artwork rather than someone else's trademark.

type Tool = { key: string; label: string; tint: string; node: React.ReactNode };

const badge = (letters: string) => (
  <>
    <rect x="1.5" y="1.5" width="21" height="21" rx="4.5" fill="currentColor" opacity=".16" />
    <rect x="1.5" y="1.5" width="21" height="21" rx="4.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <text
      x="12" y="16.4" textAnchor="middle"
      fontSize="9.6" fontWeight="700" fill="currentColor"
      fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="-0.4"
    >
      {letters}
    </text>
  </>
);

const TOOLS: Tool[] = [
  { key: "after effects", label: "Ae", tint: "#9a7bff", node: badge("Ae") },
  { key: "premiere",      label: "Pr", tint: "#a98cff", node: badge("Pr") },
  { key: "photoshop",     label: "Ps", tint: "#4aa3ff", node: badge("Ps") },
  { key: "lightroom",     label: "Lr", tint: "#5ec2ff", node: badge("Lr") },
  {
    key: "davinci", label: "Resolve", tint: "#f0a03c",
    node: (
      <>
        <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <circle cx="12" cy="12" r="4.6" fill="currentColor" opacity=".28" />
        <circle cx="12" cy="12" r="2.1" fill="currentColor" />
        <path d="M12 2.6v3.4M12 18v3.4M2.6 12H6M18 12h3.4" stroke="currentColor" strokeWidth="1.3" />
      </>
    ),
  },
  {
    key: "capcut", label: "CapCut", tint: "#3ad6d0",
    node: (
      <>
        <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5" stroke="currentColor" strokeWidth="1.35" fill="currentColor" fillOpacity=".14" />
        <path d="M15.6 8.4a4.6 4.6 0 1 0 0 7.2" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "sony", label: "Camera", tint: "#c9c9c9",
    node: (
      <>
        <rect x="2.4" y="6.6" width="19.2" height="11.4" rx="2.2" stroke="currentColor" strokeWidth="1.35" fill="currentColor" fillOpacity=".14" />
        <circle cx="10.4" cy="12.3" r="3.4" stroke="currentColor" strokeWidth="1.3" fill="none" />
        <path d="M16.6 9.8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "gimbal", label: "Gimbal", tint: "#c9c9c9",
    node: (
      <>
        <path d="M12 3.2v6.4M8.6 21h6.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="7.4" y="9.4" width="9.2" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.35" fill="currentColor" fillOpacity=".16" />
        <path d="M12 15.4V21M6.6 6.2h10.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "drone", label: "Drone", tint: "#c9c9c9",
    node: (
      <>
        <rect x="9" y="9.4" width="6" height="5.2" rx="1.3" stroke="currentColor" strokeWidth="1.35" fill="currentColor" fillOpacity=".16" />
        <path d="M9 10.4 5.8 6.9M15 10.4l3.2-3.5M9 13.6l-3.2 3.5M15 13.6l3.2 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="4.8" cy="6" rx="2.4" ry="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="19.2" cy="6" rx="2.4" ry="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="4.8" cy="18" rx="2.4" ry="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="19.2" cy="18" rx="2.4" ry="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </>
    ),
  },
  {
    key: "lighting", label: "Lighting", tint: "#e8c15a",
    node: (
      <>
        <path d="M12 2.6v2.6M4.9 5.5l1.9 1.9M19.1 5.5l-1.9 1.9M2.6 12.4h2.6M18.8 12.4h2.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        <circle cx="12" cy="12.4" r="4.2" stroke="currentColor" strokeWidth="1.35" fill="currentColor" fillOpacity=".2" />
        <path d="M9.6 18.6h4.8l-.8 2.8h-3.2l-.8-2.8Z" stroke="currentColor" strokeWidth="1.3" fill="none" />
      </>
    ),
  },
  {
    key: "sound", label: "Sound", tint: "#6fd08c",
    node: (
      <>
        <path d="M3 12h2.4M7.4 8.2v7.6M11 5.4v13.2M14.6 8.8v6.4M18.2 6.6v10.8M21.6 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "colour", label: "Colour", tint: "#ff7a5c",
    node: (
      <>
        <circle cx="9.4" cy="10.4" r="5.4" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity=".2" />
        <circle cx="14.6" cy="13.6" r="5.4" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity=".12" />
      </>
    ),
  },
  {
    key: "direction", label: "Direction", tint: "#c9c9c9",
    node: (
      <>
        <path d="M2.9 8.5h18.2v9.6a1.8 1.8 0 0 1-1.8 1.8H4.7a1.8 1.8 0 0 1-1.8-1.8V8.5Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity=".16" />
        <path d="m3.2 5.5 16.4-2.4.6 3.2L3.8 8.7l-.6-3.2Z" stroke="currentColor" strokeWidth="1.25" fill="none" />
        <path d="m7.9 3.9 1.3 3M13 3.2l1.3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "storyboard", label: "Storyboard", tint: "#c9c9c9",
    node: (
      <>
        <rect x="2.6" y="4.4" width="8" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.25" fill="currentColor" fillOpacity=".14" />
        <rect x="13.4" y="4.4" width="8" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.25" fill="none" />
        <rect x="2.6" y="13.2" width="8" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.25" fill="none" />
        <rect x="13.4" y="13.2" width="8" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.25" fill="currentColor" fillOpacity=".14" />
      </>
    ),
  },
  {
    key: "motion", label: "Motion", tint: "#9a7bff",
    node: (
      <>
        <path d="M3 18.6c4.2 0 5-13.2 9.2-13.2S17.6 18.6 21.4 18.6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="3" cy="18.6" r="1.8" fill="currentColor" />
        <circle cx="21.4" cy="18.6" r="1.8" fill="currentColor" />
      </>
    ),
  },
  {
    key: "deliverables", label: "Deliverables", tint: "#c9c9c9",
    node: (
      <>
        <path d="M3.4 7.6 12 3.4l8.6 4.2v8.8L12 20.6l-8.6-4.2V7.6Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity=".14" />
        <path d="M3.4 7.6 12 11.8l8.6-4.2M12 11.8v8.8" stroke="currentColor" strokeWidth="1.25" />
      </>
    ),
  },
];

/** Longest key first, so "premiere pro" wins over a bare "pro". */
const ordered = [...TOOLS].sort((a, b) => b.key.length - a.key.length);

export function toolFor(skill: string) {
  const s = skill.toLowerCase();
  return ordered.find((t) => s.includes(t.key)) ?? null;
}

export function ToolIcon({ skill, size = 17 }: { skill: string; size?: number }) {
  const tool = toolFor(skill);
  if (!tool) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{ color: tool.tint, flex: "0 0 auto" }}
      aria-hidden="true" focusable="false"
    >
      {tool.node}
    </svg>
  );
}
