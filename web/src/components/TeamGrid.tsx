import type { TeamMember } from "@/content/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";
import { ToolIcon } from "./ToolIcon";

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="team">
      {team.map((m, i) => (
        <Reveal key={m.name} delay={i * 80} className="member">
          <div className="member-media">
            <Frame media={m.portrait} label={m.role} />
            <span className="member-scrim" aria-hidden="true" />
          </div>
          <h3 className="member-name">{m.name}</h3>
          <p className="member-role">{m.role}</p>
          {m.bio && <p className="member-bio">{m.bio}</p>}
          <ul className="skills">
            {m.skills.map((s) => (
              <li key={s}>
                <ToolIcon skill={s} size={15} />
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
