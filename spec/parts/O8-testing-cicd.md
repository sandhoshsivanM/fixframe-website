# Part O8 · Testing, CI & Release

**Status:** ACCEPTED
**Implements:** [ADR-008](../decisions/ADR-008-testing-ci.md)
**Closes:** V1 Part M2 is a manual QA checklist. No framework, no automation, no CI, no gates, no branching model, no release process, no rollback.

---

## O8.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O8-001` | Every business rule is covered by an automated test or explicitly recorded as manual. |
| `REQ-O8-002` | Asynchronous failure paths are tested, not only happy paths. |
| `REQ-O8-003` | Database constraints are exercised against a real PostgreSQL instance. |
| `REQ-O8-004` | CI gates block merge; they are not advisory. |
| `REQ-O8-005` | Every release is reversible within a stated time. |
| `REQ-O8-006` | Migrations are never destructive in the same release as the code depending on the change. |
| `REQ-O8-007` | Staging never contains real enquirer data unless explicitly agreed. |

---

## O8.2 · Test layers

| Layer | Runs on | Target | Duration |
|---|---|---|---|
| Unit | Every push | Domain rules, state machines, permission resolution, rights checklist derivation | < 30 s |
| Integration | Every push | Repositories, transactions, constraints, migrations — real Postgres via Testcontainers | < 4 min |
| Contract | Every push | Public DTO snapshots | < 20 s |
| Worker | Every push | Retry, backoff, dead-letter, reconciliation, out-of-order webhooks | < 90 s |
| E2E | Staging deploy | The journeys in O8.4 | < 10 min |
| Load | Pre-release | API budgets at Growth volumes ([O5](O5-performance-scale.md)) | < 15 min |
| Accessibility | Every push + staging | axe on every public route ([O9](O9-accessibility-operations.md)) | < 2 min |
| Spec | Every push | `check-traceability.mjs` | < 5 s |

### Coverage policy

Not a percentage. Percentages reward testing trivial getters and say nothing about whether the dangerous paths are covered.

| Must be covered | Standard |
|---|---|
| Every `RULE-*` in the specification | A `TC-*` in [M′](M-prime-test-cases.md), or recorded as `MAN` with a reason |
| Every `ENT-MediaAsset` state transition | Including **illegal** transitions |
| Every permission check | Both grant and denial |
| Every `409`/`422` business error | Triggered deliberately |
| Every scheduled job | Including the no-op case |
| Rights publish gate | Every release type, expired and unexpired |

- `RULE-O8-1` — A new `RULE-*` without a `TC-*` fails the traceability gate. Specification and tests move together or the specification rots.

---

## O8.3 · CI pipeline

Sequential gates. **Every one blocks merge.**

| # | Gate | Fails on |
|---|---|---|
| 1 | Format & lint | Any violation |
| 2 | **Secret scan** | Any credential, including in history ([`RULE-O6-6`](O6-security-operations.md)) |
| 3 | Build | Warnings as errors |
| 4 | Unit | Any failure |
| 5 | Integration | Any failure |
| 6 | Contract snapshots | Any unreviewed public-payload change |
| 7 | **Migration test** | Migration fails forward or on rollback |
| 8 | **Dependency scan** | Critical or high CVE in a production dependency |
| 9 | **Traceability** | Dangling reference, silent gap, ungated unknown |
| 10 | Lighthouse budgets | Any budget exceeded ([O5.3](O5-performance-scale.md)) |
| 11 | Accessibility | Any serious or critical axe violation |

Post-merge, on staging: deploy → migrate → E2E → smoke. On release: load test → manual approval → production.

- `RULE-O8-2` — Gate 6 exists because "no internal data in public payloads" is asserted in four places across V1 and V2 and is otherwise enforced only by reviewer attention. A snapshot turns it into a build failure.
- `RULE-O8-3` — Gate 9 is why the validator was written. A spec check that runs only when someone remembers is a spec check that has stopped running.
- `RULE-O8-4` — No gate is bypassable by re-running. Overriding requires a reviewed change to the gate itself.

---

## O8.4 · E2E journeys

Mapped to the walkthrough tests, at 390 / 768 / 1024 / 1440 (V1 M2).

| Journey | Covers |
|---|---|
| Visitor → work → case study → lead submitted → visible in CRM | V1 A2 funnel; `TC-071`, `TC-072` |
| Login → MFA → session → revoke | `TC-011`–`TC-013`, `TC-028` |
| Upload video → processing → poster → attach → publish blocked by rights → clear → published | `TC-001`, `TC-053`, `TC-056` |
| Package price edit → live publicly, no deployment | `TC-035` |
| Won lead → convert → project → milestones → review link → feedback → task | `TC-067`, `TC-065` |
| Rights expiry → unpublish → public 404 → CDN purged | `TC-007` |
| Media failure → alert → retry → `Ready` | [O2 walkthrough](../traceability/walkthrough-operations.md) |

- `RULE-O8-5` — E2E runs against a **Growth-seeded** staging database ([`RULE-O5-6`](O5-performance-scale.md)), not forty rows.

---

## O8.5 · Environments and seed data

| Env | Database | Media | Data |
|---|---|---|---|
| Local | Testcontainers or local Postgres | Dev R2 bucket, Stream sandbox | Factory-generated |
| Staging | Separate Neon project | Separate bucket + prefix | **Synthetic only** |
| Production | Production Neon | Production bucket | Real |

- `RULE-O8-6` — Staging holds **no real enquirer data** — V1 L1 required this and gave no mechanism. Enforced by the seeding process generating synthetic records, never by copying production.
- `RULE-O8-7` — If production data is ever needed for debugging, it is anonymised on export using the same routine as [O7.3](O7-data-lifecycle.md), and the export is logged and time-boxed.
- `RULE-O8-8` — Staging and production **never share** a bucket, database or Stream account ([V1 L1](../README.md)). A cross-environment write is a data-loss event.
- `RULE-O8-9` — Staging is `noindex` and behind basic auth. An indexed staging site competes with production for the studio's own search terms.

---

## O8.6 · Branching and release

Trunk-based. Short-lived branches, squash merge, `main` always deployable.

| Step | Rule |
|---|---|
| Branch | From `main`, lifetime under 3 days |
| Merge | All gates green, one review |
| Staging | Automatic on merge |
| Release | Tagged `v<major>.<minor>.<patch>` from `main` |
| Production | Manual approval on the tag |
| Hotfix | Branch from the tag, same gates, forward-merged to `main` |

- `RULE-O8-10` — Deploys happen during business hours, when someone can watch. A Friday-evening deploy that fails is discovered by the studio's clients.

---

## O8.7 · Migrations and rollback

| Layer | Method | Time |
|---|---|---|
| Application | Redeploy the previous tag | < 5 min |
| Configuration | Revert and redeploy | < 5 min |
| Database | **Forward fix, not rollback** | Varies |
| Data corruption | Restore per [O1](O1-backup-recovery.md) | Within RTO |

### Expand / migrate / contract

- `RULE-O8-11` — Destructive schema change never ships in the same release as the code that depends on it. Three releases:

| Release | Action | Rollback safety |
|---|---|---|
| **1 · Expand** | Add the new column, nullable. Write both, read old | Old code still works |
| **2 · Migrate** | Backfill; read new, write both | Either version works |
| **3 · Contract** | Drop the old column | Only after release 2 is proven |

- `RULE-O8-12` — Between releases 1 and 2 the previous application version still runs against the new schema. **This is what makes application rollback safe**, and it is why database rollback is not the plan.
- `RULE-O8-13` — A PITR restore point is taken before every production migration ([`RULE-O1-6`](O1-backup-recovery.md)).
- `RULE-O8-14` — Every migration is tested forward **and** with the prior application version against the new schema.

---

## O8.8 · Acceptance criteria

- `AC-O8-1` A new `RULE-*` without a test fails CI.
- `AC-O8-2` Integration tests run against real PostgreSQL and exercise the partial unique index, the email-or-phone constraint and `citext` behaviour.
- `AC-O8-3` A public DTO gaining an internal field fails the contract gate.
- `AC-O8-4` A critical CVE in a production dependency fails the build and cannot be re-run past.
- `AC-O8-5` A dangling spec reference fails the build.
- `AC-O8-6` Application rollback to the previous tag completes within 5 minutes.
- `AC-O8-7` The previous application version runs correctly against the post-expand schema.
- `AC-O8-8` Staging contains no real enquirer data.
- `AC-O8-9` E2E passes at all four breakpoints against a Growth-seeded database.
