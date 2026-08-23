# Part M′ · Test Case Register — Increment 1 scope

**Status:** ACCEPTED
**Scope:** P0 only. Increment 2 adds the strategy (framework, CI, coverage policy); Increment 3 extends the register across the full specification.
**Closes:** V1's Part M2 is a manual QA checklist with no identifiers, so nothing could reference a test. The traceability chain's `Test` link had nowhere to point.

Each case names the acceptance criteria it discharges. `AUTO` = automated (unit, integration or E2E). `MAN` = manual, because it needs human judgement or a real device.

---

## Rights — Part R

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-001` | Publish a project with an outstanding `Required` release → `422 rights_not_cleared`, outstanding list returned | AUTO | `AC-R01-1` |
| `TC-002` | Publish **via API directly**, bypassing the wizard, with rights unmet → identical refusal | AUTO | `AC-R01-1`, `RULE-R3-1` |
| `TC-003` | Fetch rights evidence as an authenticated user without `PERM-rights-read` → `403` | AUTO | `AC-R01-2` |
| `TC-004` | Every release status transition appears in `ENT-ActivityLog` with actor and timestamp | AUTO | `AC-R01-3` |
| `TC-005` | Add a music block to a clear draft → checklist re-derives, project re-blocks | AUTO | `AC-R01-4`, `REQ-R-002` |
| `TC-006` | Release expiring in 29 days → appears in Expiring soon, `NTF-015` raised **once** | AUTO | `AC-R02-1`, `REQ-R-008` |
| `TC-007` | Expire a release → dependent project `Unpublished`, public route 404s, **CDN cache purged** | AUTO | `AC-R02-2`, `REQ-R-006` |
| `TC-008` | Renew a release → new row created, superseded row retained | AUTO | `AC-R02-3` |
| `TC-009` | Mark a release `NotRequired` without a reason → rejected | AUTO | `RULE-R5-1` |
| `TC-010` | Rights evidence never appears in any public API payload | AUTO | `REQ-R-007` |

---

## Authentication & administration — Part N

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-011` | Unknown account vs wrong password → identical body, status and timing within tolerance | AUTO | `AC-N01-1`, `REQ-N-008` |
| `TC-012` | 5 failed logins → lockout; correct release after the window | AUTO | `AC-N01-2` |
| `TC-013` | MFA-enrolled login issues no session before the challenge succeeds | AUTO | `AC-N01-3` |
| `TC-014` | Recovery code cannot be reused | AUTO | `AC-N02-1` |
| `TC-015` | TOTP accepts ±1 step, rejects ±2 | AUTO | `AC-N02-2` |
| `TC-016` | `/auth/password/forgot` responds identically for known and unknown addresses | AUTO | `AC-N03-1` |
| `TC-017` | Password reset token single-use; reset revokes all sessions | AUTO | `AC-N03-2`, `AC-N03-3` |
| `TC-018` | Invitation applies exactly the recorded roles; expired invitation cannot create a user | AUTO | `AC-N04-1`, `AC-N04-2` |
| `TC-019` | Unconfirmed MFA enrollment does not gate login | AUTO | `AC-N05-1` |
| `TC-020` | Recovery codes unrecoverable after acknowledgement | AUTO | `AC-N05-2` |
| `TC-021` | Password change requires current password and raises `NTF-020` | AUTO | `AC-N06-1` |
| `TC-022` | **Last admin standing** — demotion, deactivation and role-permission edit all refused with `409` | AUTO | `AC-N07-1`, `REQ-N-005` |
| `TC-023` | Deactivation terminates sessions within one request cycle | AUTO | `AC-N07-2` |
| `TC-024` | Deactivated user's audit history still resolves to a named actor | AUTO | `AC-N07-3` |
| `TC-025` | Two roles yield the union of permissions | AUTO | `AC-N08-1` |
| `TC-026` | Revoking a permission takes effect within 60s, **without re-login** | AUTO | `AC-N08-2` |
| `TC-027` | Rendered J2 matrix matches seeded role-permission data | AUTO | `AC-N08-3` |
| `TC-028` | Revoked session's next request returns `401` | AUTO | `AC-N09-1` |
| `TC-029` | No API path mutates an `ENT-ActivityLog` entry | AUTO | `AC-N10-1`, `RULE-N3-27` |
| `TC-030` | Rights transitions, permission grants, publish and unpublish all appear in the audit log | AUTO | `AC-N10-2` |
| `TC-031` | No secret material in any audit entry | AUTO | `AC-N10-3`, `RULE-N3-29` |

---

## CMS completion — Part F′

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-032` | New service live on `/services` with no deployment | AUTO | `AC-F10-1`, `REQ-F-101` |
| `TC-033` | Deactivated service leaves the public API **and** the lead form service list | AUTO | `AC-F10-2` |
| `TC-034` | Archiving a referenced service → `409 dependency_in_use` | AUTO | `AC-F10-3`, `REQ-F-102` |
| `TC-035` | **Package price change live without deployment** — V1's `AC-C07-1`, previously unsatisfiable | AUTO | `AC-F11-1` |
| `TC-036` | Lead started from a package arrives carrying `packageId` | AUTO | `AC-F11-2`, `RULE-F11-3` |
| `TC-037` | No active packages → public route and nav entry disappear | AUTO | `AC-F11-3` |
| `TC-038` | Unapproved testimonial never appears publicly | AUTO | `AC-F12-1`, `REQ-F-103` |
| `TC-039` | Editing an approved quote returns it to `Pending` | AUTO | `AC-F12-2`, `RULE-F12-3` |
| `TC-040` | `/privacy` and `/terms` resolve and are linked from the lead consent step | AUTO | `AC-F13-1`, `REQ-F-104` |
| `TC-041` | Draft page edit invisible publicly before publish; system pages undeletable | AUTO | `AC-F13-2`, `AC-F13-3` |
| `TC-042` | Phone-number change propagates everywhere without deployment | AUTO | `AC-F14-1` |
| `TC-043` | Nav item cannot point at an unpublished or missing route | AUTO | `AC-F14-2` |
| `TC-044` | New category appears in the public filter and CMS pickers; in-use category cannot be archived | AUTO | `AC-F15-1`, `AC-F15-2`, `REQ-F-105` |
| `TC-045` | Tag merge preserves every association | AUTO | `AC-F15-3` |
| `TC-046` | Category slug change leaves project canonical URLs untouched | AUTO | `AC-F15-4` |

---

## Media processing — Part H′

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-047` | Large upload: no source bytes traverse the API process | AUTO | `AC-H-1`, `REQ-H-101` |
| `TC-048` | Invalid webhook signature → rejected, no state change | AUTO | `AC-H-2`, `REQ-H-103` |
| `TC-049` | Webhook outside the ±5 min window → rejected | AUTO | `REQ-H-103` |
| `TC-050` | Replayed webhook → exactly one state transition | AUTO | `AC-H-3` |
| `TC-051` | Out-of-order webhooks converge on the correct terminal state | AUTO | `AC-H-4`, `RULE-H3-1` |
| `TC-052` | Transient failure retries per schedule; terminal-input failure does not retry | AUTO | `AC-H-5`, `RULE-H4-2` |
| `TC-053` | **Webhook path disabled entirely → asset still reaches `Ready` within one reconciliation cycle** | AUTO | `AC-H-6`, `REQ-H-105` |
| `TC-054` | Dead-lettered job retriable with metadata preserved | AUTO | `AC-H-7`, `REQ-H-106` |
| `TC-055` | No asset exceeds its state ceiling | AUTO | `AC-H-8` |
| `TC-056` | Publish refused when a referenced asset is not `Ready` | AUTO | `AC-H-9`, `REQ-H-107` |
| `TC-057` | Abandoned upload reclaimed within 24h | AUTO | `AC-H-10` |
| `TC-058` | Illegal state transition → `409`, logged | AUTO | `RULE-H7-4`, `REQ-H-102` |
| `TC-059` | Reconciliation concurrent with webhook delivery → single terminal state | AUTO | `RULE-H6-1` |
| `TC-060` | Publish without a primary poster → `422 media_not_ready` | AUTO | `AC-H-9` |

---

## Client review & conversion — Part G′

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-061` | Review asset unreachable from any public route or API | AUTO | `AC-G01-1`, `REQ-G-106`, `RULE-G2-1` |
| `TC-062` | Expired, revoked and invalid links are mutually indistinguishable | AUTO | `AC-G01-2`, `REQ-G-102` |
| `TC-063` | Review link access is logged with timestamp and IP | AUTO | `AC-G01-3` |
| `TC-064` | Link cannot be created for a non-`Ready` asset | AUTO | `AC-G01-4`, `RULE-G3-3` |
| `TC-065` | Feedback requires `receivedVia` and can spawn a linked task | AUTO | `REQ-G-103`, `REQ-G-104`, `RULE-G4-2` |
| `TC-066` | Final approval records approver and date | AUTO | `REQ-G-105` |
| `TC-067` | **Double-submitted conversion → one client, one project** | AUTO | `AC-G6-1`, `RULE-G6-2` |
| `TC-068` | Failure mid-conversion leaves no partial records | AUTO | `AC-G6-2`, `RULE-G6-1` |
| `TC-069` | Conversion creates no public content | AUTO | `AC-G6-3`, `RULE-G6-4` |
| `TC-070` | `packageId` and `sourceProjectId` survive conversion onto the project | AUTO | `AC-G6-4`, `RULE-G6-5` |

---

## Cross-cutting

| ID | Case | Type | Discharges |
|---|---|---|---|
| `TC-071` | Lead persists **before** notification; forcing a mail failure still yields a lead | AUTO | `RULE-N4-1` equivalent — V1 A3's first rule |
| `TC-072` | Duplicate lead is **flagged, never discarded** | AUTO | V1 C08 |
| `TC-073` | Every admin endpoint rejects unauthenticated (`401`) and unauthorised (`403`) requests | AUTO | `RULE-N4-1` |
| `TC-074` | No public API response contains `sourceStorageKey`, internal notes or budget discussion | AUTO | V1 A3 |
| `TC-075` | `Idempotency-Key` reuse with a different payload → `409 idempotency_key_reuse` | AUTO | `ADR-003` |
| `TC-076` | Owner completes all twelve M3 handover steps unaided | MAN | V1 M4 definition of done |

`TC-076` is the walkthrough test. It is manual by necessity — the claim being verified is that a *non-technical person* can operate the system, and only a non-technical person can verify it. Its paper form is [traceability/walkthrough.md](../traceability/walkthrough.md).

---

## Inherited V1 acceptance criteria

V2 cites a small number of V1 acceptance criteria by their original identifiers, because the whole point is showing that a previously unsatisfiable criterion is now satisfiable. They are registered here so the citations resolve rather than dangling.

| ID | V1 source | Statement | Status in V2 |
|---|---|---|---|
| `AC-C07-1` | V1 C07 | "Owner can change package without deployment" | **Now satisfiable** — `F11`, `ENT-Package`, `API-package-update`. Was unsatisfiable in V1: no Packages screen existed |
| `AC-C07-2` | V1 C07 | "Lead receives package context" | **Now satisfiable** — `ENT-Lead.packageId`. Was unsatisfiable: `D1` had no such field |
| `AC-C03-1` | V1 C03 | "CTA prefill tested" — enquiry carries `sourceProjectId` | **Now satisfiable** — `ENT-Lead.sourceProjectId`. Same defect as above |
| `AC-E03-1` | V1 E03 | "Conversion idempotent" | **Now defined** — [ADR-003](../decisions/ADR-003-idempotency.md), `TC-067`. V1 required it without specifying it |

Increment 3 rewrites the V1 parts and renumbers these into the V2 scheme; until then they keep their original IDs so the mapping stays legible.
