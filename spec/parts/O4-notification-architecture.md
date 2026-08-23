# Part O4 · Notification Architecture

**Status:** ACCEPTED
**Extends:** [reference/notifications.md](../reference/notifications.md) — 24 catalogued messages
**Implements:** [ADR-006](../decisions/ADR-006-whatsapp-channel.md)
**Closes:** V1 represented this concern as one box labelled "Email/Notification Adapter" in Part H1.

---

## O4.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O4-001` | A notification failure never rolls back the business write that raised it. |
| `REQ-O4-002` | Every message has a transport, a retry policy and a defined terminal state. |
| `REQ-O4-003` | A notification is delivered **at most once** per triggering event. |
| `REQ-O4-004` | Templates are versioned and owned. |
| `REQ-O4-005` | Suppression is honoured for optional messages and impossible for security messages. |
| `REQ-O4-006` | Failure to deliver a lead notification is itself surfaced. |

---

## O4.2 · Delivery pipeline

```
business transaction COMMITS
        ↓
ENT-NotificationRecord inserted (status = Queued)   ← after commit, never inside
        ↓
JOB-notification-dispatch  (every 60s)
        ↓
transport adapter → provider
        ↓
Sent | Failed(retryable) | Failed(terminal) | Suppressed
```

- `RULE-O4-1` — Queued **after** commit. V1 A3's first rule — a lead is never lost because email failed — generalises to every message, and is only true if the notification cannot participate in the transaction.
- `RULE-O4-2` — The dispatcher claims rows with `SELECT … FOR UPDATE SKIP LOCKED`, so two workers never double-send.
- `RULE-O4-3` — Idempotency key is `(notificationId, relatedEntityType, relatedEntityId, recipient)`. Re-raising the same event finds the existing record and does not send again (`REQ-O4-003`).

---

## O4.3 · Transports

| Transport | Provider | Used for |
|---|---|---|
| **Email** | Resend | All transactional mail |
| **In-app** | `ENT-NotificationRecord` read by the admin UI | Operational awareness |
| **WhatsApp** | **None — deep link only** ([ADR-006](../decisions/ADR-006-whatsapp-channel.md)) | Operator-initiated |

- `RULE-O4-4` — A `W` channel in the catalogue is an **operator action**, not a send. `NTF-024` becomes a copy-to-clipboard on `G01`. Nothing is transmitted by the system and no delivery is recorded.
- `RULE-O4-5` — In-app notifications are never the sole channel for anything time-critical; they assume someone is logged in.

### Sender identity

| Control | Setting |
|---|---|
| Domain | A dedicated subdomain, e.g. `mail.[DOMAIN]` — keeps reputation separate from the studio's human mail |
| SPF, DKIM, DMARC | All three required before production. DMARC starts `p=none`, moves to `p=quarantine` after two clean weeks |
| From | `[Studio] <hello@mail.[DOMAIN]>`; `Reply-To` the studio's real inbox |
| Bounces | Webhook → `NotificationRecord.status = Failed`; hard bounces suppress the address |

- `RULE-O4-6` — Production sending is blocked until SPF, DKIM and DMARC verify. A lead acknowledgement in a spam folder is worse than none — the enquirer believes they have been contacted.

---

## O4.4 · Retry and terminal states

| Attempt | Delay | |
|---|---|---|
| 1 | immediate | |
| 2 | 1 min | |
| 3 | 5 min | |
| 4 | 30 min | |
| — | → `Failed` (terminal) | Surfaced in admin |

| Failure | Retry? |
|---|---|
| Provider 5xx, timeout, rate limit | Yes |
| Invalid recipient, hard bounce | No — terminal, address suppressed |
| Template render error | No — terminal, S2. A code defect; retrying re-runs the same bug |
| Quota exhausted | Yes, with extended backoff, **and** S2 alert |

- `RULE-O4-7` — **Terminal failure of `NTF-001` or `NTF-002` is S2**, not a log line. A lead was captured and nobody was told, or the enquirer thinks they were ignored. Every other notification failing is S3.

---

## O4.5 · Templates

| Aspect | Rule |
|---|---|
| Key | The notification ID — `NTF-002` renders `templates/ntf-002.*` |
| Versioning | In the repo, reviewed and deployed like code. Not editable in a vendor console |
| Ownership | Copy: studio owner. Structure and variables: developer |
| Formats | HTML **and** plain text, always |
| Variables | Declared per template; a missing variable fails the build, not the send |
| Content rule | Never internal notes, budget discussion, rights evidence, storage keys or tokens |

- `RULE-O4-8` — Template copy lives in the repo rather than the CMS **deliberately.** Transactional copy is rarely changed, and a broken variable in a live template silently stops critical mail. This is the one place the "owner edits everything" principle is traded for safety, and the trade is stated rather than assumed.

---

## O4.6 · Suppression

| Class | Suppressible | Examples |
|---|---|---|
| **Security** | **Never** | `NTF-018`–`NTF-023` — invitation, password, MFA, new device, privilege grant |
| **Transactional** | No | `NTF-002` lead acknowledgement |
| **Operational** | Per-user, per-notification | `NTF-005` task assigned, `NTF-007` stage changed |
| **Digest** | Per-user | `NTF-006` overdue tasks |

- `RULE-O4-9` — Security notifications ignore every suppression, including hard bounce: the record is written and the failure surfaced. Someone changing a password must not be able to silence the notice that they did.
- `RULE-O4-10` — Hard bounce suppresses an address for **operational** mail only.

---

## O4.7 · Volume

Derived from [O5](O5-performance-scale.md). Per month:

| Scenario | Lead pairs | Operational | Security | **Total** |
|---|---|---|---|---|
| Launch | ~30 | ~60 | ~10 | **~100** |
| Expected | ~120 | ~250 | ~30 | **~400** |
| Growth | ~400 | ~900 | ~80 | **~1,400** |

All three fit Resend's free tier (3,000/month) — though the free tier's **100/day** cap is the binding constraint in Growth on a busy day, which is why [O10](O10-cost-model.md) budgets the Pro plan from Expected onward.

---

## O4.8 · Acceptance criteria

- `AC-O4-1` Forcing a provider outage still persists the lead and queues the notification.
- `AC-O4-2` Re-raising the same event sends exactly once.
- `AC-O4-3` Two dispatcher workers never double-send.
- `AC-O4-4` Terminal failure of `NTF-001`/`NTF-002` raises S2.
- `AC-O4-5` A suppressed user still receives every security notification.
- `AC-O4-6` A template with an undeclared variable fails the build.
- `AC-O4-7` No message body contains internal notes, budget discussion, rights evidence or storage keys.
- `AC-O4-8` Production sending is blocked until SPF, DKIM and DMARC verify.
- `AC-O4-9` No WhatsApp message is ever transmitted by the system.
