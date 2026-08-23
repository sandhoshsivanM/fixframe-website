# Reference · Permissions

**Normative.** Per [ADR-004](../decisions/ADR-004-permissions.md): permissions are atomic, roles are named bundles, a user holds many roles.

V1's Part J2 matrix used qualitative cells — `Full`, `Read limited`, `Quote limited`, `Upload/Internal`. Those are not implementable as written. Each is decomposed here into atomic permissions, which is the specific problem atomic permissions exist to solve.

---

## 1 · Permission catalogue

Seeded at install. **Never user-editable** — adding a permission is a migration.

### site
| ID | Grants |
|---|---|
| `PERM-site-read` | View site content, settings, navigation in admin |
| `PERM-site-write` | Edit site pages, navigation, contact details, SEO defaults |
| `PERM-site-publish` | Publish site page changes live |

### media
| ID | Grants |
|---|---|
| `PERM-media-read` | Browse the media library |
| `PERM-media-write` | Upload, edit metadata, set posters and crops, create before/after pairs |
| `PERM-media-publish` | Set an asset `visibility = Public` |
| `PERM-media-delete` | Archive or delete an asset (subject to `ENT-MediaUsage` checks) |

`PERM-media-write` without `PERM-media-publish` is exactly V1's "Upload/Internal" cell for Production — they can add media, they cannot make it public.

### portfolio
| ID | Grants |
|---|---|
| `PERM-portfolio-read` | View portfolio drafts |
| `PERM-portfolio-write` | Create and edit portfolio projects, blocks, reels |
| `PERM-portfolio-publish` | Publish, schedule, unpublish (gated additionally by rights — see below) |

### rights
| ID | Grants |
|---|---|
| `PERM-rights-read` | View the rights checklist and register |
| `PERM-rights-write` | Record releases and attach evidence |
| `PERM-rights-approve` | Move a release to `Granted` |

> **Separation of duty.** `write` records the claim; `approve` accepts it. A single user may hold both, but the log distinguishes the two acts — which is the point of an evidence trail.

### leads
| ID | Grants |
|---|---|
| `PERM-leads-read` | View leads and briefs |
| `PERM-leads-read-financial` | Additionally view `budgetRange` and commercial fields |
| `PERM-leads-write` | Edit, change status, add notes and tasks |
| `PERM-leads-assign` | Assign an owner |
| `PERM-leads-convert` | Convert a Won lead to Client + Project |

`PERM-leads-read` without `PERM-leads-read-financial` is V1's "Read limited" for Finance, made precise.

### clients
`PERM-clients-read` · `PERM-clients-write` · `PERM-clients-archive`

### projects
`PERM-projects-read` · `PERM-projects-write` · `PERM-projects-stage` (change stage) · `PERM-projects-assign`

### tasks
`PERM-tasks-read` · `PERM-tasks-write` · `PERM-tasks-assign`

### calendar
`PERM-calendar-read` · `PERM-calendar-write`

### finance — `DEFERRED-V2`
| ID | Grants |
|---|---|
| `PERM-finance-read` | Full finance visibility |
| `PERM-finance-read-project` | Payment status on projects the user can see — V1's "Read limited" for Production |
| `PERM-finance-quote-write` | Create and send quotes only — V1's "Quote limited" for Sales |
| `PERM-finance-write` | Invoices and payments |

### users
`PERM-users-read` · `PERM-users-write` (invite, deactivate, assign roles) · `PERM-audit-read` (view `ENT-ActivityLog`)

---

## 2 · Seeded system roles

`isSystem = true`. Cannot be deleted or renamed. Users may hold several.

| Permission | Owner | ContentEditor | Sales | Production | Finance |
|---|:--:|:--:|:--:|:--:|:--:|
| `site-read` | ● | ● | ● | ● | |
| `site-write` | ● | ● | | | |
| `site-publish` | ● | ● | | | |
| `media-read` | ● | ● | ● | ● | |
| `media-write` | ● | ● | | ● | |
| `media-publish` | ● | ● | | | |
| `media-delete` | ● | ● | | | |
| `portfolio-read` | ● | ● | ● | ● | |
| `portfolio-write` | ● | ● | | | |
| `portfolio-publish` | ● | ● | | | |
| `rights-read` | ● | ● | ● | ● | |
| `rights-write` | ● | ● | ● | | |
| `rights-approve` | ● | | | | |
| `leads-read` | ● | ● | ● | ● | ● |
| `leads-read-financial` | ● | | ● | | ● |
| `leads-write` | ● | | ● | | |
| `leads-assign` | ● | | ● | | |
| `leads-convert` | ● | | ● | | |
| `clients-read` | ● | ● | ● | ● | ● |
| `clients-write` | ● | | ● | | |
| `clients-archive` | ● | | | | |
| `projects-read` | ● | ● | ● | ● | ● |
| `projects-write` | ● | | | ● | |
| `projects-stage` | ● | | | ● | |
| `projects-assign` | ● | | | ● | |
| `tasks-read` | ● | ● | ● | ● | ● |
| `tasks-write` | ● | ● | ● | ● | ● |
| `tasks-assign` | ● | | ● | ● | |
| `calendar-read` | ● | ● | ● | ● | |
| `calendar-write` | ● | | ● | ● | |
| `finance-read` | ● | | | | ● |
| `finance-read-project` | ● | | | ● | |
| `finance-quote-write` | ● | | ● | | |
| `finance-write` | ● | | | | ● |
| `users-read` | ● | | | | |
| `users-write` | ● | | | | |
| `audit-read` | ● | | | | |

`rights-approve` is Owner-only by default. It is the control that authorises publishing a client's footage; delegating it should be a deliberate act, not a default.

**Tasks are writable by every internal role** — V1 E08 states the primary user is "all internal roles", and a task system nobody can update is useless.

---

## 3 · Rules the matrix cannot express

Enforced in the service layer, tested explicitly.

| Rule | Detail |
|---|---|
| **Last admin standing** | At least one `Active` user must hold `PERM-users-write`. Blocks the final removal, deactivation or role edit that would violate it. |
| **Publish requires rights clearance** | `PERM-portfolio-publish` is necessary but not sufficient. The publish transaction independently evaluates `ENT-RightsRecord` per [ADR-005](../decisions/ADR-005-publishing-rights.md). Permission and clearance are separate gates. |
| **Production project scope** | `PERM-projects-*` for the `Production` role is scoped to projects where the user is `ownerId` or an assignee, unless they also hold `Owner`. |
| **Internal notes** | No permission exposes `ENT-Note` where `isInternal` through a public or client-facing surface. Enforced at the serialiser (V1 A3). |
| **MFA on privilege** | Any user holding `PERM-users-write` has `mfaRequired` forced true. Granting the permission triggers enrollment on next login. |
| **Anonymous is not a role** | Public access is the absence of authentication. Endpoints are marked `Anonymous` in [api.md](api.md); no role grants it. |

---

## 4 · Enforcement

- Checked **server-side on every endpoint** without exception (V1 J1). Client-side checks are presentation only.
- Every endpoint in [api.md](api.md) names its required permission, or `Anonymous`.
- Denials are `403` and are logged to `ENT-ActivityLog` — a spike in denials is a signal worth alerting on.
- A permission check failure on a *collection* endpoint filters rather than 403s, so a user with partial scope sees their subset rather than an error.
