# Part O7 · Data Lifecycle, Retention & Erasure

**Status:** ACCEPTED · closes `UNRESOLVED-012` (mechanism); `UNRESOLVED-015` opened for jurisdiction
**Closes:** V1 mentions "retention policy" twice as a placeholder and provides no erasure path at all — despite collecting name, email, phone, budget and free-text brief from every enquirer through a form with a consent checkbox.

> V1's lead form asks for consent under a privacy policy that did not exist, to a retention policy that was never written, with no way to honour a deletion request. This part connects the legal obligation to actual jobs and constraints rather than leaving it as policy prose.

---

## O7.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O7-001` | Every category of personal data has a stated retention period and a job that enforces it. |
| `REQ-O7-002` | A data subject's erasure request is executable without breaking referential integrity or the audit trail. |
| `REQ-O7-003` | Deletion that would destroy legally required evidence is refused, with the reason stated. |
| `REQ-O7-004` | Orphaned media and attachments are detected and reclaimed. |
| `REQ-O7-005` | Archival and deletion are distinct, and the UI exposes only archival. |

---

## O7.2 · Retention matrix

| Data | Active | Then | Enforced by |
|---|---|---|---|
| **Lead**, not converted, `Lost` or dormant | 24 months from last contact | **Anonymised** | `JOB-retention-sweep` |
| **Lead**, converted | Life of the client relationship | Follows Client | — |
| **Client**, active | Indefinite | — | — |
| **Client**, archived | 7 years from last project | Reviewed, then anonymised | Manual, flagged by job |
| **OperationalProject** | 7 years from completion | Retained — commercial record | — |
| **Note**, internal | Follows parent | — | — |
| **Attachment**, general | Follows parent | — | — |
| **Attachment**, rights evidence | **Life of record + 7 years** | Never auto-deleted | Blocked by `RULE-O7-4` |
| **MediaAsset** source, published | Indefinite while referenced | — | `ENT-MediaUsage` |
| **MediaAsset** source, failed job | **30 days** | Deleted; asset → `Archived` | `JOB-retention-sweep` |
| **MediaAsset**, abandoned upload | **24 hours** | Deleted | [H′5](H-prime-media-processing.md) |
| **MediaAsset**, `ReviewCopy` | **90 days** after project completion | Deleted | `JOB-retention-sweep` |
| **MediaAsset**, archived master | Indefinite | Manual review only | — |
| **ReviewLink** | Until expiry + 30 days | Deleted; feedback retained | `JOB-retention-sweep` |
| **Session**, expired | 24 hours | Deleted | `JOB-session-purge` |
| **IdempotencyRecord** | 24 hours | Deleted | `JOB-idempotency-purge` |
| **NotificationRecord** | 12 months | Deleted | `JOB-retention-sweep` |
| **ActivityLog** | 24 months hot | Archived cold, **never deleted** | [O6.7](O6-security-operations.md) |
| **Release** / rights records | Life + 7 years | Never auto-deleted | `RULE-O7-4` |
| R2 quarantine | 30 days | Deleted | `JOB-storage-reconcile` |
| R2 non-current versions | 30 days | Lifecycle-expired | [O1.5](O1-backup-recovery.md) |

This closes `UNRESOLVED-012`'s **mechanism**. The provisional durations above become binding on legal sign-off — see `UNRESOLVED-015`.

---

## O7.3 · Erasure

An enquirer asking to be forgotten must be honourable without corrupting the system.

### Anonymisation, not deletion

- `RULE-O7-1` — Erasure **anonymises in place**. `ENT-Lead` rows are referenced by `ENT-Task`, `ENT-Note`, `ENT-ActivityLog`, `ENT-CalendarEvent` and conversion links. Deleting the row breaks the audit trail; anonymising satisfies the obligation and preserves referential integrity.

| Field | After erasure |
|---|---|
| `name` | `[erased]` |
| `email`, `phone` | `NULL` |
| `brief` | `[erased at request of data subject]` |
| `location` | Coarsened to city, or `NULL` |
| `budgetRange`, `serviceId`, `status`, timestamps | **Retained** — non-identifying, needed for aggregate reporting |
| `ENT-LeadReference` rows | Deleted — user-supplied URLs may identify |
| `ENT-Note` on the lead | Deleted |
| `ENT-Attachment` on the lead | Deleted from R2 and the database |
| `ENT-ActivityLog` | Retained; actor and entity IDs kept, `metadata` scrubbed of personal fields |

- `RULE-O7-2` — Erasure writes an `ENT-ActivityLog` entry recording that erasure occurred, by whom and when — **without** recording what was erased. Evidence of compliance, not a copy of the data.
- `RULE-O7-3` — Erasure propagates to backups by **expiry, not rewrite.** Rewriting historical backups to remove a row corrupts them. The obligation is discharged by the retention window: the request is recorded, the erasure applied to live data, and backups containing the original expire within 12 months. This position is stated explicitly so it can be reviewed rather than assumed.

### When erasure must be refused

- `RULE-O7-4` — Erasure is **refused** where the subject is a grantor on a `Granted`, unexpired `ENT-Release`. The release is the studio's authorisation to publish material that is already public; destroying it while the work remains published removes the defence and not the exposure. The correct sequence is **revoke the release → unpublish → then erase**, which [R4](R-publishing-rights.md) already automates.
- `RULE-O7-5` — Refusal returns `409` naming the blocking releases and the correct sequence. It is never a silent decline.
- `RULE-O7-6` — Client and project records inside their 7-year commercial retention are refused for the same reason, with the retention basis stated.

### Client deletion constraints

| Condition | Result |
|---|---|
| Referenced by any project | Archive only ([`RULE-F10-2`](F-prime-cms-screens.md) pattern) |
| Named on a published portfolio project | Archive; `clientDisplayName` is a separate field and may be withheld independently |
| Grantor on an active release | Erasure refused per `RULE-O7-4` |
| No references, outside retention | Anonymised on request |

---

## O7.4 · Orphan reclamation — `JOB-retention-sweep`

Nightly. Distinct from `JOB-storage-reconcile`, which repairs inconsistency; this one reclaims things that are consistent but no longer needed.

| Class | Detection | Action |
|---|---|---|
| Failed-job sources past 30 days | `status = Failed`, no retry pending | Delete object, asset → `Archived` |
| Abandoned uploads past 24 h | `status = PendingUpload` | Delete, log |
| Review copies past 90 days post-completion | `role = ReviewCopy`, project `Completed` | Delete object and derivatives |
| Expired review links past 30 days | `expiresAt` elapsed | Delete link; **retain `ENT-ReviewFeedback`** |
| Attachments with no parent | Parent gone | Quarantine 30 days, then delete |
| Derivatives with no asset | Asset deleted | Delete |
| Dormant leads past 24 months | No contact, not converted | Anonymise |
| Notification records past 12 months | Age | Delete |

- `RULE-O7-7` — The sweep **never deletes anything with a live `ENT-MediaUsage` row**, regardless of age. Usage beats retention.
- `RULE-O7-8` — Every deletion is logged with a count and reason. A sweep that suddenly deletes ten times its usual volume must be visible ([O2](O2-observability-incidents.md)).
- `RULE-O7-9` — The sweep runs in **dry-run for its first 30 days in production**, reporting what it would delete. Retention bugs are not recoverable, and a policy that has never been observed is a policy nobody has checked.

`RULE-O7-9` is the cheapest safeguard in this part: it converts an irreversible risk into a report someone reads.

---

## O7.5 · Archive versus delete

| Action | Available to | Effect |
|---|---|---|
| **Unpublish** | Owner | Removed from public; fully reversible |
| **Archive** | Owner | Hidden from pickers and lists; fully reversible |
| **Anonymise** | Developer, on request | Personal fields cleared; row and links survive |
| **Delete** | Developer only, via job or direct action | Object and row destroyed |

- `RULE-O7-10` — The admin UI exposes **unpublish and archive only.** No screen offers hard deletion of a client, lead or media asset ([`RULE-O3-3`](O3-support-boundaries.md)). Destructive capability the owner does not have is destructive capability that cannot be misused at 11 p.m.

---

## O7.6 · Open question

| ID | Question | Owner | Gate |
|---|---|---|---|
| `UNRESOLVED-015` | Which regime governs — India's DPDP Act, GDPR for EU enquirers, or both? Determines lawful basis, response deadlines, whether a consent register is required, and whether `RULE-O7-3`'s backup-expiry position is defensible. | Legal | `G01` |

The **mechanism** is complete and jurisdiction-independent: retention periods, anonymisation, refusal conditions and jobs all exist. What `UNRESOLVED-015` sets is the durations and the response deadline — configuration of a working system, not a missing one.

---

## O7.7 · Acceptance criteria

- `AC-O7-1` Every retention row has a job that enforces it.
- `AC-O7-2` Anonymising a lead preserves every foreign-key reference and the audit trail.
- `AC-O7-3` Erasure is refused, with reasons, where an unexpired granted release names the subject.
- `AC-O7-4` Erasure is recorded without recording the erased content.
- `AC-O7-5` The sweep never deletes an asset with live `ENT-MediaUsage`.
- `AC-O7-6` The sweep dry-runs for 30 days and reports before it deletes.
- `AC-O7-7` No admin UI path hard-deletes a client, lead or media asset.
- `AC-O7-8` Rights evidence is never auto-deleted by any job.
- `AC-O7-9` Deleting a review link retains its feedback.
