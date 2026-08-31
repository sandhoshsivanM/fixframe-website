import { Reveal } from "./Reveal";

/**
 * Section heading in the house style: heavy condensed caps with one word in
 * red. The two words animate in separately so the red word lands last.
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
      <h2 className={`h h-${size} wipe`}>
        <span className="wipe-a">{white}</span>
        {red && <> <em className="wipe-b">{red}</em></>}
      </h2>
      {sub && <p className="sub">{sub}</p>}
      {tick && <hr className="tick" />}
      {after}
    </Reveal>
  );
}
