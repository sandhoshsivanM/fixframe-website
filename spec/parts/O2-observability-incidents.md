# Part O2 · Observability & Incident Operations

**Status:** ACCEPTED
**Implements:** [ADR-007](../decisions/ADR-007-observability.md)
**Closes:** V1 L1 lists "monitoring" as a production bullet with no signals, no tooling, no thresholds and no response process.

> Every serious failure mode in this system is silent. An uptime ping would report the site perfectly healthy while media processing has been stalled for a day, notifications have stopped, and the rights sweep has not run since Tuesday.

---

## O2.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O2-001` | A stated availability target, measured rather than asserted. |
| `REQ-O2-002` | Every asynchronous subsystem emits a health signal, so silence is distinguishable from health. |
| `REQ-O2-003` | Every scheduled job is monitored for **non-execution**, not only for failure. |
| `REQ-O2-004` | Alerts carry a severity that determines routing and response time. |
| `REQ-O2-005` | Every alert names the first diagnostic step and whether a developer is required. |
| `REQ-O2-006` | Incidents have a defined lifecycle ending in a verified close. |

---

## O2.2 · Availability target

| Surface | Target | Measured by |
|---|---|---|
| Public site | **99.5%** monthly | Synthetic check, 1-minute interval, three geographies |
| Lead submission | **99.9%** monthly | Synthetic POST to a staging-flagged endpoint |
| Admin | 99.0% monthly | Synthetic login reachability |
| Media processing | 95% of jobs to `Ready` within 30 min | Job duration percentile |

- `RULE-O2-1` — Lead submission carries a **higher** target than the site itself. A visitor who cannot read the About page comes back; a lost enquiry is revenue that never announces itself. This mirrors V1 A3's first rule.
- `RULE-O2-2` — 99.5% is roughly 3.6 hours a month. It is chosen to be *honestly achievable without an on-call rotation*. Publishing 99.99% for a studio with no night staff would be a target nobody defends at 3 a.m.

---

## O2.3 · Signals

### API
`RED` per route: **R**ate, **E**rrors (4xx/5xx separated), **D**uration p50/p95/p99. Plus auth failure rate and `403` rate — a spike in denials is either a permission bug or an attack, and both want attention.

### Media pipeline — the subsystem that fails quietly

| Signal | Alert when |
|---|---|
| Queue depth | > 50 jobs, or > 10 for 15 min |
| Oldest job age | > 2 h (the `Processing` ceiling in [H′5](H-prime-media-processing.md)) |
| Dead-letter rate | Any job reaching `DeadLettered` |
| Webhook failure rate | > 5% over 15 min, **or zero webhooks received in 6 h while jobs are in flight** |
| Reconciliation repair rate | > 5 repairs/hour |
| Signature rejections | > 10 in 5 min |
| **`Ready` assets with no primary poster** | Any — a data-integrity regression that throws no error and renders as a broken image ([O1.7](O1-backup-recovery.md)) |

- `RULE-O2-3` — **Zero webhooks received while jobs are in flight is an alert.** Reconciliation will quietly repair everything and the integration stays broken indefinitely. Self-healing that conceals a fault is not a virtue ([`RULE-H6-2`](H-prime-media-processing.md)).

### Rights — highest consequence, lowest visibility

| Signal | Alert when |
|---|---|
| `JOB-rights-sweep` execution | **Missed a scheduled run** — cron monitor |
| Releases expiring in 30 days | Count > 0 → digest, not an alert |
| Expired but still published | **Any. Ever.** S1 |
| Unpublish-on-lapse failure | Any step 1–3 of [R4](R-publishing-rights.md) failing |

- `RULE-O2-4` — "Expired but still published" is a standing invariant check, independent of the sweep that is supposed to prevent it. Monitoring only the job trusts the thing being monitored.

### Notifications, database, storage
Queue depth and age; `Failed` rate > 5%; **`NTF-001`/`NTF-002` failure is S2** — a captured lead nobody was told about. Connection pool utilisation > 80%; storage growth vs. the [O5](O5-performance-scale.md) projection; slow queries > 1 s. Backup job outcome, restore verification outcome, replication lag.

### Scheduled jobs
- `RULE-O2-5` — **Every job in [api.md](../reference/api.md) §15 registers a Sentry cron monitor** with an expected interval and grace period. A job that stops running raises `NTF-028`. This is the single highest-value monitor in the system: the failure it catches has no other symptom.

---

## O2.4 · Severity, routing and response

| Sev | Definition | Route | Response | Hours |
|---|---|---|---|---|
| **S1** | Public site down · lead capture broken · data loss · expired rights still published · restore verification failed | Push + phone → developer, email → owner | 15 min | 24/7 |
| **S2** | Media processing stalled · notifications failing · admin login broken for some users · backup failed · webhook integration down | Email + chat → developer and owner | 2 business hours | Business |
| **S3** | Single job dead-lettered · degraded performance · one user blocked | Dashboard queue, daily digest | 1 business day | Business |
| **S4** | Cosmetic, non-blocking, no data risk | Backlog | Next cycle | — |

- `RULE-O2-6` — Severity is set by **impact, not cause**. A media job failing is S3; the same failure blocking a shoot delivery due tomorrow is S2. The operator may escalate; nobody may de-escalate without recording why.
- `RULE-O2-7` — Every alert carries: what broke, blast radius, **first diagnostic step**, and whether a developer is required per [O3](O3-support-boundaries.md). An alert the owner cannot act on and cannot escalate is noise.
- `RULE-O2-8` — S1 and S2 alerts route to a **human, not a dashboard**. Nobody watches a dashboard at 9 p.m.

---

## O2.5 · Incident lifecycle

```
Detect → Acknowledge → Triage (severity + O3 boundary) → Communicate
       → Mitigate → Verify → Close → Post-incident (S1/S2)
```

| Step | Rule |
|---|---|
| Acknowledge | Within the response window. Unacknowledged S1 re-alerts every 5 min |
| Triage | Assign severity and answer *owner, studio, or developer?* ([O3](O3-support-boundaries.md)) |
| Communicate | S1 affecting the public site: the owner is told before a client tells them |
| Mitigate | Stop the bleeding. Root cause can wait; a rollback is a legitimate mitigation |
| Verify | **The originating signal must return to normal.** Closing on "looks fine" is how incidents recur |
| Close | Timeline, impact and actions recorded |
| Post-incident | S1/S2 within 5 business days |

- `RULE-O2-9a` — Where the incident was **reported by a human rather than raised by a signal**, verification cannot mean "the alert cleared" — no alert fired. It requires (a) reproducing the original report and confirming it is resolved, and (b) **adding the missing signal before close**, so the same failure is machine-detected next time. An incident a customer found and no monitor saw is a monitoring defect as much as a product one.
- `RULE-O2-9` — Post-incident review is **blameless and mandatory for S1/S2**. It asks what made the failure possible and what would have caught it sooner — a monitor, a test, a gate.
- `RULE-O2-10` — Every post-incident produces at least one concrete change: a test, a monitor, a runbook line, or an explicit decision to accept the risk. "Be more careful" is not an action.
- `RULE-O2-11` — Incidents caused by an absent monitor add that monitor before close.

---

## O2.6 · Runbooks

One per S1/S2 alert, in `docs/runbooks/`, each stating: symptom · blast radius · first diagnostic · mitigation · verification · escalation. Required for: site down · lead capture failing · media pipeline stalled · webhooks not arriving · rights sweep missed · expired rights still published · backup failed · restore verification failed · database unreachable · notification queue stalled.

- `RULE-O2-12` — A runbook is written **when its alert is created**, not after the alert first fires.
- `RULE-O2-13` — Runbooks are validated in the quarterly DR drill ([O1.8](O1-backup-recovery.md)) by someone who did not write them.

---

## O2.7 · Acceptance criteria

- `AC-O2-1` Stopping a scheduled job raises `NTF-028` within one interval plus grace.
- `AC-O2-2` Disabling webhook delivery alerts within 6 hours, **even though reconciliation is repairing successfully**.
- `AC-O2-3` A published project whose rights have expired raises S1 within one sweep interval.
- `AC-O2-4` An S1 alert reaches a human by push, not only a dashboard.
- `AC-O2-5` Every alert names its first diagnostic step and its O3 boundary.
- `AC-O2-6` `traceId` in a user-facing error resolves to the request's logs and Sentry event.
- `AC-O2-7` No log line or Sentry event contains a secret, token, full lead brief or rights evidence.
- `AC-O2-8` Every S1/S2 alert has a runbook before it can fire.
