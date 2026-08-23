# Part O9 · Accessibility Operations

**Status:** ACCEPTED · `UNRESOLVED-016` opened for caption sourcing
**Closes:** V1's Part K is titled "SEO, Performance, **Accessibility** & Analytics" and contains no accessibility section. Per-screen bullets require reduced motion, keyboard access, focus and alt text — with no standard, no process, no thresholds, and **no captions policy at all**, which for a video production company is the conspicuous omission.

> A studio that sells storytelling in video, publishing that video without captions, excludes deaf and hard-of-hearing viewers from the entire portfolio. It is also the accessibility failure most visible to the studio's own clients.

---

## O9.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O9-001` | A named conformance standard, applied to public and admin surfaces. |
| `REQ-O9-002` | Every published video carries captions before it can be published. |
| `REQ-O9-003` | Responsibility for supplying captions and alt text is assigned to a person, not to "the team". |
| `REQ-O9-004` | Automated checks run in CI; manual checks run on a schedule. |
| `REQ-O9-005` | Acceptance thresholds distinguish what blocks a release from what enters the backlog. |

---

## O9.2 · Standard

| Surface | Target |
|---|---|
| Public site | **WCAG 2.2 Level AA** |
| Admin | **WCAG 2.2 Level AA**, with documented exceptions |
| Email templates | Semantic HTML, plain-text alternative always |

- `RULE-O9-1` — Admin holds the same target as public. An internal tool that a partially sighted content editor cannot operate excludes people from employment, not just from browsing.
- `RULE-O9-2` — Admin exceptions are permitted for genuinely visual tasks — poster frame selection, focal-point placement, colour-grade comparison — where an equivalent non-visual path is impossible. **Each exception is recorded with a rationale and a keyboard-operable alternative for everything around it.** An undocumented exception is a defect.

---

## O9.3 · Video captions and transcripts

The part V1 omits entirely.

| Content | Requirement | Blocks publish? |
|---|---|---|
| Portfolio film with speech | **Captions required** (WCAG 1.2.2, AA) | **Yes** |
| Portfolio film, music only, no speech | Captions not required; a text description of content is required | No |
| Showreel with speech or narration | Captions required | **Yes** |
| Reel / short-form with speech | Captions required — burned-in accepted | **Yes** |
| BTS with speech | Captions required | **Yes** |
| Before/after comparison | Text labels for each side | **Yes** |
| Client review copy | Not required — internal | No |

| ID | Rule |
|---|---|
| `RULE-O9-3` | `ENT-MediaAsset` gains `hasSpeech` (tri-state: unset / yes / no) and `captionTrackId`. **Unset blocks public publish** — it must be a decision, not an omission |
| `RULE-O9-4` | Captions are a WebVTT `ENT-MediaDerivative` of kind `Captions`, stored in R2 and served through the player |
| `RULE-O9-5` | Burned-in captions satisfy short-form, where a separate track is impractical. `captionsBurnedIn` records this |
| `RULE-O9-6` | Auto-generated captions must be **reviewed before publish**. Unreviewed machine captions on client work are a quality risk as much as an accessibility one — a misheard client name is worse than no caption |
| `RULE-O9-7` | A transcript is published alongside any film over 3 minutes with substantial speech — accessibility and SEO in one artefact |
| `RULE-O9-8` | Audio description is **not** required for MVP; portfolio films are visually self-describing and dialogue-light. Recorded as a conscious decision, revisited if narration-led work is published |

### Who supplies them

| Artefact | Responsible | When |
|---|---|---|
| Captions for portfolio and showreel | **Content Editor** | Before publish; blocked by the gate |
| Captions for reels | Content Editor | Before publish |
| `altText` on public photos | Uploader, at `F04` | At upload — already required by V1 F04 |
| Transcript for long films | Content Editor | Before publish |
| Admin exception rationale | Developer | At implementation |

- `RULE-O9-9` — Responsibility sits with the **Content Editor role**, not "the studio". An unassigned obligation is an unmet one.

---

## O9.4 · Beyond captions

| Area | Requirement |
|---|---|
| Keyboard | Every interactive element reachable and operable; visible focus meeting 2.4.11; no traps. V1's pinned hero sections are the risk |
| Reduced motion | `prefers-reduced-motion` removes pinning, parallax and waveform travel (V1 B3). Comparison remains **manually operable** |
| Contrast | 4.5:1 text, 3:1 large text and UI components — against V1's `#080808` canvas and `#D61F2C` accent, which must be verified rather than assumed |
| Status colour | Never colour alone; always paired with label, icon or shape (V1 B3) |
| Media controls | Native or fully keyboard-accessible; **no autoplay with sound** (V1 C01) |
| Forms | Programmatic labels; errors linked to fields; first error focused (V1 C08) |
| Headings | One `h1` per page; no skipped levels |
| Live regions | Upload progress, save state and processing status announced |
| Target size | 24×24 CSS px minimum (2.5.8) — the focal-point editor is the risk |
| Language | `lang` declared; per-element where content differs |

- `RULE-O9-10` — The `#D61F2C` accent on `#080808` must be contrast-verified for **every** use. If it fails as body text, it is restricted to large text and non-text UI, and the design system records the restriction. This is checked in Increment 3's Part B rewrite.

---

## O9.5 · Verification

| Check | Tool | Cadence | Blocks? |
|---|---|---|---|
| Automated rules | axe-core in Playwright, every public route | Every push | **Serious/critical: yes** |
| Contrast | Automated token-pair check | Every push | Yes |
| Keyboard traversal | Scripted tab-order assertions on key journeys | Every push | Yes |
| Caption presence | Publish-gate assertion | Runtime | **Yes** |
| Screen reader | Manual — VoiceOver/Safari, NVDA/Firefox | **Quarterly** and before major release | Findings triaged |
| Zoom & reflow | Manual at 200% and 400% | Quarterly | Triaged |
| Reduced motion | Manual with the OS setting on | Every release | Yes |

- `RULE-O9-11` — Automated tooling catches roughly a third of WCAG failures. The quarterly manual pass is where the rest is found, and treating axe as sufficient is the most common way a site is declared accessible while remaining unusable.
- `RULE-O9-12` — Manual passes use a real screen reader, not a simulator.

---

## O9.6 · Thresholds

| Severity | Definition | Action |
|---|---|---|
| **Critical** | Content or function unreachable — unlabelled control, keyboard trap, missing captions | **Blocks release** |
| **Serious** | Significant barrier with a workaround — poor contrast, unclear focus | **Blocks release** |
| Moderate | Degraded experience — heading order, redundant links | Backlog, next cycle |
| Minor | Cosmetic | Backlog |

- `RULE-O9-13` — Missing captions on a speech-bearing public video is **critical** and blocks publish at runtime, not just at release. Everything else is caught in CI; this one is caught by the product itself.

---

## O9.7 · Open question

| ID | Question | Owner | Gate |
|---|---|---|---|
| `UNRESOLVED-016` | Caption sourcing — does the studio produce captions in the edit (Premiere/Resolve export), use a transcription service, or use auto-generation with human review? Determines workflow, per-video cost and the [O10](O10-cost-model.md) line. | Studio | `G07` |

The **requirement** is settled and enforced by the publish gate. `UNRESOLVED-016` decides only how the file gets made — which is a workflow question, not a specification gap.

---

## O9.8 · Acceptance criteria

- `AC-O9-1` A public video with `hasSpeech = yes` and no caption track cannot be published.
- `AC-O9-2` `hasSpeech` unset blocks publish — the decision cannot be skipped.
- `AC-O9-3` Every public route passes axe with no serious or critical violations.
- `AC-O9-4` Every journey in [O8.4](O8-testing-cicd.md) is completable by keyboard alone.
- `AC-O9-5` With reduced motion enabled, no pinning or parallax occurs and comparison stays operable.
- `AC-O9-6` Every token pair meets its contrast ratio; failures are restricted in use and recorded.
- `AC-O9-7` Every admin exception has a rationale and a documented alternative.
- `AC-O9-8` A quarterly screen-reader pass is recorded, with findings triaged.
- `AC-O9-9` Public photos without alt text cannot be published unless marked decorative.
