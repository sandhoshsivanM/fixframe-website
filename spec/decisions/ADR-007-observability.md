# ADR-007 · Observability — Sentry, structured logs, synthetic uptime

**Status:** ACCEPTED
**Closes:** V1's Part L1 requires production "monitoring" with no tooling, no signals and no alert routing

## Context

The failure modes this system actually has are asynchronous and silent:

- A media job dead-letters and nobody notices until the owner asks why a video never appeared.
- Webhook delivery breaks; reconciliation quietly repairs everything, and the broken integration stays broken.
- `JOB-rights-sweep` stops running; expired releases stay published — a legal exposure with no user-visible symptom.
- A notification queue backs up; leads are captured but nobody is told.

None of these produce a 500 on a page a human is looking at. An uptime ping would report the site perfectly healthy through all four.

## Decision

**Three layers, deliberately small.**

| Layer | Tool | Covers |
|---|---|---|
| Errors & traces | **Sentry** (Team plan) | Exceptions, API traces, release health, cron monitors |
| Logs & metrics | **Structured JSON logs** to the platform's log store, queried directly | Request logs, job lifecycle, business events |
| Availability | **Synthetic checks** — Sentry Uptime, or the hosting platform's | Public site, API health, admin login reachability |

Deliberately *not* adopted for MVP: Prometheus/Grafana, an APM vendor beyond Sentry, or a log aggregation platform. At this scale they are more operational surface than the system they observe.

## Rationale

**Sentry** because it covers errors, performance traces and **cron monitors** in one subscription — and cron monitoring is what catches the silent scheduled-job failures above, which is the specific gap that matters here. `$26/month` on the Team plan (annual) with 50k errors included is well inside the budget in [O10](../parts/O10-cost-model.md), and the free Developer tier is genuinely usable through Launch.

**Structured logs over a metrics stack** because every question worth asking at this scale — how many jobs dead-lettered today, how many webhooks failed, how often did reconciliation repair something — is a log query. A time-series database earns its place when you need high-cardinality aggregation over long windows. That is not this product yet.

`traceId` already exists in the error envelope defined in [api.md](../reference/api.md) and is shown to users. Making it the log correlation key costs nothing and means a user-reported error is directly greppable.

## Consequences

- Every log line is JSON with `traceId`, `actorUserId`, `entityType`, `entityId` where applicable. Free text alone is not acceptable.
- **Every scheduled job in [api.md](../reference/api.md) §15 registers a Sentry cron monitor.** A job that stops running must page, not fail silently — `JOB-rights-sweep` most of all.
- Sentry's DSN is public by design; the auth token is not, and lives in the secret manager.
- Logs must never contain secrets, tokens, passwords, full lead briefs or rights evidence — the same rule as `RULE-N3-29` for the audit log.
- PII in Sentry is scrubbed at the SDK boundary before transmission.

## Override condition

Move to a metrics stack when either holds: log-based alerting misses incidents that aggregation would have caught, or log query cost exceeds what a hosted metrics tier would be. Both are measurable, not matters of taste.

## Alternatives considered

**Self-hosted Prometheus + Grafana + Loki.** Free in licence, expensive in attention. Three more services to run, back up and keep alive for a studio with no on-call rotation — observability that is itself an availability risk.

**Platform-native only (hosting provider's built-in metrics).** Cheapest, and rejected because it observes infrastructure rather than business state. It cannot tell you that a rights sweep stopped running, which is the failure with the highest consequence in this system.
