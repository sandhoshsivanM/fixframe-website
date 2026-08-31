// Inline SVG icon set. No icon-font, no dependency, no extra request —
// and they inherit currentColor so hover states just work.

type Props = { name: string; size?: number; className?: string };

const paths: Record<string, React.ReactNode> = {
  clapper: (
    <>
      <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <path d="m3 8 1.2-3.3a1 1 0 0 1 1.2-.6l14 3a1 1 0 0 1 .8 1.2L20 8" />
      <path d="m8 4.6-1.6 3.2M13 5.7l-1.6 3.2M18 6.8l-1.6 3.2" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.3-2h7.4L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.6" />
    </>
  ),
  drone: (
    <>
      <rect x="9" y="9" width="6" height="6" rx="1.4" />
      <path d="M9 9 5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" />
      <circle cx="4" cy="4" r="2.4" />
      <circle cx="20" cy="4" r="2.4" />
      <circle cx="4" cy="20" r="2.4" />
      <circle cx="20" cy="20" r="2.4" />
    </>
  ),
  speed: (
    <>
      <path d="M3 12h7M3 8h11M3 16h9" />
      <path d="M14 6.5 21 12l-7 5.5" />
    </>
  ),
  edit: (
    <>
      <rect x="2.5" y="4.5" width="19" height="13" rx="2" />
      <path d="M8 21h8M12 17.5V21" />
      <path d="m10.5 8.5 5 2.5-5 2.5v-5Z" />
    </>
  ),
  reels: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 3v18" />
      <path d="m13 12.5 4 2.2-4 2.2v-4.4Z" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />,
  whatsapp: (
    <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.4a8.4 8.4 0 1 1 15.4-4.5Z M8.8 8.4c.3-.7.6-.7.9-.7h.7c.2 0 .5 0 .8.6l1 2.3c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 2.8c.4.2.6.1.8-.1l.7-.8c.2-.2.4-.2.7-.1l2.2 1c.3.2.4.4.4.6 0 .5-.4 1.6-1.7 2-1.6.4-3.7-.2-6-2.3-2.4-2.2-3.4-4.5-3.2-6.1.1-.6.2-1 .2-1.2Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M15 3v8.6a3.7 3.7 0 1 1-3-3.6v2.6a1.2 1.2 0 1 0 1 1.2V3h2a4.4 4.4 0 0 0 4 4v2.3A6.7 6.7 0 0 1 15 7.4" />
  ),
  email: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  location: (
    <>
      <path d="M20 10.5c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.5" r="3" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a13 13 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
};

export function Icon({ name, size = 24, className }: Props) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {d}
    </svg>
  );
}
