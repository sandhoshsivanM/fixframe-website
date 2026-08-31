import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal className="section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display display-sm">{title}</h2>
      </div>
      {action}
    </Reveal>
  );
}
