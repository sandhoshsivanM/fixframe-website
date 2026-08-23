# Part G′ · Client Review (MVP) & Conversion

**Status:** ACCEPTED (one gated unknown — `UNRESOLVED-013`)
**Closes:** V1 G1 lists a `Client Review` stage whose business action is "collect feedback" and whose system output is "notes/revisions" — with no mechanism anywhere in MVP. The client review portal is `DEFERRED-V2`, which left the MVP stage empty in practice.

> The honest position: MVP does **not** have a client portal. Pretending otherwise means the stage exists on the Kanban board and nowhere else, and the team reverts to WhatsApp with no record. This part specifies the modest thing that actually works, and states plainly what V2 replaces it with.

---

## G′1 · The MVP review flow

```
Editing → Export Review Copy → Upload private review asset
        → Protected review link  OR  approved external delivery
        → Client feedback recorded manually in CRM
        → Revision task → Final approval → Final Delivery
```

| ID | Requirement |
|---|---|
| `REQ-G-101` | A review cut is uploadable as a first-class asset distinguishable from delivery media. |
| `REQ-G-102` | It can be shared without being public or indexable. |
| `REQ-G-103` | Feedback is recorded against the project **whatever channel it arrived through**. |
| `REQ-G-104` | Feedback converts to tracked revision work. |
| `REQ-G-105` | Final approval is an explicit, dated, attributed act. |
| `REQ-G-106` | No review asset is ever reachable from the public site. |

---

## G′2 · Review copies

A review cut is a `ENT-MediaAsset` with `role = ReviewCopy` and `visibility = Internal`.

- `RULE-G2-1` — `ReviewCopy` assets are **excluded from every public API response by construction** — the public DTOs never project them, rather than filtering them out. A filter can be forgotten; an absent mapping cannot.
- `RULE-G2-2` — They are excluded from Media Library public-selection pickers.
- `RULE-G2-3` — They follow the same processing pipeline (Part H′), so the client watches a web-optimised rendition rather than a 4 GB master.
- `RULE-G2-4` — Review copies are retention-eligible after project completion (`UNRESOLVED-012`).

---

## G′3 · Protected review links

`ENT-ReviewLink`. Screen G01, a panel on Project Detail (`E06`).

| Control | Rule |
|---|---|
| Token | 32 bytes of CSPRNG entropy, URL-safe. **Only the hash is stored** |
| Passphrase | Optional. Where set, sent through a **different channel** than the link (`NTF-024`) |
| Expiry | Mandatory. Default at `UNRESOLVED-013`; maximum 90 days |
| Revocation | Immediate, any time |
| Indexing | `noindex, nofollow`, excluded from sitemap, `Referrer-Policy: no-referrer` |
| Download | Disabled by default; streaming only |
| Access log | Every access records timestamp, IP, user agent; `accessCount` increments |
| Enumeration | Invalid, expired and revoked tokens return an **identical** generic page — never a message distinguishing them |

- `RULE-G3-1` — A link binds to exactly one asset and one project. Sharing "the whole project" is not a thing MVP does.
- `RULE-G3-2` — Expiry is enforced server-side per request, never by client-side countdown.
- `RULE-G3-3` — Creating a link requires the asset to be `role = ReviewCopy` and `status = Ready`. Sharing a still-processing cut wastes a client's goodwill.

**Screen G01 · Review panel** — Primary CTA `[CREATE REVIEW LINK]` · Permission `PERM-projects-write`.
Structure: active links with expiry and access count · create form (asset, expiry, optional passphrase) · revoke · copy-link · feedback list.

**Acceptance.** `AC-G01-1` A review asset is unreachable from any public route or API. `AC-G01-2` An expired or revoked link is indistinguishable from an invalid one. `AC-G01-3` Access is logged. `AC-G01-4` A link cannot be created for a non-`Ready` asset.

---

## G′4 · Recording feedback

`ENT-ReviewFeedback`. **MVP records feedback manually, whatever channel it arrived through** — this is the deliberate scope decision, not an oversight.

- `RULE-G4-1` — `receivedVia` is mandatory: `Link | Email | WhatsApp | Call | Meeting`. Capturing the channel is what later tells you whether a portal is worth building.
- `RULE-G4-2` — Feedback can spawn a `ENT-Task` linked back via `resultingTaskId`, so a revision request cannot be lost between a message and someone's memory.
- `RULE-G4-3` — Recording feedback raises `NTF-009` to the project owner.
- `RULE-G4-4` — Feedback is internal. It never appears on any public or client-facing surface.

**Final approval** is `ENT-Milestone` of type `Review` completed, with the approver and date recorded. `RULE-G4-5` — Advancing to `FinalDelivery` with an incomplete `Review` milestone **warns** but does not block, consistent with V1 E05's MVP posture on stage guards.

---

## G′5 · What V2 replaces

| MVP | V2 |
|---|---|
| Protected link, streaming only | Client portal with authenticated accounts |
| Feedback typed into the CRM by staff | Frame-accurate timecoded comments by the client |
| Revision tasks created by hand | Comments become tasks automatically |
| Approval recorded as a milestone | Explicit approve/reject with signature |
| Per-asset links | Version stacks with comparison |

Recorded here so V2 is a **replacement with known scope**, not a discovery exercise. `RULE-G5-1` — `ENT-ReviewFeedback.receivedVia` is the evidence base for deciding whether V2's portal is justified.

---

## G′6 · Conversion transaction (restated)

V1 G3 specified this well. Restated with the gaps closed.

| # | Step |
|---|---|
| 01 | Authorised user opens a `Won` lead — requires `PERM-leads-convert` |
| 02 | System checks for an existing client by linked client or matching confirmed contact |
| 03 | Create or reuse `ENT-Client` |
| 04 | Create `ENT-OperationalProject`, copying lead scope — service, project type, date, location, brief |
| 05 | Set `Lead.convertedProjectId` and `convertedAt` |
| 06 | Create default milestones and tasks from the project template |
| 07 | Write `ENT-ActivityLog` |
| 08 | Return the project URL |

- `RULE-G6-1` — **One transaction.** Partial conversion leaving a client without a project is not a recoverable state for a non-technical operator.
- `RULE-G6-2` — Idempotency required ([ADR-003](../decisions/ADR-003-idempotency.md)). V1's `AC-E03-1` demanded idempotent conversion without defining it; a double-submit otherwise creates duplicate clients.
- `RULE-G6-3` — `409` unless status is `Won`, or an explicit authorised override is supplied and logged.
- `RULE-G6-4` — Conversion **never** creates a `PortfolioProject`. V1's G2 separation holds: completing work and publishing it stay independent decisions.
- `RULE-G6-5` — `packageId` and `sourceProjectId` carry from the lead onto the project record, so the origin of the work survives conversion. In V1 both were dropped on the floor at the form.

**Acceptance.** `AC-G6-1` Double-submitting conversion yields one client and one project. `AC-G6-2` A failure at any step leaves no partial records. `AC-G6-3` Conversion creates no public content. `AC-G6-4` Lead origin fields survive onto the project.
