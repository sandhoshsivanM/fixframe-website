# Unresolved register

**Every entry has an owner and a blocking gate.** A gate phase may not start while an entry gated on it is open. This is what stops `UNRESOLVED` from becoming the new `[TBD]` — V1 used `[TBD]` fourteen times with neither an owner nor a consequence, so none of them ever closed.

Gates map to V1 Part M1 phases: `G01` Discovery · `G02` UX · `G03` Visual · `G04` Public Web · `G05` Lead Engine · `G06` CRM · `G07` Media CMS · `G08` Portfolio CMS · `G09` Integrations · `G10` QA · `G11` Production · `G12` Handover.

---

## Open

| ID | Question | Owner | Gate | **Blocks what?** | Interim position |
|---|---|---|---|---|---|
| `UNRESOLVED-001` | Which display font, and is it licensed for web embedding at the expected traffic? | Client / Brand | `G03` | Phase 03 Visual sign-off. Nothing else | Design against a metric-compatible substitute; no font is committed to the build |
| `UNRESOLVED-002` | Primary operating timezone for scheduling and display | Client | `G06` | Phase 06 CRM sign-off — calendar display only. Storage is settled | **Storage is settled** — all `timestamptz` UTC ([ADR-001](../decisions/ADR-001-database.md)). Display defaults to `Asia/Kolkata` pending confirmation |
| `UNRESOLVED-003` | Maximum accepted source upload size, and the accepted container/codec list | Studio | `G07` | Phase 07 Media CMS sign-off. Upload validation ships configurable either way | Provisional 5 GB / MP4, MOV, H.264, H.265, ProRes. Enforced server-side and configurable |
| `UNRESOLVED-004` | Budget qualification brackets for the lead form | Client / Sales | `G05` | Phase 05 Lead Engine sign-off. The field ships; only the brackets are open | Field exists with `PreferNotToSay`; brackets are configuration, not code |
| `UNRESOLVED-006` | Scale assumptions: monthly visitors, video uploads/month, average source size and duration, transcoding minutes, total master storage, monthly CDN egress, photo count, leads/month, internal users, backup retention | Client | `G01` | **Cost approval and performance sign-off.** Blocks no build work — all three scenarios are costed | Increment 2 ships the calculator with a labelled small-studio baseline so the model is exercisable before real figures arrive |
| `UNRESOLVED-008` | Is India-resident media and data storage required by client contract or regulation? | Client / Legal | `G01` | **Infrastructure commitment.** If India residency is required, [ADR-002](../decisions/ADR-002-media-processing.md) is replaced. Blocks Phase 01 sign-off and any vendor contract | The `IMediaProcessingProvider` abstraction is designed so this changes one adapter, not the business logic |
| `UNRESOLVED-009` | Which artefact constitutes client consent evidence — a portfolio clause in the services agreement, or a separate signed release? | Legal | `G01` | Phase 01 sign-off and Phase 08 rights training. The model ships; which artefact counts is configuration | `ClientConsent` requires *some* attached evidence; which artefact is configuration |
| `UNRESOLVED-010` | Do incidental attendees (wedding guests, crowds) require individual talent releases, or does a venue/client clause cover them? | Legal | `G01` | Phase 01 sign-off. Determines checklist length for event work, not the mechanism | Single `TalentRelease` row scoped to "identifiable principals", flagged on screen |
| `UNRESOLVED-011` | How deeply are music licence terms tracked — track, licensor, term, territory, permitted use? | Legal / Studio | `G07` | Phase 07 sign-off. Sets release metadata depth only | Track, licensor, term and expiry captured; territory and permitted-use are free-text notes |
| `UNRESOLVED-013` | Default expiry window for client review links | Client | `G06` | Phase 06 sign-off. A default value; the mechanism is complete | Provisional 14 days, maximum 90, always operator-overridable per link |
| `UNRESOLVED-014` | Maintenance agreement — who holds it, at what price, with what response commitment? | Client / Studio | `G12` | **Phase 12 Handover cannot complete.** No contracted S1 response means no handover | Scope is fully specified in [O3.6](../parts/O3-support-boundaries.md); only the commercial terms are open |
| `UNRESOLVED-015` | Which privacy regime governs — India's DPDP Act, GDPR for EU enquirers, or both? | Legal | `G01` | Phase 01 sign-off, and the privacy page copy (`C11`). The retention mechanism is jurisdiction-independent | Mechanism in [O7](../parts/O7-data-lifecycle.md) is complete and jurisdiction-independent; durations are provisional |
| `UNRESOLVED-016` | Caption sourcing — produced in the edit, transcription service, or auto-generated with human review? | Studio | `G07` | Phase 07 sign-off and one [O10](../parts/O10-cost-model.md) line. The caption requirement is already enforced | Requirement is settled and enforced by the publish gate ([`RULE-O9-3`](../parts/O9-accessibility-operations.md)); only the production route is open |

---

## Closed

| ID | Question | Resolution | Where | Closed |
|---|---|---|---|---|
| `UNRESOLVED-005` | WhatsApp — deep link or Business API? | **Deep link.** No vendor, no per-message cost, nothing transmitted by the system. Volume and compliance triggers for revisiting are stated | [ADR-006](../decisions/ADR-006-whatsapp-channel.md) | Increment 2 |
| `UNRESOLVED-007` | Confirmed vendor rates | **Read from vendor pricing pages on 2026-08-23** and recorded in one updatable table with a re-verification instruction | [O10.1](../parts/O10-cost-model.md) | Increment 2 |
| `UNRESOLVED-012` | Media retention durations | **Mechanism closed** — full retention matrix, enforced by `JOB-retention-sweep`, dry-run for 30 days first. Durations become binding on `UNRESOLVED-015` sign-off | [O7.2](../parts/O7-data-lifecycle.md) | Increment 2 |

Entries are never deleted, so the reasoning survives.

## Narrowed

| ID | Was | Now |
|---|---|---|
| `UNRESOLVED-006` | "What is the scale?" — unanswerable before launch, and it blocked the entire cost model | "**Which of Launch, Expected or Growth?**" — answerable in a sentence. All three are fully costed, so nothing is blocked on the answer. Expected is the default ([O5.2](../parts/O5-performance-scale.md)) |
| `UNRESOLVED-008` | "Is India residency required?" — a risk to [ADR-002](../decisions/ADR-002-media-processing.md) | Still open, but the consequence is now **established rather than suspected**: R2 supports EU, FedRAMP and US jurisdictions only. `APAC` is a best-effort location hint, not a residency guarantee. **If India residency is required, ADR-002 is invalid** — definitively, not possibly. Ask this first |

---

## Notes on scope

Thirteen entries, all genuinely external — questions only the client, their legal advisor, or the studio can answer. Everything that was a *technical* choice has been decided in an ADR or in a part rather than deferred, because deferring a technical decision to the implementer is precisely the defect V2 exists to fix.

Two entries deserve attention disproportionate to their line count:

- **`UNRESOLVED-006`** blocks a real number for the project's running cost. It is a short conversation and it unblocks Discovery sign-off.
- **`UNRESOLVED-008`** can invalidate the media architecture. It should be asked first, not last.
