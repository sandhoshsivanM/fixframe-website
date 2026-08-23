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
| 12 | Understand backups, support, and what needs a developer | **Not yet specified** | ❌ see note 3 |

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

## Note 3 — step 12 is genuinely blocked

Backups, support boundaries and the developer-escalation path are **Increment 2** scope. The specification does not yet say what is backed up, how often, how a restore is tested, or which situations require a developer.

This is the honest result of the walkthrough, and worth stating plainly: **V2 cannot yet claim V1's definition of done.** Increment 1 makes eleven of twelve steps executable and specifies the twelfth as an explicit gap rather than an unexamined assumption.

The relevant gap in V1 is worse than an omission — V1 J1 mandates database backup and restore testing while saying nothing at all about backing up object storage, which is where every video master lives. Increment 2 closes both.

---

## Result

| Outcome | Count |
|---|---|
| ✅ Reachable | 9 |
| ⚠️ Reachable with a tracked caveat | 2 |
| ❌ Blocked | 1 |

**11 of 12 executable.** The single blocker is scheduled for Increment 2 and is not an `UNRESOLVED` — nobody needs to decide anything, the work simply has not been written yet.

No step is blocked by an open `UNRESOLVED`. That is the specific bar Increment 1 set, and it is met.
