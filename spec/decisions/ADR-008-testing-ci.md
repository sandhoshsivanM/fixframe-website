# ADR-008 · Testing stack and CI — xUnit, Playwright, Testcontainers, GitHub Actions

**Status:** ACCEPTED
**Closes:** V1's Part M2 is a manual QA checklist. No framework, no CI, no gates, no branching model, no rollback.

## Context

V1 ships 76 acceptance criteria across Increment 1 alone with no mechanism to check any of them repeatedly. Two properties of this system make manual-only testing particularly unsafe:

- **The critical paths are asynchronous.** "Kill the webhook path and the asset still reaches `Ready`" (`TC-053`) is not a click-through test.
- **The critical paths are also the rare ones.** Rights expiry, dead-lettering, reconciliation and last-admin-standing are the behaviours nobody exercises by hand and everybody depends on.

## Decision

| Layer | Tool | Scope |
|---|---|---|
| Unit | **xUnit** + FluentAssertions | Domain rules, state machines, permission resolution, checklist derivation |
| Integration | **xUnit + Testcontainers** (real PostgreSQL) | Repositories, transactions, migrations, the invariants that are database constraints |
| Contract | **Snapshot tests** over public DTOs | The "no storage keys, no internal notes in public payloads" rule, enforced mechanically |
| Worker | xUnit with a **fake `IMediaProcessingProvider`** | Retry, backoff, dead-letter, reconciliation, out-of-order webhooks |
| E2E | **Playwright** | The handover journeys in [O8](../parts/O8-testing-cicd.md), across the breakpoints V1 M2 names |
| Spec | **`check-traceability.mjs`** | Runs in CI as a gate, exactly like a test |
| CI/CD | **GitHub Actions** | Gates, migrations, deploy, rollback |

## Rationale

**Testcontainers over an in-memory or SQLite substitute** is the load-bearing choice. A large share of this specification's invariants *are* Postgres constructs — the partial unique index guaranteeing one active showreel, the check constraint requiring email-or-phone on a lead, `citext` case-insensitivity, `jsonb` block validation. An in-memory provider passes tests those constraints would fail, which is worse than no test: it manufactures confidence.

**Playwright over Cypress** for multi-browser and mobile-viewport coverage in one runner — V1 M2 asks for 390/768/1024/1440 plus real mobile testing.

**Contract snapshots** because "never leaks internal data" is asserted in four separate places across V1 and V2 and is otherwise enforced only by reviewer attention. A snapshot over the serialised public DTO turns it into a failing build.

**The traceability validator as a CI gate** is the point of having written it. A spec check that only runs when someone remembers is a spec check that stops running.

## Consequences

- Integration tests need Docker in CI. GitHub Actions provides it.
- A migration test runs **every** migration against a seeded database each build, forward and rolled back. Migrations are the single most common cause of a failed deploy.
- Media fixtures are small real files — a 3-second H.264 clip, a corrupt container, a zero-byte file — committed to the repo. Synthetic bytes do not exercise `ffprobe`.
- **No mocking of our own database.** Mock the provider at the `IMediaProcessingProvider` seam and nothing below it.
- Test data is built by factories, never by shared fixtures, so tests stay order-independent.

## Override condition

None foreseen. If the team moves off GitHub, the CI definition ports; nothing above depends on the runner.

## Alternatives considered

**NUnit / MSTest.** Equivalent in capability. xUnit chosen for its per-test isolation model, which suits parallel integration tests.

**In-memory EF provider for integration tests.** Rejected for the reason above — it silently passes tests that real constraints would fail.

**Recorded provider responses (VCR-style) instead of a fake.** Rejected: the behaviour under test is *absence* — the webhook that never arrives. There is nothing to record.
