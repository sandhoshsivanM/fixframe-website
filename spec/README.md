# Fix Frame — Specification V2

**Status:** Increments 1 (P0), 2 (operations) and 3 (hardening) complete — validator passing
**Supersedes:** `fixframe_complete_product_business_technical_specification.pdf` (85pp, retained as the V1 record)

---

## Why V2 exists

V1 is a strong product and design document, but it is not *implementation-closed*. Screens describe behaviour whose underlying business rule, entity, endpoint, permission, or operational mechanism does not exist anywhere in the document. A developer working from V1 would still be making product decisions mid-build — which is precisely what an A–Z specification is supposed to prevent.

V2's contract is this:

> Every requirement must have a complete chain —
> **Requirement → Screen → Business Rule → Entity → API → Permission → Notification → State/Error → Test Case → Acceptance Criterion.**
> Anything incomplete is marked `UNRESOLVED` with a named owner and a blocking delivery gate. Nothing is silently left to the implementer.

That chain is enforced mechanically, not by review discipline. See [Traceability](#traceability).

---

## How to read this specification

| Directory | Contains |
|---|---|
| `decisions/` | Architecture Decision Records. Immutable once accepted — superseded by a new ADR, never edited in place. |
| `parts/` | The specification proper. Mirrors V1's parts 0/A–M, plus new parts N (auth), R (rights) and O1–O10 (operations). |
| `reference/` | The closed contract: entities, endpoints, permissions, notifications, events, glossary. Normative. |
| `traceability/` | The matrix and the live `UNRESOLVED` register. |
| `tools/` | `check-traceability.mjs` — the validator. |

**Precedence when documents disagree:** `reference/` > `decisions/` > `parts/`. The reference files are the normative contract; parts are the explanatory narrative around it. If a part contradicts a reference file, the reference file is correct and the part is a bug.

---

## Status legend

Every requirement, screen and rule carries exactly one status.

| Marker | Meaning |
|---|---|
| `ACCEPTED` | Fully specified. Complete traceability chain. Ready to implement. |
| `UNRESOLVED-<nnn>` | A genuine open question. Has an owner and a blocking gate. **Blocks its gate phase from starting.** |
| `DEFERRED-V1.1` / `DEFERRED-V2` | Deliberately out of MVP scope, with the replacement path documented. Not a gap. |
| `SUPERSEDED` | Replaced by a later ADR or part. Retained for history. |

`[TBD]` is **not** a valid marker in V2. V1 used it fourteen times with no owner and no gate; every one has been converted to a gated `UNRESOLVED` or resolved outright.

---

## ID scheme

Stable IDs are a prerequisite for traceability — the validator cross-references them across files.

<!-- traceability:ignore-start -->
The Example column below is illustrative — it shows the *shape* of each ID, not real citations, so this table is excluded from reference checking.

| Kind | Format | Example | Defined in |
|---|---|---|---|
| Screen | V1 codes, extended | `C07`, `E03`, `F07`, `N02`, `R01` | `parts/` |
| Requirement | `REQ-<part>-<nnn>` | `REQ-F-012` | `parts/` |
| Business rule | `RULE-<part><n>-<n>` | `RULE-A3-1` | `parts/` |
| Entity | `ENT-<Name>` | `ENT-MediaAsset` | `reference/entities.md` |
| Endpoint | `API-<resource>-<action>` | `API-lead-create` | `reference/api.md` |
| Permission | `PERM-<module>-<action>` | `PERM-media-publish` | `reference/permissions.md` |
| Notification | `NTF-<nnn>` | `NTF-004` | `reference/notifications.md` |
| Analytics event | `EVT-<name>` | `EVT-lead-success` | `reference/events.md` |
| Test case | `TC-<nnn>` | `TC-113` | `parts/M-*.md` |
| Acceptance criterion | `AC-<screen>-<n>` | `AC-C07-1` | `parts/` |
| Open question | `UNRESOLVED-<nnn>` | `UNRESOLVED-007` | `traceability/unresolved.md` |
<!-- traceability:ignore-end -->

IDs are permanent. A retired ID is marked `SUPERSEDED` in place and never reassigned.

Screens are registered in [reference/screens.md](reference/screens.md), which is the authority the validator checks the matrix's Screen column against.

---

## Traceability

`traceability/matrix.md` holds one row per requirement, with one column per link in the chain.

Cell conventions — the validator depends on these:

| Cell value | Meaning |
|---|---|
| One or more IDs, comma-separated | The chain link is satisfied. Every ID must resolve. |
| `—` (em dash) | Genuinely not applicable to this requirement. A deliberate assertion, not a blank. |
| `UNRESOLVED-<nnn>` | Known gap. Must appear in the register with an owner and a gate. |
| *(empty)* | **Validation failure.** Never permitted. |

Run the validator:

```bash
node spec/tools/check-traceability.mjs
```

It exits non-zero on:

1. **Dangling reference** — an ID cited in the matrix that no reference file defines.
2. **Silent gap** — an empty cell, or a chain link left blank without either `—` or an `UNRESOLVED` reference.
3. **Ungated unknown** — an `UNRESOLVED` entry missing an owner or a blocking gate.

Rule 3 is the important one. It is what stops `UNRESOLVED` from decaying into the new `[TBD]`: every open question is bound to the delivery phase that cannot begin until it closes, so the cost of leaving it open is visible on the schedule rather than buried in prose.

### Declaration syntax

Every ID is **declared** in exactly one mechanical position and **referenced** everywhere else. The two are syntactically distinct, so a typo can never define itself.

A declaration is the ID as the **first backticked token on its line**, after an optional list bullet or table pipe:

```markdown
- `RULE-O1-4` — Layer 3 exists solely for the case Layers 1 and 2 do not cover.
| `RULE-R3-1` | The gate is evaluated server-side, in the publish transaction. |
- `AC-O1-1` — A restore to an arbitrary point within the PITR window succeeds inside RTO.
```

Anything else — mid-sentence, in prose, in a "Discharges" column — is a reference and must resolve against a declaration elsewhere.

Normalised in Increment 3. Tightening the validator to enforce it immediately found three rules declared mid-sentence (`RULE-H3-1`, `RULE-G4-5`, `RULE-G5-1`) that the previous loose scope had silently accepted — which is the argument for the change in one line.

### Ignore blocks


`<!-- traceability:ignore-start -->` … `<!-- traceability:ignore-end -->` excludes a region from reference checking. It exists for text showing ID *formats* rather than citing real IDs — the scheme table above is the only current use. An ignore block hides dangling references, so it should cover illustrative text and nothing else.

### Verification artefacts

- [traceability/matrix.md](traceability/matrix.md) §6 — the V1 contradiction re-test, which is Increment 1's acceptance test.
- [traceability/walkthrough.md](traceability/walkthrough.md) — V1's M3 handover traced end to end through V2.
- [traceability/walkthrough-operations.md](traceability/walkthrough-operations.md) — two operational flows traced end to end. Found five defects in the seams between documents that cross-reference validation could not see.
- [traceability/walkthrough-publication.md](traceability/walkthrough-publication.md) — publication and revocation traced end to end across rights, media, CMS, public surfaces, caching and audit. Found two more, both on the removal side.

---

## Blocking gates

`UNRESOLVED` entries bind to V1's Part M1 delivery phases. A phase may not start while an entry gated on it is open.

| Gate | Phase |
|---|---|
| `G01` | Discovery |
| `G02` | UX |
| `G03` | Visual |
| `G04` | Public Web |
| `G05` | Lead Engine |
| `G06` | CRM |
| `G07` | Media CMS |
| `G08` | Portfolio CMS |
| `G09` | Integrations |
| `G10` | QA |
| `G11` | Production |
| `G12` | Handover |

---

## Increment plan

| Increment | Scope | Status |
|---|---|---|
| **1 — P0** | ADRs; publishing rights; complete CMS; auth & administration; closed entity/API contract; media processing contract; MVP client review; traceability skeleton | **Complete** |
| **2 — P1** | Part O — backup & DR, observability & incidents, support boundaries, notification architecture, scale & performance budgets, security operations, data lifecycle, testing & CI, accessibility operations, calculated cost model | **Complete** |
| **3** | Part C′ (public screens C09–C13, incl. Reels); Part M′ (13-step handover, rights-gated); normalised `RULE-`/`AC-` declaration syntax; rights scope and block reasons; operator commands; three-way authority chain | **Complete** |
| **4** | Remaining V1 part rewrites — B (grid, type scale, spacing, breakpoints), K (accessibility section), and 0/A/D/E/L absorbed into V2 structure | Not started |

Increment 2 added **no product features** by design. Its job was to make the existing product operable, recoverable, measurable and supportable.

---

## Definition of done (inherited from V1 M4)

> The product is complete when a prospect can discover the studio, submit a qualified brief, the team can progress that lead into a project, and the owner can independently upload new videos/photos/thumbnails/colour-grade pairs and publish new work without touching code or deployment.

V2 adds one clause: **and every step of that path is executable with no `UNRESOLVED` on it.**
