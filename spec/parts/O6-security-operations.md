# Part O6 · Security Operations

**Status:** ACCEPTED
**Extends:** [Part N](N-auth-administration.md) (authentication), V1 J1 (security baseline)
**Closes:** V1 J1 is a twelve-bullet checklist of *properties*. It states no rotation schedule, no patch cadence, no dependency scanning, no access review, and no procedure for a lost MFA device — the single most common security support request any system receives.

---

## O6.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O6-001` | Every credential and secret has a rotation schedule and a rotation procedure. |
| `REQ-O6-002` | A user who loses their second factor can recover without weakening the control. |
| `REQ-O6-003` | Dependencies are scanned continuously and patched on a stated cadence. |
| `REQ-O6-004` | Secrets never enter the repository, logs, backups readable by the vendor, or error reports. |
| `REQ-O6-005` | Access is reviewed on a schedule, not only when someone leaves. |
| `REQ-O6-006` | Audit records are retained long enough to investigate an incident discovered late. |

---

## O6.2 · Credential and secret rotation

| Secret | Cadence | Procedure | Break-glass |
|---|---|---|---|
| Media webhook signing secret | 90 days | **Dual-secret window** — both valid, providers updated, old retired after 24 h | Immediate rotation, brief signature-rejection spike expected |
| R2 access keys | 180 days | Issue new, deploy, retire old | Immediate; replication key rotated separately |
| Stream API token | 180 days | As above | Immediate |
| Database credentials | 180 days | Neon role rotation, rolling restart | Immediate, brief connection errors |
| Backup encryption key | **Never rotated in place** | New key for new backups; old key retained while any backup it encrypts is in retention | n/a |
| Email provider key | 180 days | Issue, deploy, retire | Immediate |
| Sentry auth token | 365 days | Issue, deploy, retire | Immediate |
| Session signing key | 90 days | Overlapping validation; **existing sessions survive** | Immediate — invalidates all sessions, forces re-login |

- `RULE-O6-1` — The webhook secret rotates on a **dual-secret window** ([H′3](H-prime-media-processing.md)). A hard cutover drops every in-flight callback, and reconciliation would repair the damage while hiding the cause.
- `RULE-O6-2` — **The backup encryption key is never rotated in place.** Re-encrypting the archive to rotate a key is the operation most likely to destroy it. New key forward, old key retained until its last backup expires.
- `RULE-O6-3` — Rotating the session signing key normally preserves sessions via overlapping validation; break-glass rotation deliberately does not.
- `RULE-O6-4` — Every rotation is logged to `ENT-ActivityLog` with actor `system` or the operator.

### Secret storage

| Rule | ID |
|---|---|
| Secrets live only in the platform secret manager. Never in the repo, `.env` committed, CI logs, or an entity | `RULE-O6-5` |
| Secret scanning runs on every push **and** on the full history; a hit fails the build | `RULE-O6-6` |
| A leaked secret is rotated first and investigated second | `RULE-O6-7` |
| The backup key exists in exactly two places: the secret manager, and an offline copy held by the owner | `RULE-O6-8` |

`RULE-O6-8` is the uncomfortable one. A backup key held only in the infrastructure it protects is not a recovery plan — an account compromise takes the key with it.

---

## O6.3 · Storage key handling

| Rule | ID |
|---|---|
| `sourceStorageKey` never appears in a public API payload, log, error, or Sentry event | `RULE-O6-9` |
| All object access is via signed URLs — 5 min for attachments, 15 min for admin media preview | `RULE-O6-10` |
| Signed URLs are never logged in full; the object ID is logged instead | `RULE-O6-11` |
| Buckets are private with no public access policy. Public delivery is Stream and the CDN, never direct object reads | `RULE-O6-12` |
| Rights evidence sits under a separate prefix with its own access policy | `RULE-O6-13` |

---

## O6.4 · MFA recovery — the procedure V1 omits

Lost devices are routine. Without a defined path, the response is improvised, and improvisation around MFA is how MFA gets bypassed.

| Situation | Path |
|---|---|
| Device lost, recovery codes held | Self-service: sign in with a recovery code, re-enrol, regenerate codes |
| Device and codes lost, **another admin exists** | Admin resets MFA on `N07`. Raises `NTF-021` to the user and all Owners. Next login forces re-enrolment |
| Device and codes lost, **sole administrator** | **Break-glass** — see below |
| Suspected account compromise | Admin deactivates immediately; all sessions revoked; investigate before restoring |

### Break-glass — sole administrator locked out

- `RULE-O6-14` — Requires **out-of-band identity verification** by the developer holding the maintenance agreement: a video call and a pre-agreed challenge recorded at handover. Email confirmation alone is insufficient — email is exactly what an attacker who reached this point already controls.
- `RULE-O6-15` — Executed by direct database intervention, logged as a system action, and followed by immediate re-enrolment.
- `RULE-O6-16` — **A second administrator account is created at handover specifically so this path is never needed.** The `Owner` role is held by at least two people, or the studio owner holds two accounts with separate second factors.

`RULE-O6-16` is cheap insurance against the most disruptive lockout available, and it is the reason `RULE-N3-17` — last admin standing — must never be worked around.

---

## O6.5 · Patching and dependency management

| Class | Cadence | Owner |
|---|---|---|
| Critical / actively exploited | **72 hours** | Developer |
| High | 14 days | Developer |
| Moderate / low | Monthly batch | Developer |
| Framework minor (.NET, Next.js) | Monthly | Developer |
| Framework major | Planned, per release cycle | Developer |
| Base container images | Monthly rebuild | CI |

| Control | Mechanism |
|---|---|
| Dependency scanning | Dependabot + `dotnet list package --vulnerable` and `npm audit` in CI |
| Build gate | **Critical or high vulnerability in a production dependency fails the build** |
| Provenance | Lockfiles committed; CI installs from lockfile only |
| Review | New dependencies reviewed for necessity, licence and maintenance status |

- `RULE-O6-17` — A failing security gate is not overridable by re-running CI. Suppressing a finding requires a dated, reasoned entry in a suppression file, reviewed like code.
- `RULE-O6-18` — Patching happens on a cadence **even when nothing is flagged**. A dependency set that is only touched when a CVE lands drifts far enough that the emergency patch becomes a migration.

---

## O6.6 · Access review

| Review | Cadence | Checks |
|---|---|---|
| User and role review | Quarterly | Every active user still needs their roles; departed staff deactivated |
| Privileged access | Quarterly | Who holds `PERM-users-write`, `PERM-rights-approve`, `PERM-portfolio-publish` |
| Vendor console access | Quarterly | Who can reach Cloudflare, Neon, Sentry, Resend, and the registrar |
| Session review | Monthly | Long-lived or unexpected-geography sessions |

- `RULE-O6-19` — Review output is recorded even when nothing changes, so "we reviewed and it was fine" is distinguishable from "we forgot".
- `RULE-O6-20` — Departure triggers immediate deactivation and vendor-access removal; the quarterly review is a backstop, not the mechanism.

---

## O6.7 · Audit retention

| Data | Retention | Why |
|---|---|---|
| `ENT-ActivityLog` | **24 months** | Breaches are commonly discovered months later; a 90-day log cannot answer what happened |
| Rights transitions | **Life of the record + 7 years** | Evidence of authorisation must outlive the publication |
| Authentication events | 24 months | |
| Application logs | 90 days hot, 12 months archived | |
| Sentry events | 90 days | Provider default |
| Notification records | 12 months | Delivery disputes |
| Backups | Per [O1](O1-backup-recovery.md) | |

- `RULE-O6-21` — Rights audit retention **exceeds** general audit retention deliberately. A takedown demand may arrive years after publication, and the only useful answer is the evidence trail from the day it was published.
- `RULE-O6-22` — `ActivityLog` is append-only ([`RULE-N3-27`](N-auth-administration.md)); retention expiry archives to cold storage rather than deleting, preserving the chain.

---

## O6.8 · Acceptance criteria

- `AC-O6-1` Webhook secret rotation completes with no callback lost.
- `AC-O6-2` A committed secret fails the build.
- `AC-O6-3` No log, error report or public payload contains a storage key or signed URL.
- `AC-O6-4` A user with recovery codes restores MFA unaided.
- `AC-O6-5` Break-glass requires out-of-band verification and is fully logged.
- `AC-O6-6` A second administrator exists at handover.
- `AC-O6-7` A critical vulnerability in a production dependency fails the build and is not overridable by re-run.
- `AC-O6-8` Rights transition records remain retrievable beyond general audit retention.
- `AC-O6-9` Quarterly access review is recorded even when no change results.
