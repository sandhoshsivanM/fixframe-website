# Unresolved register

**Every entry has an owner and a blocking gate.** A gate phase may not start while an entry gated on it is open. This is what stops `UNRESOLVED` from becoming the new `[TBD]` — V1 used `[TBD]` fourteen times with neither an owner nor a consequence, so none of them ever closed.

Gates map to V1 Part M1 phases: `G01` Discovery · `G02` UX · `G03` Visual · `G04` Public Web · `G05` Lead Engine · `G06` CRM · `G07` Media CMS · `G08` Portfolio CMS · `G09` Integrations · `G10` QA · `G11` Production · `G12` Handover.

---

## Open

| ID | Question | Owner | Gate | Impact if unresolved | Interim position |
|---|---|---|---|---|---|
| `UNRESOLVED-001` | Which display font, and is it licensed for web embedding at the expected traffic? | Client / Brand | `G03` | Visual design cannot be finalised; a licence surprise late is expensive | Design against a metric-compatible substitute; no font is committed to the build |
| `UNRESOLVED-002` | Primary operating timezone for scheduling and display | Client | `G06` | Calendar, shoot dates and deadlines display wrongly for the studio | **Storage is settled** — all `timestamptz` UTC ([ADR-001](../decisions/ADR-001-database.md)). Display defaults to `Asia/Kolkata` pending confirmation |
| `UNRESOLVED-003` | Maximum accepted source upload size, and the accepted container/codec list | Studio | `G07` | Upload validation cannot be finalised; owner hits opaque failures | Provisional 5 GB / MP4, MOV, H.264, H.265, ProRes. Enforced server-side and configurable |
| `UNRESOLVED-004` | Budget qualification brackets for the lead form | Client / Sales | `G05` | Lead qualification cannot be tuned; sales triage stays manual | Field exists with `PreferNotToSay`; brackets are configuration, not code |
| `UNRESOLVED-005` | WhatsApp: `wa.me` deep link, or Business API? | Client | `G09` | Effort differs by an order of magnitude — a URL versus a vendor relationship, template approval and per-message cost | **MVP assumes deep link.** All `W` channels degrade to a click-to-open action for the operator |
| `UNRESOLVED-006` | Scale assumptions: monthly visitors, video uploads/month, average source size and duration, transcoding minutes, total master storage, monthly CDN egress, photo count, leads/month, internal users, backup retention | Client | `G01` | **The cost model cannot be calculated.** V1's L2 was entirely `₹[USAGE-BASED]` for exactly this reason | Increment 2 ships the calculator with a labelled small-studio baseline so the model is exercisable before real figures arrive |
| `UNRESOLVED-007` | Confirmed current vendor rates for storage, egress, transcoding, email and database | Tech | `G01` | Cost estimates are indicative only | Rates are read from live pricing pages at authoring time, never asserted from memory, and held in one table for easy revision |
| `UNRESOLVED-008` | Is India-resident media and data storage required by client contract or regulation? | Client / Legal | `G01` | **Would override [ADR-002](../decisions/ADR-002-media-processing.md)** — the most likely override in the document | The `IMediaProcessingProvider` abstraction is designed so this changes one adapter, not the business logic |
| `UNRESOLVED-009` | Which artefact constitutes client consent evidence — a portfolio clause in the services agreement, or a separate signed release? | Legal | `G01` | The rights model works; what counts as satisfying it does not | `ClientConsent` requires *some* attached evidence; which artefact is configuration |
| `UNRESOLVED-010` | Do incidental attendees (wedding guests, crowds) require individual talent releases, or does a venue/client clause cover them? | Legal | `G01` | Determines whether the checklist is short or long for event work | Single `TalentRelease` row scoped to "identifiable principals", flagged on screen |
| `UNRESOLVED-011` | How deeply are music licence terms tracked — track, licensor, term, territory, permitted use? | Legal / Studio | `G07` | Determines the release metadata schema depth | Track, licensor, term and expiry captured; territory and permitted-use are free-text notes |
| `UNRESOLVED-012` | Retention: how long are failed-job sources, abandoned uploads, archived masters and review copies kept? | Studio / Legal | `G07` | Drives storage cost and any deletion obligation | Provisional: failed sources 30 days, abandoned uploads 24 h, archived masters indefinite, review copies 90 days post-completion |
| `UNRESOLVED-013` | Default expiry window for client review links | Client | `G06` | Only the default; the mechanism is complete | Provisional 14 days, maximum 90, always operator-overridable per link |

---

## Closed

*None yet.* Entries move here with the resolution, the date and who decided — never deleted, so the reasoning survives.

---

## Notes on scope

Thirteen entries, all genuinely external — questions only the client, their legal advisor, or the studio can answer. Everything that was a *technical* choice has been decided in an ADR or in a part rather than deferred, because deferring a technical decision to the implementer is precisely the defect V2 exists to fix.

Two entries deserve attention disproportionate to their line count:

- **`UNRESOLVED-006`** blocks a real number for the project's running cost. It is a short conversation and it unblocks Discovery sign-off.
- **`UNRESOLVED-008`** can invalidate the media architecture. It should be asked first, not last.
