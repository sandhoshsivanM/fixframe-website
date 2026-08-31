import type { MediaSlot } from "@/content/types";

// Aspect-locked media frame.
//
// Given a real file it renders it. Given none it renders a *designed*
// placeholder — deterministic duotone, film grain, a light sweep and a
// timecode strip — so an unfinished site reads as intentional rather than
// broken. Every slot is named; see public/media/README.md for filenames.
//
// V1 B1: no random gradients. The gradient here is structural — it stands
// in for a frame of film, seeded from the slot so it never changes between
// renders and never repeats between projects.

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function timecode(seed: number): string {
  const m = seed % 12;
  const s = (seed >> 3) % 60;
  const f = (seed >> 7) % 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
}

export function Frame({
  media,
  label,
  priority = false,
  className = "",
  children,
}: {
  media: MediaSlot;
  /** Shown bottom-left on the placeholder. Defaults to the ratio. */
  label?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const seedText = media.seed ?? media.src ?? media.alt ?? "fixframe";
  const seed = hash(seedText);

  // Hues stay in a narrow, filmic band — teal-to-amber, the range a
  // colourist actually works in — rather than a random rainbow.
  const band = [8, 18, 28, 186, 196, 208, 214];
  const hue = band[seed % band.length];

  const style = {
    aspectRatio: media.ratio.replace("/", " / "),
    "--ph-hue": String(hue),
    "--ph-angle": `${115 + (seed % 80)}deg`,
    "--ph-x": `${18 + (seed % 55)}%`,
    "--ph-y": `${15 + ((seed >> 5) % 45)}%`,
  } as React.CSSProperties;

  return (
    <div className={`frame ${className}`} data-ratio={media.ratio} style={style}>
      {media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/media/${media.src}`}
          alt={media.alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <>
          <div className="frame-placeholder" aria-hidden="true" />
          <div className="frame-label" aria-hidden="true">
            <span className="frame-rec">{label ?? media.ratio}</span>
            <span className="frame-timecode">{timecode(seed)}</span>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
