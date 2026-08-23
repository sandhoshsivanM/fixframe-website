# Part O1 · Backup, Restore & Disaster Recovery

**Status:** ACCEPTED
**Closes:** V1 J1 mandates "automated DB backup + restore test" with no frequency, retention or procedure — and says **nothing whatsoever about the object storage holding every video master.** V1 L1 lists "backups" as a production bullet.

> Backing up the database and not the media is backing up the filing cabinet's index and not the films.

---

## O1.1 · The architectural consequence

Asking "what do we restore from" forces a refinement to the upload path in [H′2](H-prime-media-processing.md).

[ADR-002](../decisions/ADR-002-media-processing.md) already places source masters in R2. Making that load-bearing gives a clean division:

| Store | Role | Recoverable? |
|---|---|---|
| **R2** | **System of record** for source bytes | Must be backed up. Nothing else can reconstruct it |
| **Stream** | **Derivative store** — renditions, posters, playback | Reconstructible by re-ingesting from R2 |
| **Postgres** | System of record for all structured data | Must be backed up |

So the ingest order is **R2 first, Stream second**:

```
browser → signed PUT → R2 (source master)
                        ↓
        API asks Stream to ingest from a signed R2 URL
                        ↓
        Stream transcodes → webhook → status = Ready
```

- `RULE-O1-1` — Video sources land in **R2 before** Stream ingest is requested. Uploading straight to Stream would make the video provider the sole custodian of bytes the studio cannot regenerate.
- `RULE-O1-2` — Stream ingress and encoding are free, so the second hop costs delivery only. The redundancy is close to free; the alternative is unrecoverable.
- `RULE-O1-3` — Losing the entire Stream account is therefore an **RTO event, not a data-loss event** — re-ingest and re-transcode from R2.

This is a refinement of ADR-002, not a reversal: R2 was always named as the master store. O1 makes the ordering explicit and gives it a reason.

---

## O1.2 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O1-001` | Every store with a system-of-record role has a backup independent of the vendor holding the primary. |
| `REQ-O1-002` | Stated RPO and RTO per store, with a procedure that meets them. |
| `REQ-O1-003` | Restores are verified automatically and on a schedule — an unverified backup is a hypothesis. |
| `REQ-O1-004` | Database and media inconsistency after a restore is detected and repaired, not discovered by a user. |
| `REQ-O1-005` | Deleted and corrupted objects are recoverable inside the retention window. |
| `REQ-O1-006` | Backups are encrypted, and the key is not held only by the vendor storing the backup. |

---

## O1.3 · Targets

| Store | RPO | RTO | Rationale |
|---|---|---|---|
| PostgreSQL | **5 minutes** | **1 hour** | Neon PITR granularity. Losing an hour of leads is a business loss, not an inconvenience |
| R2 source masters | **24 hours** | **4 hours** | Sources change only on upload; a day's exposure is one shoot |
| R2 derivatives | **24 hours** | Regenerable | Rebuildable from source; restored only to avoid re-processing cost |
| Stream | **n/a** | **24 hours** | Derivative store — rebuilt from R2 |
| Secrets | n/a | **1 hour** | Secret manager export, held offline |

Availability target is set in [O2](O2-observability-incidents.md).

---

## O1.4 · PostgreSQL

Three layers, because the first two share a single vendor and a single account.

| Layer | Mechanism | Retention | Protects against |
|---|---|---|---|
| 1 | **Neon PITR** | 7 days (Launch plan) / 30 days (Scale) | Human error, bad migration, accidental delete |
| 2 | **Nightly `pg_dump`** → R2 `backups/db/`, AES-256 encrypted | 30 daily · 12 monthly | Vendor-side corruption, plan downgrade |
| 3 | **Weekly encrypted dump** → separate provider or offline | 12 weekly | **Account loss** — compromise, billing failure, termination |

- `RULE-O1-4` — Layer 3 exists solely for the case Layers 1 and 2 do not cover: losing the Cloudflare or Neon account itself. It is the layer people skip and the one that matters when it matters.
- `RULE-O1-5` — Dumps are encrypted with a key from the secret manager, **not** a vendor-managed key. A backup that only the compromised vendor can decrypt is not a backup (`REQ-O1-006`).
- `RULE-O1-6` — Migrations run only after an on-demand PITR restore point is taken.
- `RULE-O1-7` — Dump failure raises `NTF-025` at severity S2. Two consecutive failures escalate to S1 — a silently broken backup is indistinguishable from no backup.

## O1.5 · R2

| Control | Setting |
|---|---|
| Versioning | **Enabled** on all buckets. Overwrite and delete are recoverable |
| Non-current retention | 30 days, then lifecycle-expired |
| Delete protection | Application never issues a hard delete; see [O7](O7-data-lifecycle.md) |
| Replication | Nightly copy of `sources/` and `backups/` to a second bucket in a **different jurisdiction and account** |
| Infrequent Access | `sources/` older than 90 days transitions to IA (30-day minimum applies) |
| Integrity | `checksumSha256` on `ENT-MediaAsset` verified on upload and sampled monthly |

- `RULE-O1-8` — Derivatives are **not** replicated. They are regenerable, and replicating them doubles storage cost for no recovery benefit.
- `RULE-O1-9` — The replication target uses separate credentials with write-only access, so a compromised primary credential cannot delete the copy.

## O1.6 · Stream

- `RULE-O1-10` — Stream holds no unique data. Every Stream asset traces to an R2 source via `ENT-MediaAsset.sourceStorageKey`.
- `RULE-O1-11` — Rebuild is: re-ingest from R2 → new `providerAssetId` → remap. `providerAssetId` and `providerName` are separate columns precisely so this is an update, not a migration ([ADR-002](../decisions/ADR-002-media-processing.md)).
- `RULE-O1-12` — Posters are `ENT-MediaDerivative` rows with their own R2 keys, so **poster and crop choices survive a Stream rebuild.** Losing them would mean a human re-picking every thumbnail — the expensive part is the judgement, not the bytes.

---

## O1.7 · Consistency recovery — `JOB-storage-reconcile` / `CMD-reconcile-now`

A restore puts the database at time *T* while storage is at *now*. Divergence is guaranteed, not exceptional. Runs nightly, and on demand after any restore.

### Three stores, one authority chain

```
Source master → R2 (system of record) → Stream ingest → derivatives → CDN playback
```

Reconciliation is a **three-way** comparison, and each pair fails differently:

| Pair | Authority | What divergence means |
|---|---|---|
| PostgreSQL ↔ R2 | **R2 for bytes, PostgreSQL for meaning** | A row without an object is a lost master. An object without a row is an orphan — reclaimable |
| R2 ↔ Stream | **R2 always** | Stream holds nothing unique. Any divergence is repaired by re-ingest, never by treating Stream as truth |
| PostgreSQL ↔ Stream | **PostgreSQL, via R2** | `providerAssetId` is a pointer, not a source. A stale pointer is remapped, not restored |

- `RULE-O1-19` — **Stream is never the authority for anything.** When Stream and R2 disagree, R2 wins and Stream is rebuilt. This is what [O1.1](#o11--the-architectural-consequence)'s ordering buys, and it removes an entire class of "which copy is right?" judgement from an incident.
- `RULE-O1-20` — Every future media rule must state whether it governs the **authoritative source**, a **derived playback asset**, or **both**. A rule that does not say defaults to *source*, because that is the copy that cannot be regenerated.

| Condition | Meaning | Action |
|---|---|---|
| DB row, no R2 object | Asset created after the restore point, or object lost | → `Failed`, reason `source_missing`, `NTF-027` |
| R2 object, no DB row | Upload orphaned by the restore | Move to `quarantine/`, retain 30 days, then expire |
| DB row `Ready`, Stream asset absent | Stream-side loss | Re-ingest from R2, remap `providerAssetId` |
| Checksum mismatch | Corruption | Quarantine, `NTF-027` at S2, restore from the replica |
| `MediaUsage` → missing asset | Broken published reference | **Unpublish the dependent project**, `NTF-027` |
| Rights evidence attachment missing | Evidence gone | Release → `Pending`, project unpublished, `NTF-016` |
| `MediaAsset` `Ready` with **no primary poster derivative row** | Derivative rows lost — a data regression, not a storage loss | Regenerate from source; if unregenerable, `NTF-027` S2 and block publish |
| `MediaDerivative` row present, object absent | Half-lost derivative | Regenerate; no alert unless regeneration fails |

- `RULE-O1-13` — The rows that unpublish fail **towards unpublishing**. A published page whose media or rights evidence has vanished is worse than a 404.
- `RULE-O1-14` — Nothing is deleted during reconciliation. Quarantine and alert; a human decides.

### Partial restore

A full restore is the documented path and the rarer case. The common one is a bad release corrupting **one table** while everything else is current — and rolling the whole database back to before it would discard every lead, note and status change since.

| Step | Rule |
|---|---|
| 1 | Restore the dump or PITR snapshot to a **scratch database**, never over production |
| 2 | Extract only the affected tables |
| 3 | Reconcile row-by-row against production; a row created after the incident wins over the restored copy unless it is the corruption itself |
| 4 | Apply inside a transaction, with a fresh PITR restore point taken first |
| 5 | Run `JOB-storage-reconcile` |
| 6 | Verify the originating signal |

- `RULE-O1-17` — **Partial restore never writes directly from a backup into production.** It goes via a scratch database so the merge is reviewable and reversible. Restoring a table in place is how a data incident becomes two data incidents.
- `RULE-O1-18` — Partial restore is Developer-only ([O3](O3-support-boundaries.md)) and always produces a post-incident review, regardless of severity — it means a release reached production with a defect that testing did not catch.

---

## O1.8 · Restore verification

| Cadence | Procedure | Pass criteria |
|---|---|---|
| **Monthly, automated** | `JOB-restore-verify` restores the latest dump to a scratch database | Migrations at head; row counts within tolerance; 20 sampled `ENT-MediaAsset` rows resolve to live R2 objects |
| **Quarterly, manual** | Full DR drill — restore DB, rebuild a Stream asset from R2, run the O2 recovery walkthrough | Completed inside RTO by someone following only the runbook |
| **On change** | After any migration touching media or rights | Reconciliation clean |

- `RULE-O1-15` — Verification failure raises `NTF-026` at **S1**. A backup that cannot be restored is an outage that has not happened yet.
- `RULE-O1-16` — The quarterly drill must be performed by someone who did **not** write the runbook. A runbook only its author can follow is not a runbook.

---

## O1.9 · Acceptance criteria

- `AC-O1-1` A restore to an arbitrary point within the PITR window succeeds inside RTO.
- `AC-O1-2` A dump restores to an empty database and passes verification.
- `AC-O1-3` A deleted R2 object is recoverable for 30 days.
- `AC-O1-4` Total loss of the Stream account is recoverable from R2 within 24 hours, preserving poster and crop choices.
- `AC-O1-5` Post-restore inconsistency is detected by reconciliation and never surfaces to a public visitor.
- `AC-O1-6` A missing rights evidence attachment unpublishes its project.
- `AC-O1-7` Backup dumps are unreadable without the key from the secret manager.
- `AC-O1-8` A failed backup alerts; two consecutive failures escalate to S1.
