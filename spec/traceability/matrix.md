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

## 6 · Operations — Part O (Increment 2)

Most operational requirements have no screen: they are jobs, gates and policies. `—` in the Screen column is a deliberate assertion, not a gap.

### 6.1 Backup & recovery — [O1](../parts/O1-backup-recovery.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O1-001` | — | `RULE-O1-4`, `RULE-O1-9` | `ENT-MediaAsset` | `JOB-db-backup`, `JOB-r2-replicate` | — | `NTF-025` | Three layers; layer 3 covers account loss | `TC-078`, `TC-083` | `AC-O1-2`, `AC-O1-7` |
| `REQ-O1-002` | — | `RULE-O1-3`, `RULE-O1-11` | `ENT-MediaAsset` | `JOB-db-backup` | — | — | RPO 5 min DB / 24 h media; RTO 1 h / 4 h / 24 h | `TC-077`, `TC-080` | `AC-O1-1`, `AC-O1-4` |
| `REQ-O1-003` | — | `RULE-O1-15`, `RULE-O1-16` | — | `JOB-restore-verify` | — | `NTF-026` | Verification failure is S1 | `TC-078` | `AC-O1-2` |
| `REQ-O1-004` | — | `RULE-O1-13`, `RULE-O1-14` | `ENT-MediaAsset`, `ENT-MediaUsage` | `JOB-storage-reconcile` | — | `NTF-027` | Fails towards unpublishing; nothing deleted | `TC-081`, `TC-082` | `AC-O1-5`, `AC-O1-6` |
| `REQ-O1-005` | `F02` | `RULE-O1-8`, `RULE-O1-12` | `ENT-MediaDerivative` | `JOB-storage-reconcile` | `PERM-media-delete` | `NTF-027` | Versioning 30 d; quarantine, never delete | `TC-079` | `AC-O1-3` |
| `REQ-O1-006` | — | `RULE-O1-5`, `RULE-O6-8` | — | `JOB-db-backup` | — | `NTF-025` | Key from the secret manager, not the vendor | `TC-083`, `TC-084` | `AC-O1-7`, `AC-O1-8` |

### 6.2 Observability & incidents — [O2](../parts/O2-observability-incidents.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O2-001` | — | `RULE-O2-1`, `RULE-O2-2` | — | `JOB-media-reconcile` | — | — | 99.5% site, 99.9% lead submission | `TC-160` | `AC-O2-4` |
| `REQ-O2-002` | `F01` | `RULE-O2-3` | `ENT-MediaProcessJob`, `ENT-NotificationRecord` | `API-media-webhook`, `JOB-media-reconcile` | — | `NTF-012` | Zero webhooks while jobs in flight is an alert | `TC-086`, `TC-161` | `AC-O2-2` |
| `REQ-O2-003` | — | `RULE-O2-4`, `RULE-O2-5` | `ENT-ActivityLog` | `JOB-rights-sweep`, `JOB-retention-sweep` | — | `NTF-028` | Cron monitor; non-execution raises S2, S1 for rights | `TC-085`, `TC-087` | `AC-O2-1`, `AC-O2-3` |
| `REQ-O2-004` | — | `RULE-O2-6`, `RULE-O2-8` | — | — | — | `NTF-026`, `NTF-027` | S1–S4 routing and response windows | `TC-088` | `AC-O2-4` |
| `REQ-O2-005` | — | `RULE-O2-7`, `RULE-O2-12` | — | — | — | — | Alert names first diagnostic and O3 boundary | `TC-089`, `TC-092` | `AC-O2-5`, `AC-O2-8` |
| `REQ-O2-006` | — | `RULE-O2-9`, `RULE-O2-10`, `RULE-O2-11` | `ENT-ActivityLog` | — | `PERM-audit-read` | — | Close requires the originating signal to normalise | `TC-090`, `TC-091` | `AC-O2-6`, `AC-O2-7` |

### 6.3 Support boundaries — [O3](../parts/O3-support-boundaries.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O3-001` | `F01` | `RULE-O3-1` | `ENT-MediaProcessJob` | `API-media-retry` | `PERM-media-write` | `NTF-011` | Owner retries once; dead-letter is developer | `TC-093` | `AC-O3-1` |
| `REQ-O3-002` | `R01`, `F07` | `RULE-O3-2`, `RULE-O3-4` | `ENT-RightsRecord` | `API-portfolio-publish` | `PERM-rights-approve` | — | `422 rights_not_cleared` is not an incident | `TC-094`, `TC-095`, `TC-097` | `AC-O3-2`, `AC-O3-3`, `AC-O3-5` |
| `REQ-O3-003` | — | `RULE-O3-5`, `RULE-O3-6` | — | — | — | — | S1–S4 escalation with response windows | `TC-098` | `AC-O3-6` |
| `REQ-O3-004` | `E04`, `F02` | `RULE-O3-3` | `ENT-Client`, `ENT-MediaAsset` | `API-client-archive`, `API-media-archive` | `PERM-clients-archive` | — | UI exposes archive only; no delete path exists | `TC-096` | `AC-O3-4` |

### 6.4 Notifications — [O4](../parts/O4-notification-architecture.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O4-001` | `C08` | `RULE-O4-1` | `ENT-NotificationRecord`, `ENT-Lead` | `API-lead-create`, `JOB-notification-dispatch` | Anonymous | `NTF-001`, `NTF-002` | Queued after commit; send failure never rolls back | `TC-099` | `AC-O4-1` |
| `REQ-O4-002` | — | `RULE-O4-7` | `ENT-NotificationRecord` | `JOB-notification-retry` | — | `NTF-001` | 4 attempts then terminal; render error is S2, no retry | `TC-102` | `AC-O4-4` |
| `REQ-O4-003` | — | `RULE-O4-2`, `RULE-O4-3` | `ENT-NotificationRecord` | `JOB-notification-dispatch` | — | — | `SKIP LOCKED` claim; key prevents double-send | `TC-100`, `TC-101` | `AC-O4-2`, `AC-O4-3` |
| `REQ-O4-004` | — | `RULE-O4-8` | — | — | — | — | Undeclared variable fails the build, not the send | `TC-104`, `TC-105` | `AC-O4-6`, `AC-O4-7` |
| `REQ-O4-005` | `N06` | `RULE-O4-9`, `RULE-O4-10` | `ENT-NotificationRecord`, `ENT-User` | — | Authenticated | `NTF-020`, `NTF-023` | Security messages ignore all suppression | `TC-103` | `AC-O4-5` |
| `REQ-O4-006` | — | `RULE-O4-4`, `RULE-O4-5`, `RULE-O4-6` | `ENT-NotificationRecord` | — | — | `NTF-002`, `NTF-024` | SPF/DKIM/DMARC gate; WhatsApp never transmitted | `TC-106`, `TC-107` | `AC-O4-8`, `AC-O4-9` |

### 6.5 Performance & scale — [O5](../parts/O5-performance-scale.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O5-001` | — | `RULE-O5-1`, `RULE-O5-3` | — | — | — | — | Three scenarios; Expected is the default | `TC-108` | `AC-O5-1` |
| `REQ-O5-002` | — | `RULE-O5-2` | — | — | — | — | Every derived figure has a formula | `TC-151` | `AC-O10-1` |
| `REQ-O5-003` | `C01`, `C02` | `RULE-O5-4`, `RULE-O5-5`, `RULE-O5-7` | — | `API-public-projects-list` | Anonymous | — | Budget breach fails the build | `TC-109`, `TC-114` | `AC-O5-2`, `AC-O5-7` |
| `REQ-O5-004` | `E02` | `RULE-O5-6` | `ENT-Lead` | `API-lead-list`, `API-global-search` | `PERM-leads-read` | — | Load tested at Growth volumes | `TC-110`, `TC-111`, `TC-112` | `AC-O5-3`, `AC-O5-4`, `AC-O5-5` |
| `REQ-O5-005` | — | `RULE-O5-8`, `RULE-O5-9` | — | — | — | — | 50% over for two months triggers re-plan | `TC-113` | `AC-O5-6` |

### 6.6 Security operations — [O6](../parts/O6-security-operations.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O6-001` | — | `RULE-O6-1`, `RULE-O6-2`, `RULE-O6-3`, `RULE-O6-4` | `ENT-ActivityLog` | `API-media-webhook` | — | — | Dual-secret window; backup key never rotated in place | `TC-115` | `AC-O6-1` |
| `REQ-O6-002` | `N02`, `N05`, `N07` | `RULE-O6-14`, `RULE-O6-15`, `RULE-O6-16` | `ENT-MfaEnrollment`, `ENT-RecoveryCode` | `API-auth-mfa-enroll` | `PERM-users-write` | `NTF-021` | Break-glass needs out-of-band verification | `TC-118`, `TC-119`, `TC-120` | `AC-O6-4`, `AC-O6-5`, `AC-O6-6` |
| `REQ-O6-003` | — | `RULE-O6-17`, `RULE-O6-18` | — | — | — | — | Critical CVE fails the build, not overridable | `TC-121` | `AC-O6-7` |
| `REQ-O6-004` | — | `RULE-O6-5`, `RULE-O6-6`, `RULE-O6-7`, `RULE-O6-9`, `RULE-O6-10`, `RULE-O6-11`, `RULE-O6-12`, `RULE-O6-13` | `ENT-MediaAsset`, `ENT-Attachment` | `API-attachment-signed-url` | `PERM-rights-read` | — | Secret in history fails the build | `TC-116`, `TC-117` | `AC-O6-2`, `AC-O6-3` |
| `REQ-O6-005` | `N07`, `N08`, `N09` | `RULE-O6-19`, `RULE-O6-20` | `ENT-UserRole`, `ENT-Session` | `API-user-list`, `API-auth-sessions-list` | `PERM-users-read` | — | Review recorded even when nothing changes | `TC-123` | `AC-O6-9` |
| `REQ-O6-006` | `N10` | `RULE-O6-21`, `RULE-O6-22` | `ENT-ActivityLog`, `ENT-Release` | `API-audit-list` | `PERM-audit-read` | — | Rights retention exceeds general audit retention | `TC-122` | `AC-O6-8` |

### 6.7 Data lifecycle — [O7](../parts/O7-data-lifecycle.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O7-001` | — | `RULE-O7-8`, `RULE-O7-9` | `ENT-Lead`, `ENT-MediaAsset`, `ENT-ReviewLink` | `JOB-retention-sweep`, `JOB-session-purge`, `JOB-idempotency-purge` | — | — | Dry-run 30 days before deleting | `TC-124`, `TC-129` | `AC-O7-1`, `AC-O7-6` |
| `REQ-O7-002` | `E03` | `RULE-O7-1`, `RULE-O7-2`, `RULE-O7-3` | `ENT-Lead`, `ENT-Note`, `ENT-ActivityLog` | `JOB-retention-sweep` | `PERM-leads-write` | — | Anonymise in place; audit trail preserved | `TC-125`, `TC-127` | `AC-O7-2`, `AC-O7-4` |
| `REQ-O7-003` | `R02` | `RULE-O7-4`, `RULE-O7-5`, `RULE-O7-6` | `ENT-Release`, `ENT-Client` | `API-release-revoke`, `API-client-archive` | `PERM-rights-write` | — | `409` naming blocking releases and the correct sequence | `TC-126`, `TC-131` | `AC-O7-3`, `AC-O7-8` |
| `REQ-O7-004` | `F02` | `RULE-O7-7` | `ENT-MediaUsage`, `ENT-Attachment`, `ENT-MediaDerivative` | `JOB-retention-sweep`, `API-media-usage` | `PERM-media-read` | — | Usage beats retention, always | `TC-128`, `TC-132` | `AC-O7-5`, `AC-O7-9` |
| `REQ-O7-005` | `E04`, `F02` | `RULE-O7-10` | `ENT-Client`, `ENT-MediaAsset` | `API-client-archive`, `API-media-archive` | `PERM-clients-archive` | — | UI offers unpublish and archive only | `TC-130` | `AC-O7-7` |

### 6.8 Testing & release — [O8](../parts/O8-testing-cicd.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O8-001` | — | `RULE-O8-1` | — | — | — | — | A rule without a test fails the traceability gate | `TC-133` | `AC-O8-1` |
| `REQ-O8-002` | `F01` | `RULE-O8-5` | `ENT-MediaProcessJob` | `JOB-media-reconcile` | — | — | Async failure paths covered, not only happy paths | `TC-141` | `AC-O8-9` |
| `REQ-O8-003` | — | `RULE-O8-2` | `ENT-ShowreelVersion`, `ENT-Lead` | — | — | — | Real Postgres via Testcontainers | `TC-134`, `TC-135` | `AC-O8-2`, `AC-O8-3` |
| `REQ-O8-004` | — | `RULE-O8-3`, `RULE-O8-4` | — | — | — | — | No gate bypassable by re-run | `TC-136`, `TC-137` | `AC-O8-4`, `AC-O8-5` |
| `REQ-O8-005` | — | `RULE-O8-10` | — | — | — | — | Previous tag redeployable in under 5 minutes | `TC-138` | `AC-O8-6` |
| `REQ-O8-006` | — | `RULE-O8-11`, `RULE-O8-12`, `RULE-O8-13`, `RULE-O8-14` | — | — | — | — | Expand / migrate / contract across three releases | `TC-139` | `AC-O8-7` |
| `REQ-O8-007` | — | `RULE-O8-6`, `RULE-O8-7`, `RULE-O8-8`, `RULE-O8-9` | `ENT-Lead` | — | — | — | Staging seeded synthetically, never copied | `TC-140` | `AC-O8-8` |

### 6.9 Accessibility — [O9](../parts/O9-accessibility-operations.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O9-001` | `C01`, `C02`, `C03` | `RULE-O9-1`, `RULE-O9-2` | — | `API-public-project-get` | Anonymous | — | WCAG 2.2 AA; admin exceptions recorded | `TC-144`, `TC-148` | `AC-O9-3`, `AC-O9-7` |
| `REQ-O9-002` | `F03`, `F07`, `F08` | `RULE-O9-3`, `RULE-O9-4`, `RULE-O9-5`, `RULE-O9-6`, `RULE-O9-7`, `RULE-O9-8`, `RULE-O9-13` | `ENT-MediaAsset`, `ENT-MediaDerivative` | `API-portfolio-publish`, `API-reel-publish` | `PERM-portfolio-publish` | — | Speech with no captions blocks publish; unset also blocks | `TC-142`, `TC-143` | `AC-O9-1`, `AC-O9-2` |
| `REQ-O9-003` | `F04` | `RULE-O9-9` | `ENT-MediaAsset` | `API-media-update` | `PERM-media-write` | — | Alt text required for public photos unless decorative | `TC-150`, `TC-162` | `AC-O9-1`, `AC-O9-9` |
| `REQ-O9-004` | `C01` | `RULE-O9-11`, `RULE-O9-12` | — | — | — | — | axe in CI; quarterly manual screen-reader pass | `TC-145`, `TC-146`, `TC-149` | `AC-O9-4`, `AC-O9-5`, `AC-O9-8` |
| `REQ-O9-005` | — | `RULE-O9-10` | — | — | — | — | Critical and serious block release; moderate and minor backlog | `TC-147` | `AC-O9-6` |

### 6.10 Cost model — [O10](../parts/O10-cost-model.md)

| REQ | Screen | Rule | Entity | API | Perm | NTF | State / Error | Test | AC |
|---|---|---|---|---|---|---|---|---|---|
| `REQ-O10-001` | — | `RULE-O10-1`, `RULE-O10-2`, `RULE-O10-8` | — | — | — | — | Rates dated and re-verified from source | `TC-151`, `TC-153`, `TC-157` | `AC-O10-1`, `AC-O10-3`, `AC-O10-7` |
| `REQ-O10-002` | — | `RULE-O10-3`, `RULE-O10-4` | — | — | — | — | All three scenarios costed; nothing blocked on scale | `TC-152` | `AC-O10-2` |
| `REQ-O10-003` | — | `RULE-O10-5`, `RULE-O10-6` | — | — | — | — | Retainer and residency exclusions stated prominently | `TC-154`, `TC-155` | `AC-O10-4`, `AC-O10-5` |
| `REQ-O10-004` | — | `RULE-O10-7` | — | — | — | — | Monthly actuals; drift triggers re-plan | `TC-156` | `AC-O10-6` |

---

## 7 · V1 contradiction re-test

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
