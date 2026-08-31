import type { TeamMember } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="team">
      {team.map((m, i) => (
        <Reveal key={m.role} delay={i * 70} className="member">
          <div className="member-media">
            <Frame media={m.portrait} label={m.role} />
          </div>
          <h3 className="member-name">{m.name}</h3>
          <p className="member-role">{m.role}</p>
          <p className="member-bio">{m.bio}</p>
          <ul className="skills">
            {m.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
