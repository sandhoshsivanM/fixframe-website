"use client";

import Link from "next/link";
import { useState } from "react";
import type { Package } from "@/content/types";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

type Group = { slug: string; label: string };

/** Packages with the group tabs from the mockup: Cinematic Video / Speed Ramp / Delivery. */
export function PackageTabs({ groups, packages }: { groups: Group[]; packages: Package[] }) {
  const [active, setActive] = useState(groups[0]?.slug ?? "");
  const shown = packages.filter((p) => p.group === active);

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Package type">
        {groups.map((g) => (
          <button
            key={g.slug}
            role="tab"
            className="tab tab-underline"
            aria-selected={active === g.slug}
            aria-current={active === g.slug ? "true" : undefined}
            onClick={() => setActive(g.slug)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="pkgs">
        {shown.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <div className="pkg" data-popular={p.popular ? "true" : undefined}>
              {p.popular && <span className="pkg-flag">Popular</span>}
              <Icon name="camera" size={30} className="pkg-ico" />
              <h3>{p.name}</h3>
              <p className="pkg-price">{p.displayPrice}</p>
              <ul>{p.inclusions.map((inc) => <li key={inc}>{inc}</li>)}</ul>
              {p.disclaimer && <p className="hint">{p.disclaimer}</p>}
              <Link href={`/start-a-project?package=${p.id}`} className={`btn ${p.popular ? "btn-red" : ""}`}>
                View details
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
