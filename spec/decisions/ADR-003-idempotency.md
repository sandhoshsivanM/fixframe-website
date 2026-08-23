# ADR-003 · One idempotency convention for all state-changing commands

**Status:** ACCEPTED
**Supersedes:** V1 C08 ("POST /api/public/leads with idempotency token") and V1 E03 ("Conversion idempotent") — two ad hoc invocations with no shared definition

## Context

V1 requires idempotency in two unrelated places and defines it in neither:

- **C08** — "POST `/api/public/leads` with idempotency token", with acceptance criterion "duplicate submit protected".
- **E03** — acceptance criterion "conversion idempotent", for the lead→Client+Project transaction.

Part H′ adds a third and more demanding case: **provider webhooks**, which are delivered at-least-once by every managed media provider and will therefore arrive twice in normal operation, not just under user error.

Three independent implementations of "idempotent" in one codebase is three sets of bugs. This ADR defines one.

## Decision

**A single `Idempotency-Key` convention applies to every state-creating or state-transitioning `POST`.**

### Contract

| Aspect | Rule |
|---|---|
| Header | `Idempotency-Key: <client-generated UUIDv4>` |
| Scope | Unique per endpoint + authenticated principal (or per endpoint + IP for public endpoints) |
| Storage | `ENT-IdempotencyRecord`: key, endpoint, principal, SHA-256 of the canonicalised request body, serialised response, HTTP status, `createdAt` |
| Retention | 24 hours, then purged by a scheduled job |
| First request | Executed normally. Key and response persisted **in the same database transaction as the business write.** |
| Replay, matching hash | Stored response and status returned verbatim. The business operation does **not** re-execute. |
| Replay, differing hash | `409 Conflict`, error code `idempotency_key_reuse`. The key was reused for a different payload — a client bug, surfaced rather than absorbed. |
| Concurrent replay | The insert on `(endpoint, principal, key)` is uniquely constrained; the loser polls briefly for the winner's response, then returns it. If the winner has not committed within the window, `409` with `idempotency_in_progress`. |
| Missing header | `400` on endpoints marked `Idempotency: required` in `reference/api.md`. Optional elsewhere. |

Persisting the key inside the business transaction is the load-bearing detail. If the key is written in a separate transaction, a crash between the two produces either a duplicate execution or a permanently poisoned key.

### Where it is required

| Endpoint | Why |
|---|---|
| `API-lead-create` | Public form; double-submit and network retry are routine. V1 C08. |
| `API-lead-convert` | Creates Client + Project + links + activity log. Double execution creates duplicate clients. V1 E03. |
| `API-media-complete` | Upload completion callback. |
| `API-media-webhook` | **Provider webhooks are at-least-once by design.** Key derived from the provider's own event ID, not client-generated. |
| `API-portfolio-publish` | Publish triggers revalidation and rights checks; double execution is wasteful and log-noisy. |
| `API-invoice-create` | V2. Invoice numbers are immutable once issued (V1 E09) — duplicate issuance is a finance defect. |

## Consequences

- One middleware, one entity, one test suite. Applied by attribute on the endpoint.
- The public lead endpoint gets idempotency **and** rate limiting **and** bot protection. They are three different defences: idempotency stops accidental duplication, rate limiting stops volume abuse, bot protection stops automation. V1 mentions all three but treats them as interchangeable in places.
- Webhook keys derive from provider event IDs, so provider-side retries collapse correctly without the client generating anything.
- The 24-hour window is a deliberate trade: long enough to cover any realistic retry, short enough that the table stays small.

## Override condition

If the media provider's webhook delivery guarantees turn out to be exactly-once (none currently claim this credibly), the webhook case could be relaxed. It should not be — defence in depth is cheap here.

## Alternatives considered

**Natural-key deduplication** (e.g. dedupe leads on email + phone + 10-minute window). Rejected as the *primary* mechanism: V1 A3 explicitly requires that a public enquiry is never lost, and C08 requires that duplicate detection "must not silently discard". Natural-key dedupe silently discards by construction. It survives as a **soft flag** for the sales team — duplicate leads are marked, surfaced, and kept — which is what C08 actually asks for.

**Server-generated tokens issued on form render.** Rejected: adds a round-trip, breaks on cached pages, and does nothing for webhooks.
