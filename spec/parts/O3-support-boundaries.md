# Part O3 · Support Boundaries

**Status:** ACCEPTED
**Closes:** V1 M3 step 12 — *"Understand backups, support and what requires a developer"* — which the [Increment 1 walkthrough](../traceability/walkthrough.md) found to be the single blocked handover step.

> V1 claims the owner needs no developer for routine content. True, and incomplete: it never says where routine ends. Without that line, every unfamiliar situation becomes a phone call, and the independence the product promises quietly evaporates.

---

## O3.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O3-001` | Every operational task names exactly one responsible level. |
| `REQ-O3-002` | The owner can determine, unaided, whether a situation is theirs to handle. |
| `REQ-O3-003` | Escalation has a defined path and expected response. |
| `REQ-O3-004` | Actions the owner must never take are stated, with the reason. |

---

## O3.2 · The three levels

| Level | Who | Assumed skill |
|---|---|---|
| **Owner** | Studio principal | Uses the admin UI. No terminal, no code, no vendor consoles |
| **Studio** | Trained internal staff — content editor, producer | Uses the admin UI fluently, including retry and reconciliation actions |
| **Developer** | Whoever holds the maintenance agreement | Repo, CI, database, vendor consoles, secret manager |

`Owner` ⊂ `Studio` ⊂ `Developer` in capability. Naming the *lowest* level that can do a task is what the table below does.

---

## O3.3 · Boundary table

### Content and publishing — entirely Owner

| Task | Level |
|---|---|
| Upload video, photos, reels; set posters, crops, focal points | Owner |
| Create, preview, publish, unpublish a portfolio project | Owner |
| Record and approve rights releases; renew an expiring release | Owner |
| Edit services, packages, testimonials, pages, navigation, contact details | Owner |
| Swap the active showreel; roll back to the previous one | Owner |
| Manage categories and tags | Owner |

Nothing in this block requires a developer. That is the product working as V1 described.

### Sales and delivery — Owner or Studio

| Task | Level |
|---|---|
| Work leads, notes, statuses, assignment | Owner |
| Convert a Won lead; manage clients, projects, milestones, tasks, calendar | Owner |
| Create and revoke review links; record client feedback | Owner |
| Invite users, assign roles, deactivate a user | Owner |
| Create a **custom role** from permissions | Studio |
| Read the audit log | Owner |

### Media failures — where the line actually falls

| Situation | Level | Action |
|---|---|---|
| Upload fails validation (wrong format, too large) | Owner | Re-export and retry; message states the accepted formats |
| Processing `Failed`, retry available | Owner | Press retry on `F01` — metadata is preserved |
| Retry fails twice on the same file | Studio | Try a different export; if it persists, escalate |
| Job `DeadLettered` | **Developer** | Exhausted retries mean a systemic fault, not a bad file |
| Asset stuck `Processing` beyond 2 h | Owner | Wait one reconciliation cycle (15 min); it usually self-repairs |
| Still stuck after 3 cycles | **Developer** | Provider or webhook fault |
| Video plays in admin, not publicly | Studio | Check `visibility` and publish state before escalating |

- `RULE-O3-1` — The owner's media responsibility ends at **one retry**. Beyond that the cause is systemic and further retries waste their time and erode trust in the button.

### Publishing blocked

| Situation | Level | Action |
|---|---|---|
| `422 rights_not_cleared` | Owner | Open `R01`, complete the checklist. **Working as designed** |
| `422 media_not_ready` | Owner | Wait for processing, or select a different asset |
| Published project vanished, reason `RightsLapsed` | Owner | A release expired. Renew on `R02`, republish |
| Publish succeeds, page does not update | Studio | Cache revalidation; retry once, then escalate |

- `RULE-O3-2` — A rights block is **not an incident**. The alert copy and the runbook both say so, or the owner will report the system's most important safety feature as a bug.

### Infrastructure and data — always Developer

| Task | Level |
|---|---|
| Database restore, PITR, migrations | Developer |
| Backup failures, restore verification failures | Developer |
| Storage reconciliation, quarantine review, Stream rebuild | Developer |
| Secret and credential rotation; webhook signature rotation | Developer |
| Deploys, rollbacks, CI, dependency and security patching | Developer |
| Vendor consoles — Cloudflare, Neon, Sentry, Resend | Developer |
| Any S1 or S2 incident | Developer |
| **Permanently deleting a client, lead or media asset** | Developer |

- `RULE-O3-3` — Hard deletion is developer-only **by construction**, not by policy: the admin UI exposes archive and unpublish, and no delete. See [O7](O7-data-lifecycle.md). An owner cannot destroy data they cannot reach.

---

## O3.4 · Never, and why

| Never | Why |
|---|---|
| Share an admin login | Destroys the audit trail. Invitations are free and instant |
| Approve a rights release without evidence | The evidence *is* the protection. A tick with nothing attached restores V1's original defect |
| Disable MFA on an account holding `PERM-users-write` | Blocked by `RULE-N3-16`; asking a developer to bypass it defeats the control |
| Edit content directly in the database | Bypasses validation, audit and revalidation |
| Retry a dead-lettered job repeatedly | It has already exhausted its policy. Escalate |
| Take a screenshot of rights evidence into a chat | Moves protected material outside the access-controlled store |

---

## O3.5 · Escalation

| Severity | Channel | Response | Hours |
|---|---|---|---|
| S1 | Phone + written follow-up | 15 min | 24/7 |
| S2 | Email or chat | 2 business hours | Business |
| S3 | Support queue | 1 business day | Business |
| S4 | Backlog | Next cycle | — |

An escalation states: what was being done, what appeared, the `traceId` if shown, and which O3 row it matched.

- `RULE-O3-4` — `traceId` appears in every user-facing error precisely so an owner can escalate usefully without understanding the failure ([api.md](../reference/api.md)).
- `RULE-O3-5` — **If the owner cannot find the situation in this table, that is a defect in the table**, not a failure by the owner. Unmatched escalations add a row.

---

## O3.6 · What the maintenance agreement must cover

Not a contract — the list of things the boundary table assumes someone has agreed to do. `UNRESOLVED-014`.

- S1 24/7 response; S2 business-hours response
- Monthly: dependency and security patching ([O6](O6-security-operations.md))
- Monthly: automated restore verification review
- Quarterly: DR drill ([O1.8](O1-backup-recovery.md))
- Vendor account custody and billing continuity
- Dead-letter and quarantine review
- Certificate, domain and credential renewal

- `RULE-O3-6` — **Vendor billing failure is an existential risk with no technical symptom until it is too late.** A lapsed card on the Cloudflare account eventually removes every video the studio has published. Billing continuity belongs in the support agreement, not in someone's memory.

---

## O3.7 · Acceptance criteria

- `AC-O3-1` Every situation in the media, publishing and infrastructure tables names exactly one level.
- `AC-O3-2` The owner can classify a failure without technical knowledge, using only error copy and this table.
- `AC-O3-3` A rights block is never presented as an incident.
- `AC-O3-4` No admin UI path permits hard deletion of a client, lead or media asset.
- `AC-O3-5` Every user-facing error carries a `traceId`.
- `AC-O3-6` **V1 M3 step 12 is executable** — the owner can state what is backed up, what they handle, and what they escalate.
