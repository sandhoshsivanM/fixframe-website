# Operations walkthrough tests — Increment 2

**Purpose.** Static cross-reference validation proves every ID resolves. It cannot prove that a *person* following the specification reaches the right outcome. These two flows trace operational scenarios end to end, looking for the seams between documents.

They found five defects. All five are fixed; each is recorded below with what it was and where the fix landed, because the record of what the walkthrough caught is more useful than a clean sheet.

Executed manually as `TC-158` and `TC-159` once built.

`✅` covered · `⚠️` gap found and fixed · `❌` unresolved

---

# Walkthrough A · Production incident recovery

**Scenario.** Release `v1.4.0` ships a migration that corrupts `ENT-MediaDerivative` rows. Roughly 200 published assets lose their primary poster. The migration succeeded, no exception was thrown, and nothing has crashed. A client emails: *"the videos on your work page are showing broken images."*

Chosen deliberately as the hardest shape of incident — a **silent data regression**, not an outage.

| # | Step | Path | Verdict |
|---|---|---|---|
| 1 | Incident occurs | Migration completes successfully; data is wrong; no exception | — |
| 2 | **Alert fires** | Nothing fired. Sentry sees no error; uptime is green; the pipeline is healthy | ⚠️ **Gap 1** |
| 3 | Boundary identified | [O3.3](../parts/O3-support-boundaries.md) — migrations and restores are Developer. Unambiguous | ✅ |
| 4 | Severity | [O2.4](../parts/O2-observability-incidents.md) — public-facing visual defect on published work → **S2** | ✅ |
| 5 | Backup located | [O1.4](../parts/O1-backup-recovery.md) — PITR covers a 2-hour-old incident. Runbook names it | ✅ |
| 6 | **Restore executed** | Full restore would discard every lead, note and status change since the migration | ⚠️ **Gap 2** |
| 7 | Storage reconciled | `JOB-storage-reconcile` on demand ([O1.7](../parts/O1-backup-recovery.md)) | ✅ |
| 8 | Webhooks reconciled | `JOB-media-reconcile` — unaffected here, but runs | ✅ |
| 9 | **Service verified** | [O2.5](../parts/O2-observability-incidents.md) requires "the originating signal returns to normal" — there was no signal | ⚠️ **Gap 3** |
| 10 | Closed | Timeline, impact, actions recorded | ✅ |
| 11 | Post-incident | S2 → mandatory within 5 business days ([`RULE-O2-9`](../parts/O2-observability-incidents.md)) | ✅ |

## Gap 1 — no signal for silent data regressions

**Found.** Every media-pipeline signal in O2.3 watched *processing*. None watched *integrity*. An asset that is `Ready`, published, and missing its poster row throws nothing, fails no health check, and renders as a broken image to visitors. The nightly `JOB-storage-reconcile` covered missing R2 *objects* but not missing derivative *rows* — so a database-side regression was invisible to both layers.

**Fixed.** Two rows added to the [O1.7](../parts/O1-backup-recovery.md) reconciliation table (`Ready` with no primary poster; derivative row present, object absent), and a corresponding signal added to [O2.3](../parts/O2-observability-incidents.md).

**Why it matters:** this is the exact failure the walkthrough was designed to surface — a defect that sits in the seam between two documents, each of which looked complete alone.

## Gap 2 — no partial-restore procedure

**Found.** [O1](../parts/O1-backup-recovery.md) documented full restore thoroughly. But full restore is the *rare* case. The common one is a bad release corrupting one table while everything else is current, where rolling the whole database back trades a cosmetic defect for genuine data loss. An operator following the runbook literally would have made the incident worse.

**Fixed.** [O1.7 · Partial restore](../parts/O1-backup-recovery.md) — six steps via a scratch database, plus `RULE-O1-17` (never write from a backup directly into production) and `RULE-O1-18` (Developer-only, always produces a post-incident review).

## Gap 3 — verification undefined for human-reported incidents

**Found.** `RULE-O2-9`'s closing condition was "the originating signal returns to normal". For an incident a client reported and no monitor saw, there is no signal, so the closing condition was unsatisfiable — and in practice would be waved through.

**Fixed.** `RULE-O2-9a` — verification requires reproducing the original report **and adding the missing signal before close.** An incident a customer found and no monitor saw is a monitoring defect as much as a product one.

---

# Walkthrough B · Media processing failure

**Scenario.** The owner uploads a 3 GB wedding film. Stream ingest fails transiently five times — a provider incident. The job dead-letters. The owner must reach a published project.

| # | Step | Path | Verdict |
|---|---|---|---|
| 1 | Upload | Browser → R2 signed PUT → `Uploading` → `API-media-complete` → `Uploaded` | ✅ |
| 2 | Stream ingest requested | From a signed R2 URL ([O1.1](../parts/O1-backup-recovery.md)) — **the source is already safe in R2** | ✅ |
| 3 | Job enqueued | Same transaction as the status change ([H′2](../parts/H-prime-media-processing.md)) | ✅ |
| 4 | Transient failures | 5 attempts, backoff with jitter ([`RULE-H4-1`](../parts/H-prime-media-processing.md)) | ✅ |
| 5 | Dead-letter | `DeadLettered`, `NTF-012` raised | ✅ |
| 6 | **Alert routed** | `NTF-012` went to the **Owner** — whom [O3.3](../parts/O3-support-boundaries.md) tells not to act on it | ⚠️ **Gap 4** |
| 7 | Operator sees failure | `F01` processing panel; `failureReason` shown | ✅ |
| 8 | **Operator retries** | Owner holds `PERM-media-write` and could retry a dead-lettered job indefinitely, contradicting O3.3 | ⚠️ **Gap 5** |
| 9 | Developer investigates | Provider incident confirmed; retried after it clears | ✅ |
| 10 | Reaches `Ready` | Metadata preserved through retry ([`RULE-H4-4`](../parts/H-prime-media-processing.md)) | ✅ |
| 11 | Poster and crop | `F05`, focal point set | ✅ |
| 12 | Attach and attempt publish | `F07` → `API-portfolio-publish` | ✅ |
| 13 | **Publish blocked on rights** | `422 rights_not_cleared`, outstanding releases listed | ✅ |
| 14 | Not treated as an incident | [`RULE-O3-2`](../parts/O3-support-boundaries.md) — a rights block is by design | ✅ |
| 15 | Rights cleared, published | `R01` → publish → revalidate | ✅ |

## Gap 4 — alert routed to someone told not to act

**Found.** `NTF-012` (job dead-lettered) named the Owner as recipient. [O3.3](../parts/O3-support-boundaries.md) classifies a dead-lettered job as Developer-level. So the system would email the owner about something the support boundary tells them to escalate — precisely the failure `RULE-O2-7` warns against: *"an alert the owner cannot act on and cannot escalate is noise."*

**Fixed.** `NTF-012` now routes the **action** to the Developer and the Owner informationally, with copy stating *"developer required — do not retry."*

## Gap 5 — policy contradicted by mechanism

**Found.** [O3.3](../parts/O3-support-boundaries.md) says dead-lettered jobs are Developer-level. But `API-media-retry` requires only `PERM-media-write`, which the Owner holds. Nothing stopped an owner retrying a dead-lettered job repeatedly — which is exactly what a frustrated person does when a video will not appear.

**Fixed.** `RULE-H4-6` — one manual retry permitted with a confirmation stating a developer is required; a second returns `409` and directs escalation.

**Why it matters:** a support boundary the API does not enforce is a suggestion. This was the clearest instance of the class of defect these walkthroughs exist to catch — **a policy stated in one document and contradicted by a permission in another.**

---

# Result

| | Walkthrough A | Walkthrough B |
|---|---|---|
| Steps traced | 11 | 15 |
| ✅ Covered | 8 | 13 |
| ⚠️ Gap found and fixed | 3 | 2 |
| ❌ Unresolved | 0 | 0 |

**Five defects found, five fixed.** Every one sat in a seam between two documents that each looked complete in isolation:

| Gap | Seam |
|---|---|
| 1 | Backup ↔ observability — neither owned data integrity |
| 2 | Runbook ↔ reality — the documented path was the rare one |
| 3 | Incident process ↔ detection — a closing condition that assumed an alert |
| 4 | Notification catalogue ↔ support boundary — alerting someone told not to act |
| 5 | Support boundary ↔ permission model — policy without enforcement |

None would have been caught by the traceability validator: every ID in every one of those documents resolved correctly before and after. **Cross-reference validation proves the graph is connected; only a walkthrough proves it leads somewhere.**

That is the argument for running both, and it is why the operations walkthroughs were worth the specific ask.
