# Part M′ · Delivery Phases, Handover & Definition of Done

**Status:** ACCEPTED
**Supersedes:** V1 M1 (phase plan), M3 (12-step handover SOP), M4 (definition of done)
**Companion:** [M′ test register](M-prime-test-cases.md)

> The [Increment 1 walkthrough](../traceability/walkthrough.md) found that publishing now carries a prerequisite V1's handover never mentioned. M3 becomes thirteen steps.

---

## M′1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-M-101` | Every delivery phase has an exit criterion and the gates that block its start. |
| `REQ-M-102` | The handover sequence matches what the system actually requires, including rights clearance. |
| `REQ-M-103` | Handover is verified by observation, not by demonstration. |
| `REQ-M-104` | The definition of done is testable, not aspirational. |

---

## M′2 · Delivery phases

V1's twelve phases, with the `UNRESOLVED` gates that block each one. A phase may not start while a gate bound to it is open ([unresolved register](../traceability/unresolved.md)).

| # | Phase | Exit criterion | Blocked by |
|---|---|---|---|
| 01 | Discovery | Signed scope; scenario chosen; placeholders resolved | `UNRESOLVED-006`, `-007`, `-008`, `-009`, `-010`, `-015` |
| 02 | UX | Wireframes approved across all 51 screens | — |
| 03 | Visual | Design tokens, type scale, grid, motion primitives approved | `UNRESOLVED-001` |
| 04 | Public Web | Staging public site complete; budgets met | — |
| 05 | Lead Engine | Lead reliably reaches the CRM; notification failure cannot lose it | `UNRESOLVED-004` |
| 06 | CRM | Workflow acceptance across leads, projects, tasks, calendar | `UNRESOLVED-002`, `-013` |
| 07 | Media CMS | Owner uploads to `Ready` and publishes without a developer | `UNRESOLVED-003`, `-011`, `-012`, `-016` |
| 08 | Portfolio CMS | Owner publishes a case study through the rights gate | — |
| 09 | Integrations | Email verified; provider webhooks authenticated | `UNRESOLVED-005` *(closed)* |
| 10 | QA | All CI gates green; manual passes recorded | — |
| 11 | Production | DNS, TLS, backups, monitoring, restore verified | — |
| 12 | Handover | Owner completes all thirteen M′3 steps unaided | `UNRESOLVED-014` |

- `RULE-M2-1` — **Phase 01 carries six gates**, more than any other. That is the correct shape: they are questions only the client and their legal advisor can answer, and every one of them is cheaper to answer before the build than after.
- `RULE-M2-2` — `UNRESOLVED-008` is a **fork, not a preference**. R2 offers EU, FedRAMP and US jurisdictions only; if India residency is mandatory, [ADR-002](../decisions/ADR-002-media-processing.md) is replaced, not adjusted. Ask it first.
- `RULE-M2-3` — Phase 12 cannot complete without `UNRESOLVED-014`. Handing a system over with nobody contracted to answer an S1 is not a handover.

---

## M′3 · Owner handover — thirteen steps

V1's twelve, with rights clearance inserted at 07 where the system actually requires it.

| # | Step | Screens | Verified by |
|---|---|---|---|
| 01 | Sign in, complete MFA, understand sessions | `N01` `N02` `N05` `N06` `N09` | `TC-011` `TC-013` |
| 02 | Upload a video from start to `Ready` | `F03` `F01` | `TC-047` `TC-053` |
| 03 | Choose and customise a thumbnail and its crops | `F05` | `TC-060` |
| 04 | Upload a photo batch and set alt text and focal points | `F04` | `TC-150` |
| 05 | Create a Raw/Final colour-grade comparison | `F06` | `TC-061` |
| 06 | Create a portfolio project and attach media | `F07` | `TC-005` |
| **07** | **Record and approve the rights checklist** | `R01` | `TC-001` `TC-002` |
| 08 | Preview desktop and mobile, then publish | `F07` | `TC-056` `TC-142` |
| 09 | Create and publish a reel | `F08` `C10` | `TC-143` |
| 10 | Review a lead, add a note, progress its status | `E02` `E03` | `TC-072` |
| 11 | Convert a Won lead to Client and Project | `E03` | `TC-067` |
| 12 | Update milestones, tasks and calendar | `E06` `E07` `E08` | `TC-065` |
| 13 | State what is backed up, what they handle, what they escalate | [O1](O1-backup-recovery.md) [O3](O3-support-boundaries.md) | `TC-098` |

- `RULE-M3-1` — Step 07 is a **step, not a footnote**. Publishing without it is impossible by design ([R3](R-publishing-rights.md)), so an owner who has not practised it will meet the gate for the first time on a real client project, read it as a bug, and ask for it to be removed.
- `RULE-M3-2` — Step 07 is practised on a **deliberately blocked** project. The owner must see `422 rights_not_cleared`, read the reason codes, resolve them, and watch the gate clear. Seeing only the success path teaches nothing about the failure they will actually encounter.
- `RULE-M3-3` — Step 13 requires the owner to **state the boundaries in their own words**, not to be told them. Recall, not exposure, is what the handover is testing.
- `RULE-M3-4` — Every step is performed **by the owner, with the trainer silent.** A step the trainer completes while narrating has verified nothing.

---

## M′4 · Verification

- `RULE-M4-1` — Handover is verified by **observation**: the owner performs, the trainer watches and records. This is `TC-076`.
- `RULE-M4-2` — A step needing intervention is **failed**, retrained and re-attempted on another day. Same-day repetition tests short-term memory.
- `RULE-M4-3` — The result is recorded per step with the date and observer. A handover with no record did not happen.
- `RULE-M4-4` — Any step the owner cannot complete after two attempts is a **product defect first**, a training gap second. That ordering matters: V1's entire premise is that a non-technical owner can operate this system.

---

## M′5 · Definition of done

Inherited from V1 M4, with the clause Increment 1 added and the evidence Increment 3 requires.

> The product is complete when a prospect can discover the studio, submit a qualified brief, the team can progress that lead into a project, and the owner can independently upload new videos, photos, thumbnails and colour-grade pairs and publish new work without touching code or deployment —
> **and every step of that path is executable with no `UNRESOLVED` on it.**

| Condition | Evidence |
|---|---|
| Every requirement has a complete chain | `check-traceability.mjs` exits 0 |
| No open `UNRESOLVED` blocks a shipped path | Register reviewed against M′2 |
| All thirteen handover steps performed unaided | `TC-076`, observed and recorded |
| Publication works end to end, including revocation | [publication walkthrough](../traceability/walkthrough-publication.md) |
| Operations recoverable and supportable | [operations walkthroughs](../traceability/walkthrough-operations.md) |
| Every CI gate green | [O8.3](O8-testing-cicd.md) |
| Performance budgets met at the chosen scenario | [O5.3](O5-performance-scale.md) |
| Accessibility thresholds met | [O9.6](O9-accessibility-operations.md) |

- `RULE-M5-1` — Done is a **conjunction**. Passing seven of eight is not done, and the eighth is invariably the one that matters at 2 a.m.

**Acceptance criteria.**
- `AC-M-1` — Every phase names its exit criterion and blocking gates.
- `AC-M-2` — The handover sequence matches the system's actual required order, rights clearance included.
- `AC-M-3` — Step 07 is practised against a blocked project, not only a clear one.
- `AC-M-4` — Handover results are recorded per step with date and observer.
- `AC-M-5` — Every condition in M′5 has a named evidence artefact.
