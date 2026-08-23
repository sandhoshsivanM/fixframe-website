# ADR-005 · Publishing rights are a first-class entity set, not a checkbox

**Status:** ACCEPTED
**Supersedes:** V1 F03 — "Public video requires rights/approval confirmation checkbox `[TBD business process]`"

## Context

V1 gates the publication of client footage behind a single confirmation checkbox, and explicitly marks the process behind it as undefined. That checkbox is the most legally consequential control in the entire system: ticking it publishes a paying client's wedding, their guests' faces, and whatever music was cut under it, to the open internet under the studio's brand.

A boolean cannot answer any of the questions that matter after the fact:

- *Who* authorised this, and *when*?
- What artefact evidences the authorisation — a signed contract clause, a separate release, an email?
- Did every identifiable person consent, or only the paying client?
- Is the music licensed for commercial portfolio use, and for how long?
- What happens in eighteen months when the client asks for it to come down, or the music licence lapses?

V1 has no answer to the last question at all, which is the one most likely to arrive as a legal letter.

## Decision

**Model rights as an auditable set of releases with evidence, ownership, terms and lifecycle. Make the publish gate evaluate them. Make expiry and revocation actively unpublish.**

### Shape

```
ENT-RightsRecord    one per publishable subject (a PortfolioProject)
  └── ENT-Release   many; one per obligation
        └── evidence → ENT-Attachment
```

Each `Release` carries: `type`, `status`, `grantorName`, `grantorRole`, `grantedAt`, `expiresAt` (nullable), `evidenceAttachmentId`, `recordedByUserId`, `notes`.

### Release types

| Type | Applies when |
|---|---|
| `ClientConsent` | Always, for any client-commissioned work |
| `TalentRelease` | Per identifiable person appearing — threshold at `UNRESOLVED-010` |
| `MusicLicence` | Any music in the published cut |
| `StockLicence` | Any licensed stock footage, image or graphic element |
| `LocationPermit` | Restricted locations, and drone work subject to permission (V1 A1 flags this for the Drone service family) |

### Release lifecycle

```
NotRequired ─┐
             ├─→ Required → Pending → Granted ──→ Expired
             │                     └→ Refused    └→ Revoked
```

`Granted` is the only state that satisfies the gate, and only while unexpired.

### The publish gate

`API-portfolio-publish` **hard-blocks** unless, for the project's `RightsRecord`:

> every `Release` with status not in (`NotRequired`) is `Granted`, **and** `expiresAt` is either null or in the future.

This is a server-side transactional check inside the publish operation, not a UI validation. The F07 wizard shows the checklist and its state, but the API is the enforcement point — a publish attempt that bypasses the wizard must fail identically.

### Expiry and revocation — the path V1 lacks entirely

A scheduled reconciliation job (`JOB-rights-sweep`, hourly) finds releases that have expired or been revoked and, for each dependent published project:

1. Transitions the `PortfolioProject` to `Unpublished` with reason `rights_lapsed`.
2. Triggers frontend revalidation so the public route 404s — the same cache-bust path F05 and F09 already use.
3. Purges the CDN cache for the project's media, because an unpublished page with a still-cached video is not a takedown.
4. Raises `NTF-016` to the rights owner and the `Owner` role.
5. Writes `ENT-ActivityLog`.

Step 3 is the one most easily missed and the one that matters legally.

## Consequences

- Publishing gains real friction. **This is intended.** V1's own G2 rule already insists that publishing is "a separate deliberate content decision" — this makes the deliberation auditable.
- `ENT-Attachment` must exist (it was missing from V1 I1 entirely) because evidence needs somewhere to live. Evidence is stored **private**, never behind a public URL, and never reachable from the public API.
- Rights get their own permission module: `PERM-rights-read`, `PERM-rights-write`, `PERM-rights-approve`. Recording a release and approving one are separable duties.
- Screen **R01** (rights checklist per project) and **R02** (rights register, expiring-soon view) exist to operate this.
- Three genuinely external questions remain open and are gated: `UNRESOLVED-009` (what artefact constitutes consent evidence), `UNRESOLVED-010` (talent release threshold), `UNRESOLVED-011` (music licence term tracking depth).

## Override condition

The *shape* is not negotiable — any system that publishes third-party likenesses needs an evidence trail. The **depth** is tunable: if legal advice says a signed master services agreement with a portfolio clause covers client consent and incidental attendees, then `TalentRelease` collapses to `NotRequired` for wedding work and the checklist shortens. That is a configuration of the same model, not a different model.

## Alternatives considered

**Keep the checkbox, add a notes field.** Rejected. Unstructured, unqueryable, and answers none of the five questions above — in particular it cannot drive expiry.

**Track rights in an external tool (spreadsheet, DAM).** Rejected for MVP: the publish gate must be able to evaluate rights synchronously and transactionally. An external system means either a fragile integration or an unenforced honour system. Revisit only if the studio already operates a rights-management platform.
