import type { MediaSlot } from "@/content/types";

// Aspect-locked media frame. Renders a real file when one exists, and a
// designed placeholder when it does not — so an unfinished site reads as
// intentional. See public/media/README.md for the filename mapping.

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
function timecode(seed: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(seed % 12)}:${pad((seed >> 3) % 60)}:${pad((seed >> 7) % 24)}`;
}

export function Frame({
  media, label, priority = false, className = "", children,
}: {
  media: MediaSlot;
  label?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const seed = hash(media.seed ?? media.src ?? media.alt ?? "fixframe");
  // Warm reds through to cool teals — the range a colourist actually works in.
  const band = [4, 10, 16, 348, 190, 200, 210];
  const style = {
    aspectRatio: media.ratio.replace("/", " / "),
    "--ph-h": String(band[seed % band.length]),
    "--ph-a": `${115 + (seed % 80)}deg`,
    "--ph-x": `${18 + (seed % 55)}%`,
    "--ph-y": `${15 + ((seed >> 5) % 45)}%`,
  } as React.CSSProperties;

  return (
    <div className={`frame ${className}`} data-ratio={media.ratio} style={style}>
      {media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/media/${media.src}`} alt={media.alt ?? ""} loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <>
          <div className="frame-ph" aria-hidden="true" />
          <div className="frame-tag" aria-hidden="true">
            <b>{label ?? media.ratio}</b>
            <span>{timecode(seed)}</span>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
