// Icon set. Heavier and more detailed than line icons — closer to the
// mockup, where each service reads as a recognisable object at a glance.

type Props = { name: string; size?: number; className?: string };

const icons: Record<string, React.ReactNode> = {
  // Clapperboard with striped slate
  clapper: (
    <>
      <path d="M2.5 9.5h19v9.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V9.5Z" fill="currentColor" opacity=".18" />
      <path d="M2.5 9.5h19v9.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V9.5Z" />
      <path d="M2.9 6.1 20.4 3l.7 3.9-17.5 3.1-.7-3.9Z" fill="currentColor" opacity=".35" />
      <path d="M2.9 6.1 20.4 3l.7 3.9-17.5 3.1-.7-3.9Z" />
      <path d="m7.6 4.3 1.5 3.4M12.3 3.5l1.5 3.4M17 2.7l1.5 3.4" />
      <path d="m10.2 13.4 4.6 2.4-4.6 2.4v-4.8Z" fill="currentColor" />
    </>
  ),

  // DSLR body with lens barrel
  camera: (
    <>
      <path d="M3 8.5a2 2 0 0 1 2-2h2.2l1.1-2h7.4l1.1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" fill="currentColor" opacity=".16" />
      <path d="M3 8.5a2 2 0 0 1 2-2h2.2l1.1-2h7.4l1.1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
      <circle cx="12" cy="13" r="4.2" />
      <circle cx="12" cy="13" r="1.9" fill="currentColor" />
      <circle cx="17.8" cy="9.6" r="0.8" fill="currentColor" />
    </>
  ),

  // Quadcopter — four rotors, body, camera gimbal
  drone: (
    <>
      <rect x="8.6" y="9.4" width="6.8" height="5.2" rx="1.4" fill="currentColor" opacity=".2" />
      <rect x="8.6" y="9.4" width="6.8" height="5.2" rx="1.4" />
      <path d="M8.6 10.4 5.6 6.6M15.4 10.4l3-3.8M8.6 13.6l-3 3.8M15.4 13.6l3 3.8" />
      <ellipse cx="4.6" cy="5.6" rx="2.6" ry="1.2" />
      <ellipse cx="19.4" cy="5.6" rx="2.6" ry="1.2" />
      <ellipse cx="4.6" cy="18.4" rx="2.6" ry="1.2" />
      <ellipse cx="19.4" cy="18.4" rx="2.6" ry="1.2" />
      <path d="M11 14.6v1.5h2v-1.5" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </>
  ),

  // Speed ramp — accelerating trails into a play head
  speed: (
    <>
      <path d="M2 8.5h8M2 12h11M2 15.5h6.5" opacity=".55" />
      <path d="m13.5 5.5 7.5 6.5-7.5 6.5v-13Z" fill="currentColor" opacity=".22" />
      <path d="m13.5 5.5 7.5 6.5-7.5 6.5v-13Z" />
    </>
  ),

  // Edit — monitor with a timeline strip
  edit: (
    <>
      <rect x="2" y="4" width="20" height="12.5" rx="2" fill="currentColor" opacity=".16" />
      <rect x="2" y="4" width="20" height="12.5" rx="2" />
      <path d="M8 20.5h8M12 16.5v4" />
      <path d="m10.2 7.9 4.6 2.4-4.6 2.4V7.9Z" fill="currentColor" />
      <path d="M2 13.6h20" opacity=".5" />
    </>
  ),

  // Reels — phone frame with a play head and sprockets
  reels: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2.6" fill="currentColor" opacity=".16" />
      <rect x="5" y="2.5" width="14" height="19" rx="2.6" />
      <path d="M5 7h14M5 17h14" opacity=".5" />
      <path d="m10.4 9.6 4.4 2.4-4.4 2.4V9.6Z" fill="currentColor" />
      <path d="M8 4.7h.01M8 19.3h.01M16 4.7h.01M16 19.3h.01" strokeWidth="2" />
    </>
  ),

  play: <path d="M8 5.2v13.6L19.5 12 8 5.2Z" fill="currentColor" stroke="none" />,

  whatsapp: (
    <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.4a8.4 8.4 0 1 1 15.4-4.5Z M8.8 8.4c.3-.7.6-.7.9-.7h.7c.2 0 .5 0 .8.6l1 2.3c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 2.8c.4.2.6.1.8-.1l.7-.8c.2-.2.4-.2.7-.1l2.2 1c.3.2.4.4.4.6 0 .5-.4 1.6-1.7 2-1.6.4-3.7-.2-6-2.3-2.4-2.2-3.4-4.5-3.2-6.1.1-.6.2-1 .2-1.2Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
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
  check: <path d="m4.5 12.5 5 5 10-11" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
};

export function Icon({ name, size = 24, className }: Props) {
  const d = icons[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {d}
    </svg>
  );
}
