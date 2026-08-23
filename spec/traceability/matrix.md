# Traceability matrix — Increment 1

One row per P0 requirement. Every link in the chain is either satisfied by an ID, asserted inapplicable with `—`, or names an `UNRESOLVED` entry.

**Validate:** `node spec/tools/check-traceability.mjs`

Any ID-shaped token in any cell must resolve against the reference files. An empty cell is a validation failure — `—` is a deliberate assertion of non-applicability, and blank is an oversight. The distinction is the entire point.

---

## 1 · Publishing rights — Part R

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-R-001` | `R01` | `RULE-R3-4` | `ENT-RightsRecord`, `ENT-PortfolioProject` | `API-portfolio-create`, `API-rights-get` | `PERM-rights-read` | — | Record created with project; `evaluationResult` starts `Blocked` | `TC-001` | `AC-R01-1` |
| `REQ-R-002` | `R01` | `RULE-R5-1` | `ENT-Release`, `ENT-ProjectBlock` | `API-portfolio-update`, `API-rights-get` | `PERM-rights-write` | — | Re-derivation retires nothing already `Granted` | `TC-005` | `AC-R01-4` |
| `REQ-R-003` | `R01` | `RULE-R5-3` | `ENT-Release`, `ENT-Attachment` | `API-release-create`, `API-attachment-create` | `PERM-rights-write` | — | Failed evidence upload retains the release row and metadata | `TC-004` | `AC-R01-3` |
| `REQ-R-004` | `R01` | `RULE-R5-2` | `ENT-Release`, `ENT-UserRole` | `API-release-approve` | `PERM-rights-approve` | — | `403` without approve permission; self-approval logged distinctly | `TC-003` | `AC-R01-2` |
| `REQ-R-005` | `R01`, `F07` | `RULE-R3-1`, `RULE-R3-2`, `RULE-R3-3` | `ENT-RightsRecord`, `ENT-Release` | `API-portfolio-publish` | `PERM-portfolio-publish` | — | `422 rights_not_cleared` with outstanding list | `TC-001`, `TC-002` | `AC-R01-1` |
| `REQ-R-006` | `R02` | `RULE-R5-5` | `ENT-Release`, `ENT-PortfolioProject` | `JOB-rights-sweep`, `API-release-revoke` | `PERM-rights-write` | `NTF-016` | Unpublish → revalidate → **CDN purge**; each step retried independently | `TC-007` | `AC-R02-2` |
| `REQ-R-007` | `R01` | `RULE-R5-3` | `ENT-Attachment` | `API-attachment-signed-url` | `PERM-rights-read` | — | Signed URL, 5-min expiry; absent from all public DTOs | `TC-010` | `AC-R01-2` |
| `REQ-R-008` | `R02` | `RULE-R5-4` | `ENT-Release` | `JOB-rights-sweep` | `PERM-rights-read` | `NTF-015` | Warning raised once per release at 30 days | `TC-006` | `AC-R02-1` |

Open: `UNRESOLVED-009`, `UNRESOLVED-010`, `UNRESOLVED-011` — all scope the checklist's depth, none block the mechanism.

---

## 2 · Authentication & administration — Part N

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-N-001` | `N01`, `N03`, `N06` | `RULE-N3-1`, `RULE-N3-8` | `ENT-User`, `ENT-Session`, `ENT-PasswordResetToken` | `API-auth-login`, `API-auth-password-forgot`, `API-auth-password-reset` | Anonymous | `NTF-019`, `NTF-020` | Generic failure message; lockout shows remaining time | `TC-011`, `TC-016`, `TC-017` | `AC-N01-1`, `AC-N03-1` |
| `REQ-N-002` | `N02`, `N05` | `RULE-N3-2`, `RULE-N3-14`, `RULE-N3-16` | `ENT-MfaEnrollment`, `ENT-RecoveryCode` | `API-auth-mfa-enroll`, `API-auth-mfa-confirm`, `API-auth-mfa-challenge` | `PERM-users-write` | `NTF-021` | `mfa_required`; challenge expires in 5 min, single-use | `TC-013`, `TC-014`, `TC-019` | `AC-N01-3`, `AC-N02-1`, `AC-N05-1` |
| `REQ-N-003` | `N04`, `N07` | `RULE-N3-11`, `RULE-N3-12` | `ENT-Invitation`, `ENT-User` | `API-user-invite`, `API-invitation-accept` | `PERM-users-write` | `NTF-018` | Expired token offers re-request rather than dead-ending | `TC-018` | `AC-N04-1`, `AC-N04-2` |
| `REQ-N-004` | `N08` | `RULE-N3-21`, `RULE-N3-24` | `ENT-Role`, `ENT-Permission`, `ENT-RolePermission`, `ENT-UserRole` | `API-role-create`, `API-role-update`, `API-user-roles-set`, `API-permission-list` | `PERM-users-write` | `NTF-023` | Union of permissions; effective within 60s of change | `TC-025`, `TC-026`, `TC-027` | `AC-N08-1`, `AC-N08-2`, `AC-N08-3` |
| `REQ-N-005` | `N07`, `N08` | `RULE-N3-17`, `RULE-N3-22` | `ENT-UserRole`, `ENT-RolePermission` | `API-user-deactivate`, `API-user-roles-set`, `API-role-update` | `PERM-users-write` | — | `409 conflict` on all three routes to the invariant | `TC-022` | `AC-N07-1` |
| `REQ-N-006` | `N09` | `RULE-N3-25`, `RULE-N3-26` | `ENT-Session` | `API-auth-sessions-list`, `API-auth-session-revoke` | Authenticated | `NTF-022` | Revocation effective within the 60s validity cache | `TC-028` | `AC-N09-1` |
| `REQ-N-007` | `N10` | `RULE-N3-27`, `RULE-N3-28`, `RULE-N3-29`, `RULE-N3-30` | `ENT-ActivityLog` | `API-audit-list` | `PERM-audit-read` | — | Append-only; no mutation path exists | `TC-029`, `TC-030`, `TC-031` | `AC-N10-1`, `AC-N10-2`, `AC-N10-3` |
| `REQ-N-008` | `N01`, `N03` | `RULE-N3-1`, `RULE-N3-8` | `ENT-User` | `API-auth-login`, `API-auth-password-forgot` | Anonymous | — | Identical body, status and timing for known and unknown accounts | `TC-011`, `TC-016` | `AC-N01-1`, `AC-N03-1` |

---

## 3 · CMS completion — Part F′

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-F-101` | `F10`, `F11`, `F13`, `F14` | `RULE-F10-1`, `RULE-F11-1`, `RULE-F14-1` | `ENT-Service`, `ENT-Package`, `ENT-SitePage`, `ENT-SiteSetting` | `API-service-update`, `API-package-update`, `API-page-update`, `API-setting-set` | `PERM-site-write` | — | Save then revalidate the affected public route only | `TC-032`, `TC-035`, `TC-042` | `AC-F10-1`, `AC-F11-1`, `AC-F14-1` |
| `REQ-F-102` | `F10`, `F15` | `RULE-F10-2`, `RULE-F15-2` | `ENT-Service`, `ENT-Category`, `ENT-MediaUsage` | `API-service-archive`, `API-category-archive`, `API-media-delete` | `PERM-site-write` | — | `409 dependency_in_use` listing the referencing items | `TC-034`, `TC-044` | `AC-F10-3`, `AC-F15-2` |
| `REQ-F-103` | `F12` | `RULE-F12-1`, `RULE-F12-2`, `RULE-F12-3` | `ENT-Testimonial` | `API-testimonial-approve`, `API-testimonial-update` | `PERM-site-publish` | — | Editing an approved quote reverts it to `Pending` | `TC-038`, `TC-039` | `AC-F12-1`, `AC-F12-2` |
| `REQ-F-104` | `F13`, `C08` | `RULE-F13-1` | `ENT-SitePage` | `API-public-page-get`, `API-page-publish` | `PERM-site-publish` | — | System pages undeletable while the consent step links them | `TC-040`, `TC-041` | `AC-F13-1`, `AC-F13-3` |
| `REQ-F-105` | `F15` | `RULE-F15-1`, `RULE-F15-3`, `RULE-F15-5` | `ENT-Category`, `ENT-Tag`, `ENT-EntityTag` | `API-category-create`, `API-tag-update` | `PERM-site-write` | — | Merge is one transaction; slug change preserves canonical URLs | `TC-044`, `TC-045`, `TC-046` | `AC-F15-1`, `AC-F15-3`, `AC-F15-4` |

---

## 4 · Media processing — Part H′

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-H-101` | `F03`, `F04` | `RULE-H7-4` | `ENT-MediaAsset` | `API-media-upload-session`, `API-media-complete` | `PERM-media-write` | — | Direct-to-provider signed upload; API sees metadata only | `TC-047` | `AC-H-1` |
| `REQ-H-102` | `F02`, `F03` | `RULE-H7-1`, `RULE-H7-2`, `RULE-H7-3`, `RULE-H7-4` | `ENT-MediaAsset`, `ENT-MediaProcessJob` | `API-media-webhook`, `JOB-media-reconcile` | `PERM-media-write` | — | Illegal transition → `409`, logged | `TC-058` | `AC-H-8` |
| `REQ-H-103` | `F01` | `RULE-H3-1` | `ENT-IdempotencyRecord`, `ENT-MediaProcessJob` | `API-media-webhook` | Anonymous | — | Bad signature or stale timestamp → reject, no state change | `TC-048`, `TC-049`, `TC-050`, `TC-051` | `AC-H-2`, `AC-H-3`, `AC-H-4` |
| `REQ-H-104` | `F01` | `RULE-H4-1`, `RULE-H4-2`, `RULE-H4-3`, `RULE-H4-4` | `ENT-MediaProcessJob` | `API-media-retry` | `PERM-media-write` | `NTF-011`, `NTF-012` | 5 attempts with jitter → `DeadLettered`; terminal-input never retries | `TC-052`, `TC-054` | `AC-H-5`, `AC-H-7` |
| `REQ-H-105` | `F01` | `RULE-H6-1`, `RULE-H6-2` | `ENT-MediaAsset`, `ENT-MediaProcessJob` | `JOB-media-reconcile` | — | `NTF-013` | Every state has a ceiling; reconciliation repairs or escalates | `TC-053`, `TC-055`, `TC-057`, `TC-059` | `AC-H-6`, `AC-H-8`, `AC-H-10` |
| `REQ-H-106` | `F01`, `F03` | `RULE-H4-4`, `RULE-H4-5` | `ENT-MediaAsset`, `ENT-MediaProcessJob` | `API-media-retry` | `PERM-media-write` | `NTF-011` | Retry preserves entered metadata; source retained | `TC-054` | `AC-H-7` |
| `REQ-H-107` | `F07`, `F08` | `RULE-H7-2` | `ENT-MediaAsset`, `ENT-MediaDerivative` | `API-portfolio-publish`, `API-reel-publish` | `PERM-portfolio-publish` | — | `422 media_not_ready` when any referenced asset is not `Ready` | `TC-056`, `TC-060` | `AC-H-9` |

Open: `UNRESOLVED-003` (size and format policy), `UNRESOLVED-012` (retention). Neither blocks the pipeline; both are configuration.

---

## 5 · Client review & conversion — Part G′

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-G-101` | `F03`, `G01` | `RULE-G2-1`, `RULE-G2-3` | `ENT-MediaAsset` | `API-media-upload-session` | `PERM-media-write` | — | `role = ReviewCopy`, `visibility = Internal` | `TC-061` | `AC-G01-1` |
| `REQ-G-102` | `G01` | `RULE-G3-1`, `RULE-G3-2`, `RULE-G3-3` | `ENT-ReviewLink` | `API-reviewlink-create`, `API-review-access` | `PERM-projects-write` | `NTF-024` | Invalid, expired and revoked all return the same generic page | `TC-062`, `TC-064` | `AC-G01-2`, `AC-G01-4` |
| `REQ-G-103` | `G01`, `E06` | `RULE-G4-1`, `RULE-G4-4` | `ENT-ReviewFeedback` | `API-reviewfeedback-create` | `PERM-projects-write` | `NTF-009` | `receivedVia` mandatory; feedback is internal-only | `TC-065` | `AC-G01-3` |
| `REQ-G-104` | `E06`, `E08` | `RULE-G4-2` | `ENT-Task`, `ENT-ReviewFeedback` | `API-task-create` | `PERM-tasks-write` | `NTF-005` | Feedback links to the resulting task | `TC-065` | `AC-G01-3` |
| `REQ-G-105` | `E06` | `RULE-G4-5` | `ENT-Milestone` | `API-milestone-update` | `PERM-projects-write` | `NTF-007` | Incomplete review milestone warns, does not block | `TC-066` | `AC-G6-4` |
| `REQ-G-106` | `G01` | `RULE-G2-1`, `RULE-G2-2` | `ENT-MediaAsset` | `API-public-projects-list`, `API-public-project-get` | Anonymous | — | Review copies absent from public DTOs by construction | `TC-061`, `TC-074` | `AC-G01-1` |

Open: `UNRESOLVED-013` — default link expiry only; the mechanism is complete.

---

## 6 · V1 contradiction re-test

The nine self-contradictions the audit found. **This table is the acceptance test for Increment 1** — each must now resolve to a real screen, entity, endpoint and permission.

| # | V1 contradiction | Resolved by | Verified by |
|---|---|---|---|
| 1 | `AC-C07-1` "owner can change package without deployment" — no Packages screen existed | `F11`, `ENT-Package`, `API-package-update`, `PERM-site-write` | `TC-035` |
| 2 | `C04` names "Services CMS" as data owner — no Services screen existed | `F10`, `ENT-Service`, `API-service-update`, `PERM-site-write` | `TC-032` |
| 3 | `C06` names "Site CMS" for About content — no screen existed | `F13`, `ENT-SitePage`, `API-page-update`, `PERM-site-write` | `TC-041` |
| 4 | Testimonials "require approval" — no approver, no screen | `F12`, `ENT-Testimonial`, `API-testimonial-approve`, `PERM-site-publish` | `TC-038` |
| 5 | `C03`/`C07` pass `sourceProjectId`/`packageId` — `D1` had neither field | `ENT-Lead` (`sourceProjectId`, `packageId`), `API-lead-create` | `TC-036`, `TC-070` |
| 6 | `POST /api/auth/login` existed with no login, MFA or reset screens | `N01`–`N05`, `ENT-Session`, `API-auth-login`, Anonymous | `TC-011`, `TC-013` |
| 7 | `J2` lists `Users/Settings` — no screen existed | `N07`, `N08`, `ENT-Role`, `API-user-roles-set`, `PERM-users-write` | `TC-022`, `TC-025` |
| 8 | `ActivityLog` written everywhere, readable nowhere | `N10`, `ENT-ActivityLog`, `API-audit-list`, `PERM-audit-read` | `TC-029`, `TC-030` |
| 9 | `F03` publish gate was a checkbox marked `[TBD business process]` | Part R, `R01`, `ENT-RightsRecord`, `API-portfolio-publish`, `PERM-rights-approve` | `TC-001`, `TC-002` |

Two further V1 defects found during authoring and closed here:

| # | Defect | Resolved by |
|---|---|---|
| 10 | `C01` and `K3` name the same four analytics events differently, producing two half-populated funnels | [events.md](../reference/events.md) — K3's names win, C01's are `SUPERSEDED` |
| 11 | `F02` requires "deletion blocked when asset is in active published use" with no mechanism to know | `ENT-MediaUsage` + `API-media-usage`, `409 dependency_in_use` |

---

## 7 · Coverage

| Part | Requirements | Complete chains | Open |
|---|---|---|---|
| R · Rights | 8 | 8 | 3 scope questions |
| N · Auth & admin | 8 | 8 | 0 |
| F′ · CMS | 5 | 5 | 0 |
| H′ · Media | 7 | 7 | 2 config questions |
| G′ · Review | 6 | 6 | 1 default value |
| **Total** | **34** | **34** | **6 of 13 register entries** |

The seven remaining register entries (`UNRESOLVED-001`, `-002`, `-004`, `-005`, `-006`, `-007`, `-008`) belong to Increment 2 and 3 scope — brand, timezone display, lead brackets, WhatsApp channel, scale, rates and residency.
