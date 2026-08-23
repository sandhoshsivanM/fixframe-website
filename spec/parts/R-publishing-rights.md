# Part R · Publishing Rights & Legal Workflow

**Status:** ACCEPTED (three gated unknowns — `UNRESOLVED-009`, `-010`, `-011`)
**Supersedes:** V1 F03 — *"Public video requires rights/approval confirmation checkbox `[TBD business process]`"*
**Implements:** [ADR-005](../decisions/ADR-005-publishing-rights.md)

> Publishing client footage is the highest-consequence action in this system. V1 gated it behind one boolean and marked the process undefined. This part defines it.

---

## R1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-R-001` | Every `PortfolioProject` has exactly one `RightsRecord`, created with the project. |
| `REQ-R-002` | The rights checklist is **derived from project content**, not hand-declared, so adding a music block cannot silently skip a licence obligation. |
| `REQ-R-003` | Every release records grantor, evidence, date, term and the user who recorded it. |
| `REQ-R-004` | Recording a release and approving it are separable duties. |
| `REQ-R-005` | Publication is blocked server-side until every applicable release is `Granted` and unexpired. |
| `REQ-R-006` | Expiry and revocation **actively unpublish** dependent work and purge its CDN cache. |
| `REQ-R-007` | Rights evidence is never publicly reachable and never appears in a public API payload. |
| `REQ-R-008` | Owners are warned before a release expires, not only after. |

---

## R2 · Checklist derivation

On save of a portfolio project, the checklist is recomputed from content. Each rule creates or retires a `Release` row in `Required` state. Rows already `Granted` are never silently retired — they are marked `NotRequired` with the prior grant retained for audit.

| Condition | Release created |
|---|---|
| Project has an `operationalProjectId`, or `clientDisplayName` is set | `ClientConsent` × 1 |
| Any block or media is flagged as containing identifiable people | `TalentRelease` × n — one per named subject |
| Any `Video` block, or the cover, carries music | `MusicLicence` × 1 per track |
| Any block references licensed stock | `StockLicence` × 1 per item |
| Project service family is Drone, or location is flagged restricted | `LocationPermit` × 1 |

The "identifiable people" and "carries music" flags are set by the editor during upload (F03 step 3) and on the block editor. They default to **unset**, and an unset flag on a public project raises a publish-time warning — not a block. Defaulting them to *false* would let the checklist be skipped by inattention, which is the failure V1 already had.

> `UNRESOLVED-010` governs whether incidental attendees at an event (wedding guests, crowd) require individual `TalentRelease` rows or are covered by a venue/client clause. Until it closes, the checklist creates a **single** `TalentRelease` row scoped to "identifiable principals" and flags the question on screen.

---

## R3 · The publish gate

`API-portfolio-publish` evaluates, inside the publish transaction:

```
BLOCK unless, for this project's RightsRecord:
    every Release with status ≠ NotRequired
      has status = Granted
      and (expiresAt is null or expiresAt > now())
```

| Rule | ID |
|---|---|
| The gate is evaluated **server-side, in the publish transaction**. A publish attempt that bypasses the F07 wizard must fail identically. | `RULE-R3-1` |
| Failure returns `422 rights_not_cleared` with the outstanding releases enumerated — the operator must be told *what* is missing, not merely refused. | `RULE-R3-2` |
| `PERM-portfolio-publish` is necessary but not sufficient. Permission and clearance are independent gates. | `RULE-R3-3` |
| The gate result is written to `RightsRecord.evaluationResult` and `lastEvaluatedAt` on every evaluation, cleared or not. | `RULE-R3-4` |

---

## R4 · Expiry and revocation — the takedown path

`JOB-rights-sweep`, hourly. This is the mechanism V1 lacked entirely.

**Warning pass.** Releases with `expiresAt` within 30 days and status `Granted` raise `NTF-015` once per release. The warning exists so that expiry is a scheduled renewal rather than an emergency takedown.

**Lapse pass.** For each release transitioning to `Expired`, or manually `Revoked`:

| Step | Action | Why it matters |
|---|---|---|
| 1 | Transition dependent `PortfolioProject` → `Unpublished`, `unpublishReason = RightsLapsed` | Removes it from `API-public-projects-list` |
| 2 | Trigger frontend revalidation | The route must 404, not serve a stale static page |
| 3 | **Purge the CDN cache for the project's media** | An unpublished page whose video is still cached at the edge is not a takedown. This step is the one most easily forgotten and the one a complainant will check |
| 4 | Raise `NTF-016` to rights owner and all Owners | Someone must know it happened |
| 5 | Append `ENT-ActivityLog` with actor `system` and the triggering release ID | Evidence that the takedown occurred, and when |

Steps 1–3 are ordered and each is retried independently on failure; a failure at step 3 must not leave the sweep believing it succeeded.

---

## R5 · Screens

### Screen R01 · `/admin/portfolio/[id]/rights` — Project Rights Checklist

| Area | Specification |
|---|---|
| Primary user | Owner / Content Editor |
| Primary goal | Clear a project for publication, with evidence |
| Primary CTA | `[RECORD RELEASE]` |
| Secondary CTA | `[REQUEST APPROVAL]` |
| Data owner | Rights module |
| Permission | `PERM-rights-read`; write actions `PERM-rights-write`; approve `PERM-rights-approve` |

**Screen structure.** Clearance banner (Clear / Blocked, with outstanding count) · derived checklist grouped by release type · per-release row showing status, grantor, term, evidence thumbnail, recorded-by · evidence upload · approval action · expiry column with relative dates.

**User interactions.** 01 Record a release · 02 Attach evidence · 03 Approve (separate permission) · 04 Revoke · 05 Mark `NotRequired` with a mandatory reason · 06 Re-derive checklist.

**Business logic.**
- `RULE-R5-1` — Marking a release `NotRequired` requires a written reason, stored in `notes`. A silent dismissal would reintroduce the checkbox.
- `RULE-R5-2` — Approval is disabled for the user who recorded the release **unless** they hold `PERM-rights-approve` explicitly. Self-approval is permitted for a sole owner but logged distinctly.
- `RULE-R5-3` — Evidence attachments are `visibility = RightsEvidence` and served only through short-lived signed URLs.

**States.** *Loading* skeleton per release group · *Empty* checklist not yet derived, offer derive action · *Error* failed evidence upload retains the release row and the entered metadata · *Success* banner flips to Clear and the publish action unlocks on F07.

**Acceptance criteria.**
- `AC-R01-1` A project cannot be published while any applicable release is unmet — verified through the API directly, not only the UI.
- `AC-R01-2` Evidence is unreachable without `PERM-rights-read` and returns 403 to an authenticated user without it.
- `AC-R01-3` Every status transition appears in the audit log with actor and timestamp.
- `AC-R01-4` Adding a music block to a published-eligible draft re-derives the checklist and re-blocks it.

---

### Screen R02 · `/admin/rights` — Rights Register

| Area | Specification |
|---|---|
| Primary user | Owner |
| Primary goal | See what is expiring before it lapses |
| Primary CTA | `[RENEW]` |
| Secondary CTA | `[OPEN PROJECT]` |
| Permission | `PERM-rights-read` |

**Screen structure.** Tabs: Expiring soon (30 days) · Expired · Revoked · All. Columns: project, release type, subject, grantor, granted, expires, status. Filters by type and status.

**Business logic.**
- `RULE-R5-4` — Expiring-soon is computed from `expiresAt`, never stored, so the view cannot drift.
- `RULE-R5-5` — Renewal creates a **new** `Release` row; the prior row is retained as history. Editing the expiry date of a granted release in place is not permitted — it would destroy the evidence trail.

**Acceptance criteria.**
- `AC-R02-1` A release expiring within 30 days appears in Expiring soon and has raised `NTF-015` exactly once.
- `AC-R02-2` An expired release's dependent project is `Unpublished`, its public route 404s, and its CDN cache is purged — all three verified.
- `AC-R02-3` Renewal preserves the superseded release row.

---

## R6 · Open questions

| ID | Question | Owner | Gate |
|---|---|---|---|
| `UNRESOLVED-009` | Which artefact constitutes client consent evidence — a portfolio clause in the master services agreement, or a separate signed release? | Legal | `G01` |
| `UNRESOLVED-010` | Do incidental attendees require individual talent releases, or does a venue/client clause cover them? | Legal | `G01` |
| `UNRESOLVED-011` | How deeply are music licence terms tracked — track, licensor, term, territory, permitted use? | Legal / Studio | `G07` |

All three are genuinely external. None blocks building the model; each blocks its gate phase.
