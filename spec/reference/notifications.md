# Reference · Notifications

**Normative.** V1 represented this entire concern as one box in Part H1 labelled "Email/Notification Adapter" and never enumerated a single message. This file closes the `Notification` link in the traceability chain.

---

## Governing rules

| Rule | Detail |
|---|---|
| **Never block the business write** | V1 A3: *"a public enquiry is never lost because email notification failed."* Generalised — every notification is queued **after** commit, as `ENT-NotificationRecord`. A send failure never rolls back the originating transaction. |
| **Never leak internal data** | Internal notes, budget discussion, rights evidence and storage keys are excluded from all outbound messages (V1 A3). |
| Retry | 3 attempts, exponential backoff, then `Failed` and surfaced in admin. `JOB-notification-retry` drives it. |
| Suppression | Recipient-level opt-out honoured for non-transactional messages only. Security messages are never suppressible. |
| Sender identity | One authenticated sending domain with SPF, DKIM and DMARC. Configuration is Increment 2. |
| Templates | Stored as versioned templates; the notification ID is the template key. |

---

## Catalogue

`Channel` — `E` Email · `A` In-app · `W` WhatsApp (subject to `UNRESOLVED-005`).

### Sales

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-001` | Lead persisted | Sales + Owner | E, A | Queued **after** commit. Contains brief summary, never internal fields |
| `NTF-002` | Lead persisted | Enquirer | E | Acknowledgement + reference number + response-time promise (V1 C08) |
| `NTF-003` | Lead assigned | Assignee | E, A | |
| `NTF-004` | Lead status → `Won` | Owner | A | Prompts conversion |

### Delivery

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-005` | Task assigned | Assignee | E, A | |
| `NTF-006` | Daily overdue sweep | Assignee | E | Digest, not per-task. `JOB-task-overdue-digest` |
| `NTF-007` | Project stage changed | Project owner + Owner | A | |
| `NTF-008` | Calendar event within 24h | Attendees | E, A | |
| `NTF-009` | Review feedback recorded | Project owner | A | |

### Media

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-010` | `MediaAsset` → `Ready` | Uploader | A | |
| `NTF-011` | `MediaAsset` → `Failed` | Uploader + Owner | E, A | Includes `failureReason` and a retry link. **Never auto-publishes** (V1 F01) |
| `NTF-012` | Job → `DeadLettered` | **Developer** (action), Owner (informational) | E, A | Exhausted retries. Copy states **"developer required — do not retry"** per [O3.3](../parts/O3-support-boundaries.md). Routing the action to the owner would violate [`RULE-O2-7`](../parts/O2-observability-incidents.md): never alert someone who is told not to act |
| `NTF-013` | Reconciliation recovered a stranded asset | Owner | A | Signals a lost webhook; worth investigating if frequent |

### Publishing & rights

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-014` | Portfolio project published | Owner | A | |
| `NTF-015` | Release expiring within 30 days | Rights owner + Owner | E, A | `JOB-rights-sweep`. **The warning that prevents a takedown** |
| `NTF-016` | Release expired or revoked → project unpublished | Rights owner + Owner | E, A | High priority. Names the affected project and the lapsed release |
| `NTF-017` | Showreel activated | Owner | A | |

### Security — never suppressible

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-018` | User invited | Invitee | E | Single-use token, 7-day expiry |
| `NTF-019` | Password reset requested | User | E | Sent **only** if the account exists; the API responds `202` either way |
| `NTF-020` | Password changed | User | E | Out-of-band notice of a security change |
| `NTF-021` | MFA enrolled or disabled | User | E | |
| `NTF-022` | Login from a new device or IP | User | E | |
| `NTF-023` | Role granting `PERM-users-write` assigned | User + all Owners | E, A | Privilege escalation is always announced |

### Client-facing

| ID | Trigger | Recipient | Ch | Notes |
|---|---|---|---|---|
| `NTF-024` | Review link shared | Client contact | E, W | Link + passphrase sent **separately** where a passphrase is set |

### Operations — added in Increment 2

Routed by severity per [O2.4](../parts/O2-observability-incidents.md), not by role.

| ID | Trigger | Recipient | Ch | Sev | Notes |
|---|---|---|---|---|---|
| `NTF-025` | Backup job failed | Developer | E, A | S2 | **Two consecutive failures escalate to S1** — a silently broken backup is indistinguishable from none |
| `NTF-026` | Restore verification failed | Developer + Owner | E, A | **S1** | A backup that cannot be restored is an outage that has not happened yet |
| `NTF-027` | Storage inconsistency detected | Developer | E, A | S2 | Missing object, checksum mismatch, or a broken published reference ([O1.7](../parts/O1-backup-recovery.md)) |
| `NTF-028` | **Scheduled job missed its run** | Developer | E, A | S2 | S1 for `JOB-rights-sweep`. The highest-value monitor in the system |

- `NTF-028` is raised by the cron monitor, **not** by the job — a job that is not running cannot report that it is not running.

---

## Channel decision — outstanding

V1 references WhatsApp on C08 ("use direct WhatsApp after successful submission") and E03 ("Call/email/WhatsApp") without stating whether this is a `wa.me` deep link or the WhatsApp Business API. The two differ enormously: a deep link is a URL, the Business API is a vendor relationship, template pre-approval, per-message cost and a webhook integration.

**MVP assumes deep link.** Any `W` channel above degrades to a click-to-open action for the operator rather than an automated send, until `UNRESOLVED-005` closes.
