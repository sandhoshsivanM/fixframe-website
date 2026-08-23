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
| `NTF-012` | Job → `DeadLettered` | Owner | E, A | Operational escalation — exhausted retries |
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

---

## Channel decision — outstanding

V1 references WhatsApp on C08 ("use direct WhatsApp after successful submission") and E03 ("Call/email/WhatsApp") without stating whether this is a `wa.me` deep link or the WhatsApp Business API. The two differ enormously: a deep link is a URL, the Business API is a vendor relationship, template pre-approval, per-message cost and a webhook integration.

**MVP assumes deep link.** Any `W` channel above degrades to a click-to-open action for the operator rather than an automated send, until `UNRESOLVED-005` closes.
