# Part H′ · Media Processing Contract

**Status:** ACCEPTED (one gated unknown — `UNRESOLVED-012`)
**Supersedes:** V1 H3, which described a nine-step happy path and specified none of its failure behaviour
**Implements:** [ADR-002](../decisions/ADR-002-media-processing.md), [ADR-003](../decisions/ADR-003-idempotency.md)

> V1's H3 ends at "publish validation checks Ready state." It does not say what authenticates the callback, what happens when it never arrives, how many times a failed job retries, or how an asset stranded mid-state is recovered. Those are not edge cases — a lost webhook is a weekly event at any real volume, and it is the failure that leaves an owner staring at a spinner with no path forward.

---

## H′1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-H-101` | Source bytes never transit API process memory. |
| `REQ-H-102` | The `MediaAsset` state machine is owned by us; provider status maps into it through the adapter. |
| `REQ-H-103` | Every callback is authenticated, replay-protected and idempotent. |
| `REQ-H-104` | Every job has a bounded retry policy and a terminal dead-letter state. |
| `REQ-H-105` | No asset can be stranded indefinitely in a non-terminal state. |
| `REQ-H-106` | A failure is always visible to the owner with a retry path that does not require re-entering metadata. |
| `REQ-H-107` | Processing failure never results in publication. |

---

## H′2 · Pipeline

| # | Actor | Action | Result |
|---|---|---|---|
| 1 | Admin UI | `API-media-upload-session` with kind, role, purpose, filename, byte size, content type | — |
| 2 | API | Validate permission, role, declared size and MIME against policy | `409` if invalid |
| 3 | API | Create `ENT-MediaAsset` `status = PendingUpload` | Asset ID issued |
| 4 | API | Request an upload target from `IMediaProcessingProvider` | Signed, expiring, single-purpose URL |
| 5 | Browser | Upload **directly to the provider or R2** — resumable/multipart where supported | `status = Uploading` on first byte |
| 6 | Admin UI | `API-media-complete` (idempotency required) | `status = Uploaded` |
| 7 | API | Enqueue `ENT-MediaProcessJob` in the **same transaction** as the status change | `status = Processing` |
| 8 | Worker / provider | Probe, transcode, extract frames, build derivatives | — |
| 9 | Provider | `API-media-webhook` | `status = Ready` or `Failed` |
| 10 | Admin UI | Select poster, set crop and focal point, pair raw/final, attach | — |
| 11 | Publish | Validates `status = Ready` **and** a primary poster exists | Blocked otherwise |

Step 7's transactional coupling is the load-bearing detail. Enqueueing outside the transaction admits both orphaned jobs (enqueued, commit failed) and lost work (committed, enqueue failed).

**Photo path** (per [ADR-002](../decisions/ADR-002-media-processing.md)) is identical except that steps 8–9 run in the in-process ImageSharp worker and complete synchronously against the job record rather than via webhook. The state machine is the same, so the admin experience does not fork.

---

## H′3 · Webhook authentication

`API-media-webhook` is `Anonymous` at the routing layer and **never unauthenticated**.

| Control | Rule |
|---|---|
| Signature | HMAC-SHA256 over the **raw request body** using a shared secret from the secret manager. Verified before the body is parsed |
| Comparison | Constant-time. A short-circuiting compare is a timing oracle on the secret |
| Timestamp | Signed `timestamp` header; reject outside ±5 minutes |
| Replay | Provider `eventId` is the idempotency key ([ADR-003](../decisions/ADR-003-idempotency.md)). A replayed event returns the stored response without re-executing |
| Ordering | Events may arrive **out of order**. Handlers are written as assertions about final state, never as increments |
| Unknown asset | `202 Accepted`, logged. Never `404` — a 404 makes providers retry a message that will never succeed |
| Transport | HTTPS only; provider IP allowlist where the provider publishes stable ranges |
| Secret rotation | Two secrets valid simultaneously during rotation; either verifies |

> `RULE-H3-1` — The webhook body is **untrusted input**. It may name an asset the caller does not own, a state that is not a legal transition, or a job that has already terminated. Every field is validated against our own records before anything is written.

---

## H′4 · Retry, backoff and dead-lettering

Applies to `ENT-MediaProcessJob`.

| Attempt | Delay before |
|---|---|
| 1 | immediate |
| 2 | 30 s |
| 3 | 2 min |
| 4 | 8 min |
| 5 | 30 min |
| — | → `DeadLettered` |

- `RULE-H4-1` — Backoff carries ±20% jitter. Synchronised retries after a provider outage are a self-inflicted thundering herd.
- `RULE-H4-2` — **Only transient failures retry.** A validation failure (unsupported codec, corrupt container, zero-length file) is terminal on attempt 1 — retrying it wastes 40 minutes and teaches the owner that the retry button does nothing.
- `RULE-H4-3` — `DeadLettered` raises `NTF-012` to the Owner and surfaces on `F01`.
- `RULE-H4-4` — A dead-lettered job is manually retriable via `API-media-retry`, which resets `attemptCount` and re-enqueues. **Metadata already entered is preserved** (`REQ-H-106`, V1 F03).
- `RULE-H4-5` — The source object is retained for a failed job so retry does not require re-upload (V1 F03). Retention duration is `UNRESOLVED-012`.

### Failure classification

| Class | Examples | Retry |
|---|---|---|
| Transient | Provider 5xx, timeout, rate limit, network reset | Yes |
| Terminal-input | Unsupported codec, corrupt file, zero bytes, size over policy | No — `Failed` immediately |
| Terminal-config | Auth rejected, quota exhausted, bucket missing | No — `DeadLettered`, escalate. Retrying a misconfiguration cannot fix it |
| Ambiguous | Provider reports unknown job | Reconcile before deciding |

---

## H′5 · Timeout policy

No state is unbounded.

| State | Limit | On expiry |
|---|---|---|
| `PendingUpload` | 24 h | → `Archived`, reason `abandoned_upload`. Storage reclaimed |
| `Uploading` | 6 h without progress | → `Failed`, reason `upload_stalled`. Retriable |
| `Uploaded` | 15 min without a job | Reconciliation enqueues one — indicates a lost enqueue |
| `Processing` | 2 h without a terminal callback | Reconciliation probes the provider |
| `Processing` | 6 h total | → `DeadLettered`, escalate |

---

## H′6 · Reconciliation — `JOB-media-reconcile`

Every 15 minutes. **This is the mechanism V1 has no answer for.**

For each asset in a non-terminal state past its threshold:

1. Query `IMediaProcessingProvider.GetAssetStatus(providerAssetId)`.
2. Reconcile:

| Provider says | We say | Action |
|---|---|---|
| Ready | `Processing` | Repair to `Ready`, build derivative records, raise `NTF-013` — a webhook was lost |
| Failed | `Processing` | Transition to `Failed` with the provider's reason |
| Still processing | `Processing` | Leave; escalate at the 6h ceiling |
| Unknown asset | `Processing` | `Failed`, reason `provider_asset_missing` |
| Unreachable | any | Leave, count consecutive failures; alert at 3 |
| Ready | `Ready` | No-op — reconciliation is idempotent by construction |

3. Assets in `Uploaded` with no job get one enqueued.
4. Every repair writes `ENT-ActivityLog` with actor `system`.

- `RULE-H6-1` — Reconciliation is **idempotent and safe to run concurrently** with webhook delivery. Both paths converge on the same terminal state; whichever arrives first wins and the second is a no-op.
- `RULE-H6-2` — A repair frequency above a threshold indicates a webhook delivery problem and is worth alerting on independently. Silent self-healing that hides a broken integration is not a virtue.

---

## H′7 · State machine — authoritative

Preserves V1 I3 exactly and specifies who may trigger each transition.

| From | To | Trigger | Guard |
|---|---|---|---|
| — | `PendingUpload` | `API-media-upload-session` | `PERM-media-write` |
| `PendingUpload` | `Uploading` | First byte received | — |
| `PendingUpload` | `Archived` | Timeout 24h | — |
| `Uploading` | `Uploaded` | `API-media-complete` | Idempotency key required |
| `Uploading` | `Failed` | Timeout / upload error | — |
| `Uploaded` | `Processing` | Job enqueued | Same transaction |
| `Processing` | `Ready` | Webhook or reconciliation | Derivatives recorded |
| `Processing` | `Failed` | Webhook, reconciliation, or terminal classification | `failureReason` required |
| `Failed` | `Processing` | `API-media-retry` | Source retained |
| `Ready` | `Archived` | `API-media-archive` | Not in active published use |
| `Archived` | `Ready` | Restore | Derivatives still present |

- `RULE-H7-1` — **Only `Ready` may be selected for public playback** (V1 I3).
- `RULE-H7-2` — `Failed` never auto-publishes and never auto-retries beyond policy (V1 F01).
- `RULE-H7-3` — `Archived` is excluded from selection but preserved per retention policy.
- `RULE-H7-4` — Illegal transitions return `409` and are logged. The state machine is enforced in one place, not scattered across handlers.

---

## H′8 · Publish-time validation

`API-portfolio-publish` and `API-reel-publish` independently verify:

| Check | Failure |
|---|---|
| Cover media `status = Ready` | `422 media_not_ready` |
| A primary poster derivative exists | `422 media_not_ready` — V1 requires a poster for public autoplay video (F03, C01) |
| Every referenced media asset is `Ready` and `visibility = Public` | `422 media_not_ready` |
| Rights cleared | `422 rights_not_cleared` (Part R) |

Checked in the publish transaction, not in the wizard. The wizard shows the same state for a good experience; the API is what makes it true.

---

## H′9 · Acceptance criteria

- `AC-H-1` Source bytes never pass through the API process — verified by inspecting request sizes at the API boundary under a large upload.
- `AC-H-2` A webhook with an invalid signature is rejected with no state change.
- `AC-H-3` A replayed webhook produces exactly one state transition.
- `AC-H-4` Out-of-order webhooks converge on the correct terminal state.
- `AC-H-5` A transient failure retries per schedule; a terminal-input failure does not retry at all.
- `AC-H-6` **Killing the webhook path entirely still results in a `Ready` asset within one reconciliation cycle.** This is the headline test — it is the failure V1 cannot survive.
- `AC-H-7` A dead-lettered job is retriable without re-entering metadata.
- `AC-H-8` No asset remains in a non-terminal state beyond its ceiling.
- `AC-H-9` Publishing is refused when any referenced asset is not `Ready`.
- `AC-H-10` An abandoned upload is reclaimed within 24 h.

---

## H′10 · Open question

| ID | Question | Owner | Gate |
|---|---|---|---|
| `UNRESOLVED-012` | Retention: how long are failed-job sources, abandoned uploads and archived masters kept before deletion? Drives storage cost and any data-deletion obligation. | Studio / Legal | `G07` |
