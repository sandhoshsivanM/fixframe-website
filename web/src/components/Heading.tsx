import { Reveal } from "./Reveal";

/**
 * Section heading in the studio's house style: heavy condensed caps with a
 * single word in red. Pass the red word separately rather than parsing —
 * explicit beats clever, and it keeps the markup semantic.
 */
export function Heading({
  white, red, sub, size = "md", center = true, tick = true, after,
}: {
  white: string;
  red?: string;
  sub?: string;
  size?: "sm" | "md" | "lg" | "xl";
  center?: boolean;
  tick?: boolean;
  after?: React.ReactNode;
}) {
  return (
    <Reveal className={`section-head ${center ? "center" : ""}`}>
      <h2 className={`h h-${size}`}>
        {white}
        {red && <> <em>{red}</em></>}
      </h2>
      {sub && <p className="sub">{sub}</p>}
      {tick && <hr className="tick" />}
      {after}
    </Reveal>
  );
}
