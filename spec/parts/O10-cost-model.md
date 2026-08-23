# Part O10 · Cost Model

**Status:** ACCEPTED · closes `UNRESOLVED-007`
**Derives from:** [O5](O5-performance-scale.md) scale scenarios
**Supersedes:** V1 Part L2, in which every media line read `₹[USAGE-BASED]` and every other line was a placeholder range

> V1's cost model could not be computed because nothing established usage. With [O5](O5-performance-scale.md)'s three scenarios, every figure below is derived rather than guessed.

---

## O10.0 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O10-001` | Every cost figure derives from a stated scale parameter and a dated vendor rate. |
| `REQ-O10-002` | All three scenarios are costed, so no work waits on the scale question. |
| `REQ-O10-003` | Excluded costs are stated prominently, not implied by omission. |
| `REQ-O10-004` | Actuals are reviewed against the model on a cadence, and drift triggers a re-plan. |

---

## O10.1 · Rate table

**Rates read from vendor pricing pages on 2026-08-23.** Not asserted from memory. Re-verify before any commercial commitment — this table is the single place to update.

| Vendor | Item | Rate |
|---|---|---|
| **Cloudflare R2** | Standard storage | $0.015 / GB-month |
| | Infrequent Access storage | $0.010 / GB-month (30-day minimum) |
| | Class A operations (writes) | $4.50 / million |
| | Class B operations (reads) | $0.36 / million |
| | **Egress** | **$0.00** |
| | Free tier | 10 GB-month, 1M Class A, 10M Class B |
| **Cloudflare Stream** | Video stored | $5.00 / 1,000 minutes |
| | Video delivered | $1.00 / 1,000 minutes |
| | Ingress and encoding | **Free** |
| **Neon** | Storage | $0.35 / GB-month |
| | Compute, Launch plan | $0.106 / CU-hour |
| | Compute, Scale plan | $0.222 / CU-hour |
| | Point-in-time restore | $0.20 / GB-month |
| **Resend** | Free | $0 — 3,000/month, **100/day cap** |
| | Pro | $20/month — 50,000 |
| **Sentry** | Developer | $0 — 5k errors, **1 user** |
| | Team | $26/month annual — 50k errors, unlimited users |
| **Fly.io** | shared-cpu-1x, 512 MB | $3.32/month |
| | shared-cpu-1x, 1 GB | $5.92/month |
| | Volumes | $0.15 / GB-month |

- `RULE-O10-1` — All figures are **USD**, because every vendor bills USD. Converting to ₹ inside the model would bake in a stale FX rate. Apply one FX cell at the end; see O10.5.
- `RULE-O10-2` — R2's zero egress is the structural reason this model works for a video-heavy portfolio. A per-GB egress charge would make delivery the dominant line rather than a rounding error.

---

## O10.2 · Monthly cost at month 12

Storage figures are cumulative to month 12; delivery and compute are steady-state monthly.

| Line | Launch | **Expected** | Growth |
|---|---|---|---|
| R2 storage — sources | $4.10 | $10.13 | $43.20 |
| R2 storage — photos + derivatives | $0.39 | $1.59 | $4.95 |
| R2 storage — backups | $0.03 | $0.12 | $0.38 |
| R2 storage — offsite replica | $2.16 | $10.12 | $43.48 |
| R2 operations | ~$0.05 | ~$1.00 | ~$3.00 |
| **R2 subtotal** | **$5** | **$23** | **$95** |
| Stream — stored | $1.92 | $7.50 | $28.80 |
| Stream — delivered | $1.20 | $6.00 | $24.00 |
| **Stream subtotal** | **$3** | **$14** | **$53** |
| Neon — compute | $19.30 | $38.69 | $162.06 |
| Neon — storage + PITR | $0.28 | $1.10 | $4.40 |
| **Database subtotal** | **$20** | **$40** | **$166** |
| API + worker compute | $9 | $15 | $24 |
| Frontend hosting | $5 | $5 | $20 |
| Email | $0 | $0 | $20 |
| Error tracking | $0 | $26 | $26 |
| Domain (amortised) | $1 | $1 | $1 |
| Offsite backup (layer 3) | $2 | $5 | $15 |
| **Total / month** | **≈ $45** | **≈ $129** | **≈ $420** |
| **Total / year** | **≈ $540** | **≈ $1,550** | **≈ $5,040** |

Assumptions applied: ~75% of source volume has aged past 90 days into Infrequent Access; Neon compute averages 0.25 / 0.5 / 1.0 CU; Fly runs 1 / 2 / 3 app machines plus 1 / 1 / 2 workers.

---

## O10.3 · What drives the cost

| Rank | Driver | Behaviour | Lever |
|---|---|---|---|
| 1 | **Database compute** | Dominant at Growth — 40% of total | Right-size CU, enable autosuspend, cache aggregates ([api.md](../reference/api.md) §8) |
| 2 | **R2 source storage** | Compounds monthly, never decreases | IA transition; retention policy ([O7](O7-data-lifecycle.md)) |
| 3 | **Offsite replica** | Mirrors driver 2 exactly | Replicate sources and backups only, never derivatives ([`RULE-O1-8`](O1-backup-recovery.md)) |
| 4 | **Stream storage** | Compounds with published minutes | Archive Stream assets for unpublished work; R2 keeps the master |
| 5 | Stream delivery | Scales with traffic — the one line that grows with *success* | None wanted |

- `RULE-O10-3` — Drivers 2 and 3 **compound**. At Growth, source storage plus replica is $87/month and rising every month regardless of traffic. This is the line that becomes a surprise invoice in year three, and the retention policy is what governs it — which is why [O7](O7-data-lifecycle.md) is a cost document as much as a legal one.
- `RULE-O10-4` — Not replicating derivatives saves ~$5 at Expected and ~$20 at Growth per month, for zero recovery loss. Derivatives are regenerable; sources are not.

---

## O10.4 · Sensitivities

| Change | Effect on Expected |
|---|---|
| Traffic doubles | +$6/month — delivery only. **Traffic is cheap** |
| Video uploads double | +$10/month, compounding |
| Skip the IA transition | +$7/month, rising to +$29 at Growth |
| Skip the offsite replica | −$10/month, and no protection against account loss |
| Neon Scale instead of Launch | +$43/month at Expected |
| Self-hosted ffmpeg instead of Stream | −$14/month, +operational burden ([ADR-002](../decisions/ADR-002-media-processing.md)) |
| **India data residency required** | **Model invalid — see O10.6** |

The first row is the useful one: **success is cheap, and archives are expensive.** Ten times the visitors costs less than twice the uploads.

---

## O10.5 · Currency

- `RULE-O10-5` — The model is USD. Convert once, at review time, using the rate on that date. Two lines follow from this: the studio holds FX exposure on a monthly USD bill, and vendor invoices may carry card FX fees of 2–3%, which is a real cost the model deliberately does not hide inside its rates.

---

## O10.6 · Not included

| Excluded | Why |
|---|---|
| **One-time build** | Not an operating cost; a separate quote |
| **Developer maintenance retainer** | The largest recurring cost by a wide margin, and a commercial negotiation. Scope is set in [O3.6](O3-support-boundaries.md), price is not — `UNRESOLVED-014` |
| Caption production | Workflow-dependent — `UNRESOLVED-016` |
| Font licensing | `UNRESOLVED-001` |
| Legal review of rights and privacy | `UNRESOLVED-009`, `-015` |
| WhatsApp Business API | **$0** — deep link only ([ADR-006](../decisions/ADR-006-whatsapp-channel.md)) |
| Paid marketing, stock, music | Not platform costs |

- `RULE-O10-6` — Presenting infrastructure cost without stating that the retainer is excluded would understate the true cost of ownership by a large multiple. The exclusion is stated prominently rather than in a footnote.

### If India residency is required

`UNRESOLVED-008` is not merely a risk to this model — it is **determinative**, and the research is now conclusive:

> Cloudflare R2 supports jurisdictional residency for **EU, FedRAMP and US only**. `APAC` exists as a best-effort *location hint*, not a residency guarantee. **India-resident storage is not offered.**

If residency is required, [ADR-002](../decisions/ADR-002-media-processing.md) is invalidated — not "possibly", definitively — and the storage and video lines must be re-costed against an India-region provider. Everything else in the model survives. This is why `UNRESOLVED-008` is gated at `G01` and should be the first question asked.

---

## O10.7 · Review

| Cadence | Action |
|---|---|
| Monthly | Actuals vs. model; storage growth vs. [O5](O5-performance-scale.md) projection |
| Quarterly | Re-verify rates; review scenario fit |
| On drift | 50% over projection on any axis for two consecutive months → re-plan |
| Annually | Full re-verification; renegotiate where volume warrants |

- `RULE-O10-7` — Storage is reviewed monthly and specifically. It is the line that grows quietly, never falls, and is discovered by invoice.
- `RULE-O10-8` — Vendor rates are re-verified **from the pricing pages**, never from memory or from this document's history. This table is a snapshot dated 2026-08-23, not a source of truth.

---

## O10.8 · Acceptance criteria

- `AC-O10-1` Every figure traces to an [O5](O5-performance-scale.md) parameter and an O10.1 rate.
- `AC-O10-2` All three scenarios are costed; no line reads `USAGE-BASED`.
- `AC-O10-3` Rates carry the date they were read and a re-verification instruction.
- `AC-O10-4` The retainer exclusion is stated prominently.
- `AC-O10-5` The residency dependency is stated with its consequence.
- `AC-O10-6` Monthly actuals are compared against the model.
- `AC-O10-7` Changing a rate updates every scenario from one place.
