# Walkthrough test — V1 M3 owner handover

**Purpose.** V1's Part M4 defines done as the owner operating the system unaided. Its Part M3 lists the twelve steps that proves. This traces each step through Specification V2 and asks one question: **can a non-technical owner complete it, with no `UNRESOLVED` on the path?**

This is the acceptance evidence for Increment 1. Executed manually as `TC-076` once the system is built; executed here on paper against the specification.

`✅` reachable · `⚠️` reachable with a caveat · `❌` blocked

---

| # | M3 step | Path through V2 | Verdict |
|---|---|---|---|
| 01 | Login and MFA/session basics | `N01` → `N02` → `N05`, `N06`, `N09`. **In V1 this step had no screen at all.** | ✅ |
| 02 | Upload a new video from start to `Ready` | `F03` wizard → `API-media-upload-session` → direct upload → `API-media-complete` → Part H′ pipeline → `Ready`. Failure surfaces on `F01` with a retry that preserves metadata (`RULE-H4-4`) | ✅ |
| 03 | Select/customise thumbnail and crops | `F05`, `API-media-poster-candidates`, `API-media-poster-set` | ✅ |
| 04 | Upload a batch of photos, fix alt and focal data | `F04`, per-image review, `ENT-MediaDerivative.focalPoint`. Alt text required for public photos | ✅ |
| 05 | Create a Raw/Final colour-grade comparison | `F06`, `ENT-BeforeAfterPair`, `API-beforeafter-create` | ✅ |
| 06 | Create a portfolio project and attach media | `F07`, `ENT-PortfolioProject`, `ENT-ProjectBlock`, `API-portfolio-blocks-set` | ✅ |
| 07 | Preview desktop/mobile and publish | `API-portfolio-preview-token` → `API-portfolio-publish`. **Now additionally gated by `R01` rights clearance** | ⚠️ see note 1 |
| 08 | Create and publish a reel | `F08`, `ENT-Reel`, `API-reel-publish`. Public surface `C10` is Increment 3 | ⚠️ see note 2 |
| 09 | Review a lead, add a note, progress status | `E02` → `E03`, `ENT-Note`, `API-lead-status`. `ENT-Note` did not exist in V1 | ✅ |
| 10 | Convert a Won lead into Client + Project | `API-lead-convert`, Part G′6, idempotent per [ADR-003](../decisions/ADR-003-idempotency.md) | ✅ |
| 11 | Update milestones, tasks and calendar | `E06`, `E07`, `E08`. `ENT-Milestone` did not exist in V1 | ✅ |
| 12 | Understand backups, support, and what needs a developer | [O1](../parts/O1-backup-recovery.md) backups · [O3](../parts/O3-support-boundaries.md) boundary table and escalation | ✅ **closed in Increment 2** |

---

## Note 1 — step 07 gains a prerequisite

Publishing now requires rights clearance (Part R). This is a **deliberate addition of friction**, consistent with V1's own G2 rule that publishing is "a separate deliberate content decision".

Consequence for handover: M3 step 07 must be split in the revised training SOP.

> 07a · Record and approve the rights checklist on `R01`
> 07b · Preview and publish on `F07`

The owner is not blocked — they hold `PERM-rights-approve` by default as the `Owner` role. But they cannot publish in ignorance of it, which is the point.

**Increment 3 action:** update M3 to thirteen steps.

## Note 2 — step 08 publishes into a surface that does not exist yet

A reel can be created, processed, postered and published today. Where published reels *appear publicly* is `C10`, registered in [screens.md](../reference/screens.md) and specified in Increment 3. V1 had the same hole — an upload wizard and entity with no public page — and simply did not notice it.

Not a blocker for Increment 1; it is tracked and scheduled rather than latent.

## Note 3 — step 12, blocked in Increment 1, closed in Increment 2

**At Increment 1** this step was genuinely blocked. Backups, support boundaries and the escalation path were unwritten, so V2 could not claim V1's definition of done. It was recorded as an explicit gap rather than an unexamined assumption.

**Increment 2 closes it.** [O1](../parts/O1-backup-recovery.md) states what is backed up, how often, to what RPO and RTO, and how restores are verified — including object storage, which V1 omitted entirely while mandating database backups. [O3](../parts/O3-support-boundaries.md) gives the owner a boundary table, a never-do list and an escalation path, and `TC-098` tests exactly this step.

The V1 defect behind it was worse than an omission: J1 mandated database backup and restore testing while saying nothing about backing up the object storage holding every video master. Both are now covered, and [O1.1](../parts/O1-backup-recovery.md) makes R2 the system of record so a total loss of the video provider is a recovery exercise rather than the end of the portfolio.

---

## Result

| Outcome | Increment 1 | **After Increment 2** |
|---|---|---|
| ✅ Reachable | 9 | **10** |
| ⚠️ Reachable with a tracked caveat | 2 | 2 |
| ❌ Blocked | 1 | **0** |

**12 of 12 executable.** Two caveats remain and both are tracked: step 07 gains a rights-clearance prerequisite (M3 becomes thirteen steps in Increment 3), and step 08 publishes reels into a public surface — `C10` — that is specified in Increment 3.

No step is blocked, and no step is blocked by an open `UNRESOLVED`. **V2 now meets V1's own definition of done**, which Increment 1 could not yet claim.
