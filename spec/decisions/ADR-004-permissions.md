# ADR-004 · Permissions composed into roles

**Status:** ACCEPTED
**Supersedes:** V1 Part 0.2 (six fixed roles) and J2 (role × module matrix)

## Context

V1 defines six roles — Visitor, Owner/Admin, Content Editor, Sales, Production, Finance — and a J2 matrix granting each a fixed capability set per module. The model assumes six distinct people.

This is a small studio. In practice one owner is very likely to be Admin **and** Sales **and** Production **and** Finance simultaneously, and an early hire may be Content Editor **and** Production. V1's model forces an impossible choice: grant that person `Admin` and lose all least-privilege meaning, or create a seventh hybrid role and then an eighth as soon as the team shifts.

There is also no screen anywhere in V1 for assigning any of this — the audit found `Users/Settings` in the J2 matrix with no corresponding screen.

## Decision

**Permissions are atomic. Roles are named bundles of permissions. A user holds many roles.**

```
ENT-Permission   (module, action)          — atomic capability, seeded, not user-editable
ENT-Role         (name, description, isSystem)
ENT-RolePermission  (roleId, permissionId) — many-to-many
ENT-UserRole        (userId, roleId)       — many-to-many
```

Authorisation asks one question: *does this user hold this permission through any of their roles?* Never *is this user this role?*

### Permission format

`PERM-<module>-<action>`, e.g. `PERM-leads-write`, `PERM-media-publish`, `PERM-finance-read`.

Modules follow J2: `site`, `media`, `leads`, `clients`, `projects`, `portfolio`, `finance`, `users`, `rights`.
Actions: `read`, `write`, `publish`, `delete`, `assign`, `approve`.

Not every combination exists. The seeded set is enumerated normatively in `reference/permissions.md`.

### Seeded system roles

The six J2 roles ship as `isSystem` bundles, so V1's intent is preserved exactly — but they are now *compositions*, and a user may hold several.

| Role | Approximates V1 |
|---|---|
| `Owner` | Admin — holds every permission including `PERM-users-write` |
| `ContentEditor` | Content |
| `Sales` | Sales |
| `Production` | Production |
| `Finance` | Finance |

`Visitor` is **not** a role. It is the absence of authentication, and modelling it as a role invites the mistake of assigning it. Public endpoints are marked `Anonymous` in `reference/api.md`.

## Consequences

- The J2 matrix becomes *generated documentation* rather than the source of truth. `reference/permissions.md` holds the seeded role→permission mapping; the matrix in the parts is rendered from it and must agree.
- **Screen N07** (user management) and **N08** (role assignment) exist to administer this — the screens V1 was missing.
- `isSystem` roles cannot be deleted, and `Owner` cannot have `PERM-users-write` revoked. This prevents an admin locking the studio out of its own installation.
- **At least one active user must always hold `PERM-users-write`.** Enforced at the service layer on both role removal and user deactivation.
- Custom roles are permitted from day one. The cost is one screen; the benefit is that the team can reorganise without a code change — which is the same "no developer needed" principle V1 applies to content.
- Permission checks are server-side on every endpoint (V1 J1 already requires this). Client-side checks are presentation only and are never trusted.

## Override condition

None foreseen. If the studio genuinely stays at one user, the model costs one extra join and remains correct.

## Alternatives considered

**Keep six fixed roles, allow multiple role assignment.** Nearly as good and simpler, but it leaves the capability sets uneditable — a new capability needs a code change. Rejected for a marginal simplification.

**Full ABAC / policy engine.** Rejected as heavy for the domain. The one attribute-shaped rule in the spec is "Production sees only projects they own", which is expressible as a scoped filter on a permission rather than a policy language. Revisit only if such rules multiply.
