# Reference · API surface

**Normative.** Every screen action in the specification must resolve to a row in this file or to a documented internal command. V1 Part I2 listed 19 routes covering leads, portfolio and media; tasks, calendar, clients, notes, files, reels, showreel, testimonials, services, packages, users, auth and dashboard aggregates had no endpoints at all.

---

## Conventions

| Concern | Rule |
|---|---|
| Base path | `/api/v1` — versioned from day one; V1 had no versioning strategy |
| Auth | Bearer token or `HttpOnly; Secure; SameSite=Lax` session cookie. Server-side authorisation on every route ([permissions.md](permissions.md)) |
| Permission column | The permission required. `Anonymous` = public. `Authenticated` = any logged-in user. |
| Idempotency | `REQ` = `Idempotency-Key` header required ([ADR-003](../decisions/ADR-003-idempotency.md)). Blank = not applicable. |
| Pagination | Cursor-based: `?cursor=&limit=` (default 25, max 100). Response `{ items, nextCursor, total? }`. `total` omitted where counting is expensive. |
| Filtering | Documented per endpoint. Unknown query params are **rejected with `400`**, not ignored — silent ignores hide client bugs. |
| Sorting | `?sort=field:asc\|desc`, whitelisted per endpoint. |
| Errors | Uniform envelope (below). |
| Rate limits | Public write 5/min/IP; auth 10/min/IP with exponential lockout; admin read 600/min/user. |
| Timestamps | ISO 8601 with offset, always UTC (`2026-08-23T10:32:00Z`). |
| Public payloads | **Never** contain `sourceStorageKey`, internal notes, budget discussion, rights evidence, or provider credentials (V1 A3, F02). Enforced by dedicated public DTOs — not by field-hiding on shared models. |

### Error envelope

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Human-readable summary.",
    "details": [{ "field": "email", "code": "required", "message": "..." }],
    "traceId": "01JQ..."
  }
}
```

Codes: `validation_failed` · `unauthenticated` · `mfa_required` · `forbidden` · `not_found` · `conflict` · `idempotency_key_reuse` · `idempotency_in_progress` · `rate_limited` · `rights_not_cleared` · `media_not_ready` · `dependency_in_use` · `internal_error`.

`traceId` correlates to structured logs and is safe to show the user.

---

## 1 · Public — `Anonymous`

| ID | Method | Path | Idem | Notes |
|---|---|---|---|---|
| `API-public-projects-list` | GET | `/public/projects` | | `?category=&cursor=`. **Published only.** Featured order overrides date (V1 C02) |
| `API-public-project-get` | GET | `/public/projects/{slug}` | | 404 if not `Published` |
| `API-public-reels-list` | GET | `/public/reels` | | Closes the missing public reels surface |
| `API-public-services-list` | GET | `/public/services` | | Active only, ordered |
| `API-public-packages-list` | GET | `/public/packages` | | Active only |
| `API-public-testimonials-list` | GET | `/public/testimonials` | | **`Approved` only** |
| `API-public-page-get` | GET | `/public/pages/{slug}` | | About, Privacy, Terms |
| `API-public-settings-get` | GET | `/public/settings` | | Contact, social, navigation, response-time promise |
| `API-public-showreel-get` | GET | `/public/showreel` | | Active version + poster + fallback |
| `API-lead-create` | POST | `/public/leads` | REQ | Rate limited + bot protected. **Persists before notifying** (V1 A3) |
| `API-review-access` | GET | `/review/{token}` | | Protected review link. Passphrase if set. `noindex`. Logs access |

---

## 2 · Authentication

| ID | Method | Path | Permission | Idem | Notes |
|---|---|---|---|---|---|
| `API-auth-login` | POST | `/auth/login` | Anonymous | | Returns `mfa_required` when enrollment exists |
| `API-auth-mfa-challenge` | POST | `/auth/mfa/challenge` | Anonymous | | TOTP or recovery code |
| `API-auth-refresh` | POST | `/auth/refresh` | Authenticated | | Sliding session |
| `API-auth-logout` | POST | `/auth/logout` | Authenticated | | Revokes current session |
| `API-auth-me` | GET | `/auth/me` | Authenticated | | User + effective permission set |
| `API-auth-password-forgot` | POST | `/auth/password/forgot` | Anonymous | | **Always `202`** regardless of account existence — no enumeration oracle |
| `API-auth-password-reset` | POST | `/auth/password/reset` | Anonymous | | Single-use token; revokes all sessions |
| `API-auth-password-change` | POST | `/auth/password/change` | Authenticated | | Requires current password |
| `API-auth-mfa-enroll` | POST | `/auth/mfa/enroll` | Authenticated | | Returns provisioning URI + recovery codes once |
| `API-auth-mfa-confirm` | POST | `/auth/mfa/confirm` | Authenticated | | Verifies first TOTP before activating |
| `API-auth-mfa-disable` | POST | `/auth/mfa/disable` | Authenticated | | Blocked if `mfaRequired` |
| `API-auth-sessions-list` | GET | `/auth/sessions` | Authenticated | | Own sessions (screen N09) |
| `API-auth-session-revoke` | DELETE | `/auth/sessions/{id}` | Authenticated | | Own sessions, or any with `PERM-users-write` |
| `API-invitation-accept` | POST | `/invitations/accept` | Anonymous | | Token → set password → `Active` |

---

## 3 · Users, roles, audit

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-user-list` | GET | `/admin/users` | `PERM-users-read` |
| `API-user-invite` | POST | `/admin/users/invite` | `PERM-users-write` |
| `API-user-update` | PATCH | `/admin/users/{id}` | `PERM-users-write` |
| `API-user-deactivate` | POST | `/admin/users/{id}/deactivate` | `PERM-users-write` |
| `API-user-roles-set` | PUT | `/admin/users/{id}/roles` | `PERM-users-write` |
| `API-role-list` | GET | `/admin/roles` | `PERM-users-read` |
| `API-role-create` | POST | `/admin/roles` | `PERM-users-write` |
| `API-role-update` | PATCH | `/admin/roles/{id}` | `PERM-users-write` |
| `API-permission-list` | GET | `/admin/permissions` | `PERM-users-read` |
| `API-audit-list` | GET | `/admin/audit` | `PERM-audit-read` |

`API-user-deactivate` and `API-user-roles-set` enforce the **last-admin-standing** invariant and return `409 conflict` when violated.

---

## 4 · Leads

| ID | Method | Path | Permission | Idem |
|---|---|---|---|---|
| `API-lead-list` | GET | `/admin/leads` | `PERM-leads-read` | |
| `API-lead-get` | GET | `/admin/leads/{id}` | `PERM-leads-read` | |
| `API-lead-create-manual` | POST | `/admin/leads` | `PERM-leads-write` | | 
| `API-lead-update` | PATCH | `/admin/leads/{id}` | `PERM-leads-write` | |
| `API-lead-status` | PATCH | `/admin/leads/{id}/status` | `PERM-leads-write` | |
| `API-lead-assign` | PATCH | `/admin/leads/{id}/assignee` | `PERM-leads-assign` | |
| `API-lead-convert` | POST | `/admin/leads/{id}/convert` | `PERM-leads-convert` | REQ |

`API-lead-list` filters: `status`, `serviceId`, `budgetRange`, `source`, `assigneeId`, `dateFrom/To`, `q`. **`budgetRange` filter and field require `PERM-leads-read-financial`.**

`API-lead-create-manual` forces `source = Manual` (V1 E02).
`API-lead-convert` transitions per Part G3 in one transaction; `409` unless status is `Won` or an authorised override is supplied.

---

## 5 · Clients

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-client-list` | GET | `/admin/clients` | `PERM-clients-read` |
| `API-client-get` | GET | `/admin/clients/{id}` | `PERM-clients-read` |
| `API-client-create` | POST | `/admin/clients` | `PERM-clients-write` |
| `API-client-update` | PATCH | `/admin/clients/{id}` | `PERM-clients-write` |
| `API-client-archive` | POST | `/admin/clients/{id}/archive` | `PERM-clients-archive` |
| `API-client-contact-create` | POST | `/admin/clients/{id}/contacts` | `PERM-clients-write` |
| `API-client-contact-update` | PATCH | `/admin/client-contacts/{id}` | `PERM-clients-write` |

Archived clients are excluded by default; `?includeArchived=true` to include (V1 E04).

---

## 6 · Projects, milestones, tasks, calendar

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-project-list` | GET | `/admin/projects` | `PERM-projects-read` |
| `API-project-get` | GET | `/admin/projects/{id}` | `PERM-projects-read` |
| `API-project-create` | POST | `/admin/projects` | `PERM-projects-write` |
| `API-project-update` | PATCH | `/admin/projects/{id}` | `PERM-projects-write` |
| `API-project-stage` | PATCH | `/admin/projects/{id}/stage` | `PERM-projects-stage` |
| `API-milestone-list` | GET | `/admin/projects/{id}/milestones` | `PERM-projects-read` |
| `API-milestone-create` | POST | `/admin/projects/{id}/milestones` | `PERM-projects-write` |
| `API-milestone-update` | PATCH | `/admin/milestones/{id}` | `PERM-projects-write` |
| `API-task-list` | GET | `/admin/tasks` | `PERM-tasks-read` |
| `API-task-create` | POST | `/admin/tasks` | `PERM-tasks-write` |
| `API-task-update` | PATCH | `/admin/tasks/{id}` | `PERM-tasks-write` |
| `API-task-complete` | POST | `/admin/tasks/{id}/complete` | `PERM-tasks-write` |
| `API-calendar-list` | GET | `/admin/calendar` | `PERM-calendar-read` |
| `API-calendar-create` | POST | `/admin/calendar` | `PERM-calendar-write` |
| `API-calendar-update` | PATCH | `/admin/calendar/{id}` | `PERM-calendar-write` |
| `API-calendar-delete` | DELETE | `/admin/calendar/{id}` | `PERM-calendar-write` |

`API-project-stage` warns but does not block on incomplete milestones in MVP (V1 E05); the warning is returned in the response body. `API-calendar-update` appends a reschedule entry to `ENT-ActivityLog`.

---

## 7 · Notes & attachments

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-note-list` | GET | `/admin/notes` | Inherits parent entity's read permission |
| `API-note-create` | POST | `/admin/notes` | Inherits parent entity's write permission |
| `API-note-delete` | DELETE | `/admin/notes/{id}` | Author, or `PERM-users-write` |
| `API-attachment-create` | POST | `/admin/attachments` | Inherits parent entity's write permission |
| `API-attachment-signed-url` | GET | `/admin/attachments/{id}/url` | Inherits parent entity's read permission |
| `API-attachment-delete` | DELETE | `/admin/attachments/{id}` | Inherits parent entity's write permission |

Signed attachment URLs expire in 5 minutes and are single-audience. Rights-evidence attachments additionally require `PERM-rights-read`.

---

## 8 · Dashboard & search

| ID | Method | Path | Permission | Notes |
|---|---|---|---|---|
| `API-dashboard-kpis` | GET | `/admin/dashboard/kpis` | Authenticated | Cards filtered to the caller's permissions — finance cards absent without `PERM-finance-read` (V1 E01) |
| `API-dashboard-leadwave` | GET | `/admin/dashboard/leadwave` | `PERM-leads-read` | Time series for the wave chart |
| `API-dashboard-activity` | GET | `/admin/dashboard/activity` | Authenticated | Recent actions, permission-filtered |
| `API-dashboard-upcoming` | GET | `/admin/dashboard/upcoming` | `PERM-calendar-read` | Calls, shoots, deadlines |
| `API-global-search` | GET | `/admin/search` | Authenticated | Cross-entity, permission-filtered. Closes the missing global search |

Aggregates are cached 60s. **Widgets fail independently** — one failing aggregate returns a per-widget error rather than failing the screen (V1 E01).

---

## 9 · Media

| ID | Method | Path | Permission | Idem |
|---|---|---|---|---|
| `API-media-list` | GET | `/admin/media` | `PERM-media-read` | |
| `API-media-get` | GET | `/admin/media/{id}` | `PERM-media-read` | |
| `API-media-upload-session` | POST | `/admin/media/upload-session` | `PERM-media-write` | |
| `API-media-complete` | POST | `/admin/media/{id}/complete` | `PERM-media-write` | REQ |
| `API-media-update` | PATCH | `/admin/media/{id}` | `PERM-media-write` | |
| `API-media-poster-candidates` | GET | `/admin/media/{id}/poster-candidates` | `PERM-media-write` | |
| `API-media-poster-set` | POST | `/admin/media/{id}/poster` | `PERM-media-write` | |
| `API-media-retry` | POST | `/admin/media/{id}/retry` | `PERM-media-write` | |
| `API-media-usage` | GET | `/admin/media/{id}/usage` | `PERM-media-read` | |
| `API-media-archive` | POST | `/admin/media/{id}/archive` | `PERM-media-delete` | |
| `API-media-delete` | DELETE | `/admin/media/{id}` | `PERM-media-delete` | |
| `API-media-webhook` | POST | `/webhooks/media` | Anonymous + signature | REQ |
| `API-beforeafter-list` | GET | `/admin/before-after` | `PERM-media-read` | |
| `API-beforeafter-create` | POST | `/admin/before-after` | `PERM-media-write` | |
| `API-beforeafter-update` | PATCH | `/admin/before-after/{id}` | `PERM-media-write` | |
| `API-beforeafter-delete` | DELETE | `/admin/before-after/{id}` | `PERM-media-write` | |

`API-media-delete` returns `409 dependency_in_use` when `ENT-MediaUsage` shows active published use — the V1 F02 rule, now enforceable.
`API-media-webhook` is **`Anonymous` at the routing layer but never unauthenticated**: HMAC signature verification, timestamp window, and replay protection are specified in Part H′. Its idempotency key derives from the provider event ID.

---

## 10 · Portfolio & rights

| ID | Method | Path | Permission | Idem |
|---|---|---|---|---|
| `API-portfolio-list` | GET | `/admin/portfolio` | `PERM-portfolio-read` | |
| `API-portfolio-get` | GET | `/admin/portfolio/{id}` | `PERM-portfolio-read` | |
| `API-portfolio-create` | POST | `/admin/portfolio` | `PERM-portfolio-write` | |
| `API-portfolio-update` | PATCH | `/admin/portfolio/{id}` | `PERM-portfolio-write` | |
| `API-portfolio-blocks-set` | PUT | `/admin/portfolio/{id}/blocks` | `PERM-portfolio-write` | |
| `API-portfolio-preview-token` | GET | `/admin/portfolio/{id}/preview-token` | `PERM-portfolio-read` | |
| `API-portfolio-publish` | POST | `/admin/portfolio/{id}/publish` | `PERM-portfolio-publish` | REQ |
| `API-portfolio-unpublish` | POST | `/admin/portfolio/{id}/unpublish` | `PERM-portfolio-publish` | |
| `API-rights-register` | GET | `/admin/rights` | `PERM-rights-read` | |
| `API-rights-get` | GET | `/admin/portfolio/{id}/rights` | `PERM-rights-read` | |
| `API-release-create` | POST | `/admin/rights/{id}/releases` | `PERM-rights-write` | |
| `API-release-update` | PATCH | `/admin/releases/{id}` | `PERM-rights-write` | |
| `API-release-approve` | POST | `/admin/releases/{id}/approve` | `PERM-rights-approve` | |
| `API-release-revoke` | POST | `/admin/releases/{id}/revoke` | `PERM-rights-write` | |

`API-portfolio-publish` returns `422 rights_not_cleared` with the outstanding release list when the gate fails, and `422 media_not_ready` when cover or poster are not `Ready`. Preview tokens are short-lived and served `noindex` (V1 F07).

---

## 11 · Reels & showreel

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-reel-list` | GET | `/admin/reels` | `PERM-portfolio-read` |
| `API-reel-create` | POST | `/admin/reels` | `PERM-portfolio-write` |
| `API-reel-update` | PATCH | `/admin/reels/{id}` | `PERM-portfolio-write` |
| `API-reel-publish` | POST | `/admin/reels/{id}/publish` | `PERM-portfolio-publish` |
| `API-showreel-list` | GET | `/admin/showreel` | `PERM-site-read` |
| `API-showreel-activate` | POST | `/admin/showreel/activate` | `PERM-site-publish` |
| `API-showreel-rollback` | POST | `/admin/showreel/rollback` | `PERM-site-publish` |

Activation is atomic against the partial unique index, then triggers revalidation (V1 F09).

---

## 12 · Site CMS — the endpoints V1 required and never defined

Backs screens F10–F15. Without these, V1's `AC-C07-1` ("owner can change package without deployment") is unsatisfiable.

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-service-list` | GET | `/admin/services` | `PERM-site-read` |
| `API-service-create` | POST | `/admin/services` | `PERM-site-write` |
| `API-service-update` | PATCH | `/admin/services/{id}` | `PERM-site-write` |
| `API-service-archive` | POST | `/admin/services/{id}/archive` | `PERM-site-write` |
| `API-package-list` | GET | `/admin/packages` | `PERM-site-read` |
| `API-package-create` | POST | `/admin/packages` | `PERM-site-write` |
| `API-package-update` | PATCH | `/admin/packages/{id}` | `PERM-site-write` |
| `API-package-archive` | POST | `/admin/packages/{id}/archive` | `PERM-site-write` |
| `API-testimonial-list` | GET | `/admin/testimonials` | `PERM-site-read` |
| `API-testimonial-create` | POST | `/admin/testimonials` | `PERM-site-write` |
| `API-testimonial-update` | PATCH | `/admin/testimonials/{id}` | `PERM-site-write` |
| `API-testimonial-approve` | POST | `/admin/testimonials/{id}/approve` | `PERM-site-publish` |
| `API-category-list` | GET | `/admin/categories` | `PERM-site-read` |
| `API-category-create` | POST | `/admin/categories` | `PERM-site-write` |
| `API-category-update` | PATCH | `/admin/categories/{id}` | `PERM-site-write` |
| `API-category-archive` | POST | `/admin/categories/{id}/archive` | `PERM-site-write` |
| `API-tag-list` | GET | `/admin/tags` | `PERM-site-read` |
| `API-tag-create` | POST | `/admin/tags` | `PERM-site-write` |
| `API-tag-update` | PATCH | `/admin/tags/{id}` | `PERM-site-write` |
| `API-tag-merge` | POST | `/admin/tags/{id}/merge` | `PERM-site-write` |
| `API-tag-archive` | POST | `/admin/tags/{id}/archive` | `PERM-site-write` |
| `API-page-list` | GET | `/admin/pages` | `PERM-site-read` |
| `API-page-get` | GET | `/admin/pages/{slug}` | `PERM-site-read` |
| `API-page-update` | PATCH | `/admin/pages/{slug}` | `PERM-site-write` |
| `API-page-publish` | POST | `/admin/pages/{slug}/publish` | `PERM-site-publish` |
| `API-navigation-list` | GET | `/admin/navigation` | `PERM-site-read` |
| `API-navigation-set` | PUT | `/admin/navigation` | `PERM-site-write` |
| `API-setting-list` | GET | `/admin/settings` | `PERM-site-read` |
| `API-setting-set` | PUT | `/admin/settings` | `PERM-site-write` |

Archiving a `Category` in use returns `409 dependency_in_use`.

---

## 13 · Client review — MVP, see Part G′

| ID | Method | Path | Permission |
|---|---|---|---|
| `API-reviewlink-create` | POST | `/admin/projects/{id}/review-links` | `PERM-projects-write` |
| `API-reviewlink-list` | GET | `/admin/projects/{id}/review-links` | `PERM-projects-read` |
| `API-reviewlink-revoke` | DELETE | `/admin/review-links/{id}` | `PERM-projects-write` |
| `API-reviewfeedback-create` | POST | `/admin/projects/{id}/review-feedback` | `PERM-projects-write` |
| `API-reviewfeedback-list` | GET | `/admin/projects/{id}/review-feedback` | `PERM-projects-read` |

`API-reviewlink-create` requires the target asset to have `role = ReviewCopy` and `status = Ready`.

---

## 14 · Finance — `DEFERRED-V2`

Not implemented in MVP. Registered here so that references from the ADRs resolve, and so V2 does not repeat V1's habit of naming an endpoint in prose without defining it.

| ID | Method | Path | Permission | Idem |
|---|---|---|---|---|
| `API-quote-create` | POST | `/admin/quotes` | `PERM-finance-quote-write` | |
| `API-quote-send` | POST | `/admin/quotes/{id}/send` | `PERM-finance-quote-write` | |
| `API-invoice-create` | POST | `/admin/invoices` | `PERM-finance-write` | REQ |
| `API-payment-record` | POST | `/admin/invoices/{id}/payments` | `PERM-finance-write` | REQ |

`API-invoice-create` and `API-payment-record` require idempotency because invoice numbers are immutable once issued (V1 E09) — duplicate issuance is a finance defect, not a cosmetic one.

---

## 15 · Internal commands (not HTTP)

Scheduled jobs. Named here so the traceability matrix can reference them.

| ID | Schedule | Purpose |
|---|---|---|
| `JOB-rights-sweep` | Hourly | Expire/revoke releases; unpublish dependents; purge CDN; notify ([ADR-005](../decisions/ADR-005-publishing-rights.md)) |
| `JOB-media-reconcile` | Every 15 min | Recover assets stranded mid-state by a lost webhook (Part H′) |
| `JOB-idempotency-purge` | Daily | Delete `ENT-IdempotencyRecord` older than 24h |
| `JOB-session-purge` | Daily | Delete expired sessions and used tokens |
| `JOB-notification-dispatch` | Every 60 s | Claim and send queued notifications ([O4.2](../parts/O4-notification-architecture.md)) |
| `JOB-notification-retry` | Every 5 min | Retry `Failed` notifications within policy |
| `JOB-task-overdue-digest` | Daily | Overdue task digest to assignees |
| `JOB-db-backup` | Nightly | Encrypted `pg_dump` to R2; weekly copy offsite ([O1.4](../parts/O1-backup-recovery.md)) |
| `JOB-r2-replicate` | Nightly | Copy `sources/` and `backups/` to the offsite bucket. **Derivatives excluded** |
| `JOB-storage-reconcile` | Nightly, and after any restore | Repair DB↔storage divergence; quarantine orphans ([O1.7](../parts/O1-backup-recovery.md)) |
| `JOB-restore-verify` | Monthly | Restore the latest dump to a scratch database and assert integrity ([O1.8](../parts/O1-backup-recovery.md)) |
| `JOB-retention-sweep` | Nightly | Enforce retention; anonymise dormant leads; reclaim orphans ([O7.4](../parts/O7-data-lifecycle.md)) |

- **Every job above registers a cron monitor** ([ADR-007](../decisions/ADR-007-observability.md)). Non-execution raises `NTF-028`. A job that silently stops running is the failure mode with no other symptom.
- `JOB-retention-sweep` runs in **dry-run for its first 30 days in production** ([`RULE-O7-9`](../parts/O7-data-lifecycle.md)).
