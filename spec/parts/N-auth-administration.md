# Part N · Authentication & Administration

**Status:** ACCEPTED
**Closes:** V1 defined `POST /api/auth/login` with no login screen, required MFA in J1 with no enrollment flow, listed `Users/Settings` in the J2 permission matrix with no screen, and wrote `ActivityLog` on every state change with no way to read it.
**Implements:** [ADR-004](../decisions/ADR-004-permissions.md)

---

## N1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-N-001` | A user can authenticate, recover access, and manage their own credentials without administrator involvement. |
| `REQ-N-002` | MFA is available to all users and **mandatory** for any user holding `PERM-users-write`. |
| `REQ-N-003` | Users are onboarded by invitation. Self-registration does not exist. |
| `REQ-N-004` | An administrator can compose roles from permissions and assign multiple roles per user. |
| `REQ-N-005` | The system cannot be locked out of its own administration. |
| `REQ-N-006` | A user can see and revoke their own active sessions. |
| `REQ-N-007` | The audit log is readable, filterable, and append-only. |
| `REQ-N-008` | No authentication surface reveals whether an account exists. |

---

## N2 · Decisions taken here

Rather than defer, three choices V1 left implicit are settled:

| Choice | Decision | Why |
|---|---|---|
| MFA method | **TOTP** (RFC 6238) + 10 single-use recovery codes | Works offline, no SMS cost, no carrier dependency, no phone-number PII. Email OTP would make the mailbox a single point of failure for both factors. |
| Session transport | `HttpOnly; Secure; SameSite=Lax` cookie for the admin UI | Not readable by script; CSRF handled by the SameSite policy plus a token on state-changing requests |
| Session lifetime | 12h absolute, 2h idle, sliding on activity | A studio works in day-length sessions; 30-day tokens on a system holding client contracts are not defensible |
| Password policy | Minimum 12 characters, checked against a breached-password list, **no composition rules** | Composition rules produce `Password1!` and nothing safer. Length plus breach-checking is the current consensus |
| Lockout | 5 failures → 15-minute lockout, exponential thereafter | Blunts credential stuffing without giving an attacker a denial-of-service lever, since lockout is per-account-per-IP |

---

## N3 · Screens

### N01 · `/admin/login` — Login

Primary user: any internal user · Goal: authenticate · CTA `[SIGN IN]` · Permission: `Anonymous`

**Structure.** Email · password · sign-in · forgot-password link. No sign-up link — invitation only.

**Business logic.**
- `RULE-N3-1` — Invalid credentials and unknown accounts return the **same** message and the same response time. Constant-time comparison, and a dummy hash verification on unknown accounts so timing does not distinguish them.
- `RULE-N3-2` — Success with MFA enrolled returns `mfa_required` and a short-lived challenge token; **no session is issued** until the second factor succeeds.
- `RULE-N3-3` — `mfaRequired = true` with no enrollment routes to N05 before anything else is reachable.
- `RULE-N3-4` — Login from an unrecognised device or IP raises `NTF-022`.

**States.** *Loading* button disabled with progress · *Error* credentials retained except password, generic message, lockout shows remaining time · *Success* redirect to the originally requested URL, or `/admin`.

**Acceptance.** `AC-N01-1` No response distinguishes unknown account from wrong password, by body, status or timing. `AC-N01-2` Lockout engages at 5 failures and releases correctly. `AC-N01-3` MFA-enrolled users receive no session before the challenge.

---

### N02 · `/admin/login/mfa` — MFA Challenge

CTA `[VERIFY]` · Secondary `[USE A RECOVERY CODE]` · Permission: valid challenge token

- `RULE-N3-5` — Challenge token expires in 5 minutes and is single-use.
- `RULE-N3-6` — Recovery codes are single-use; consuming one raises `NTF-021` and warns when 3 or fewer remain.
- `RULE-N3-7` — 5 failed attempts invalidate the challenge and return to N01.

`AC-N02-1` A consumed recovery code cannot be reused. `AC-N02-2` TOTP accepts ±1 time step and no more.

---

### N03 · `/admin/forgot` · `/admin/reset` — Password Recovery

- `RULE-N3-8` — **Always responds `202`**, whether or not the account exists (`REQ-N-008`).
- `RULE-N3-9` — Token is single-use, 60-minute validity, invalidated by any password change.
- `RULE-N3-10` — A successful reset **revokes every existing session** for that user and raises `NTF-020`.

`AC-N03-1` Response is identical for known and unknown addresses. `AC-N03-2` A used token fails on second use. `AC-N03-3` All sessions terminate on reset.

---

### N04 · `/invitations/accept` — Accept Invitation

Structure: invitation context (inviter, roles being granted) · set password · accept.

- `RULE-N3-11` — Token single-use, 7-day expiry; expired tokens offer to request a new invitation rather than dead-ending.
- `RULE-N3-12` — Acceptance sets `status = Active` and applies the roles recorded on the invitation, not roles chosen by the invitee.
- `RULE-N3-13` — If the granted roles include `PERM-users-write`, enrollment (N05) is forced immediately.

`AC-N04-1` Roles applied match the invitation exactly. `AC-N04-2` Expired invitations cannot create a user.

---

### N05 · `/admin/security/mfa` — MFA Enrollment

Structure: QR provisioning URI + manual secret · confirm with a live code · recovery codes shown **once** with explicit acknowledgement.

- `RULE-N3-14` — Enrollment activates only after a valid code is submitted — otherwise a mis-scanned secret locks the user out.
- `RULE-N3-15` — Recovery codes are displayed exactly once; only hashes are stored.
- `RULE-N3-16` — Disabling MFA is blocked while `mfaRequired`.

`AC-N05-1` An unconfirmed enrollment does not gate login. `AC-N05-2` Codes are unrecoverable after the acknowledgement.

---

### N06 · `/admin/profile` — Profile & Security

Display name · change password (requires current) · MFA status · regenerate recovery codes · active sessions summary. Permission: `Authenticated`.

`AC-N06-1` Password change requires the current password and raises `NTF-020`.

---

### N07 · `/admin/users` — User Management

Primary user: Owner · CTA `[INVITE USER]` · Permission: `PERM-users-read`, mutations `PERM-users-write`

**Structure.** List: name, email, status, roles, last login, MFA state. Detail: role assignment, activity, sessions, deactivate.

- `RULE-N3-17` — **Last admin standing.** Any operation that would leave zero `Active` users holding `PERM-users-write` returns `409 conflict`. Enforced on role removal, deactivation, and role-permission edits alike — all three routes reach the same invariant.
- `RULE-N3-18` — Deactivation is a status change. Users are never hard-deleted, so `ActivityLog` actors keep resolving.
- `RULE-N3-19` — Deactivation revokes all sessions immediately.
- `RULE-N3-20` — Granting a role containing `PERM-users-write` raises `NTF-023` to the user and all Owners.

`AC-N07-1` The final administrator cannot be demoted, deactivated, or have the permission removed via role edit. `AC-N07-2` Deactivation terminates sessions within one request cycle. `AC-N07-3` Deactivated users retain resolvable audit history.

---

### N08 · `/admin/roles` — Roles & Permissions

**Structure.** Role list with system/custom badge and member count · permission grid per role, grouped by module · member list.

- `RULE-N3-21` — System roles cannot be renamed or deleted. Their permission sets **may** be edited — with a warning, since it silently changes what existing holders can do.
- `RULE-N3-22` — `Owner` cannot have `PERM-users-write` removed.
- `RULE-N3-23` — Deleting a custom role requires reassigning or explicitly orphaning its members; it is never silently removed from users.
- `RULE-N3-24` — Permissions themselves are seeded and not editable here (per [ADR-004](../decisions/ADR-004-permissions.md)).

`AC-N08-1` A user holding two roles receives the **union** of their permissions. `AC-N08-2` Revoking a permission takes effect on the holder's next request, not their next login. `AC-N08-3` The J2 matrix rendered in the docs matches the seeded data exactly.

Point `AC-N08-2` matters: caching effective permissions in the session token would make revocation take up to 12 hours. Permissions resolve per-request, cached at most 60 seconds.

---

### N09 · `/admin/profile/sessions` — Active Sessions

List: device, browser, IP, location if derivable, started, last seen, current-session marker. Revoke individually or all-others.

- `RULE-N3-25` — Users always see and revoke their own sessions. Others' sessions require `PERM-users-write`.
- `RULE-N3-26` — Revocation takes effect within 60 seconds — the session validity cache window.

`AC-N09-1` A revoked session's next request returns 401.

---

### N10 · `/admin/audit` — Audit Log

Primary user: Owner · Permission: `PERM-audit-read`

**Structure.** Filters: actor, action, entity type, entity, date range. Columns: when, actor, action, entity, IP. Detail drawer with the `metadata` payload.

- `RULE-N3-27` — **Append-only.** No update or delete path exists in the API or the data layer.
- `RULE-N3-28` — System actions record actor `system` with the triggering job ID, never a null that reads as "unknown".
- `RULE-N3-29` — The log never stores secrets, tokens, passwords, or full lead brief bodies — entity references and diffs of changed field *names*, not sensitive values.
- `RULE-N3-30` — Reading the audit log is itself audited.

`AC-N10-1` No API path mutates an existing entry. `AC-N10-2` Rights transitions, permission grants, publish and unpublish all appear. `AC-N10-3` No secret material appears in any entry.

---

## N4 · Cross-cutting

| Rule | ID |
|---|---|
| Every admin route requires authentication; unauthenticated requests get `401`, authenticated-but-unauthorised get `403`. Never 404-as-403 — it hides bugs from operators. | `RULE-N4-1` |
| Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`. State-changing requests additionally carry a CSRF token. | `RULE-N4-2` |
| Auth endpoints rate-limited at 10/min/IP with exponential backoff. | `RULE-N4-3` |
| Password hashing: Argon2id, parameters recorded in `reference/` and reviewed annually. | `RULE-N4-4` |
| TOTP secrets encrypted at rest with a key from the secret manager — **never** the database or the repo. | `RULE-N4-5` |
| Admin routes carry `noindex` and are excluded from the sitemap. | `RULE-N4-6` |
