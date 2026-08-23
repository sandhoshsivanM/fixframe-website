// Poster-first rendering (V1 C01 / K1): a stable box is painted immediately;
// no video decodes on a listing page.
export function Poster({ title, vertical = false, duration }: { title: string; vertical?: boolean; duration?: number | null }) {
  return (
    <div className={vertical ? "poster vertical" : "poster"}>
      <div className="poster-fallback">{title.slice(0, 28)}</div>
      {duration ? <span className="reel-dur">{Math.round(duration)}s</span> : null}
    </div>
  );
}
