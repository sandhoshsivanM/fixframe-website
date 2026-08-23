# Publication walkthrough — Increment 3

**Purpose.** One chain that exercises rights, media, CMS, public surfaces, accessibility, caching and audit together. The [operations walkthroughs](walkthrough-operations.md) proved that defects live in the seams between documents; this is the longest seam in the product.

Executed manually as `TC-163`.

`✅` covered · `⚠️` gap found and fixed · `❌` unresolved

---

## Scenario

A wedding film is delivered. The client is delighted and agrees to a portfolio feature. The studio publishes it, and it runs on the homepage and in the reels stream. **Fourteen months later the client remarries, asks for it to come down, and the studio's own music licence expires the same month.**

The revocation half is the point. Publishing is the easy direction.

---

## Chain

| # | Step | Path | Verdict |
|---|---|---|---|
| 1 | Operational project completes | `E06`, stage → `Completed` | ✅ |
| 2 | Completion does **not** publish | [G2 separation](G-prime-client-review.md) — publishing is a separate decision | ✅ |
| 3 | Owner starts a portfolio project | `F07`, linked by `operationalProjectId` | ✅ |
| 4 | Rights checklist derived | `R01` — `ClientConsent`, `TalentRelease`, `MusicLicence` from content | ✅ |
| 5 | Releases recorded with evidence and **scope** | `scopeUse = PortfolioAndSocial`, `expiresAt` from the music licence | ✅ |
| 6 | Approval, separate from recording | `PERM-rights-approve` | ✅ |
| 7 | Media readiness | Cover, poster, gallery all `Ready` | ✅ |
| 8 | **Caption requirement** | `hasSpeech = yes` → caption track required before publish | ✅ |
| 9 | Poster, crops, focal point | `F05` | ✅ |
| 10 | Colour-grade pair placed | `F06` → `publicPlacement = ProjectCaseStudy` | ✅ |
| 11 | Preview | Short-lived token, `noindex` | ✅ |
| 12 | Publish attempt with an unmet release | `422 rights_not_cleared` with reason codes | ✅ |
| 13 | Clear and publish | Gate passes; `NTF-014` | ✅ |
| 14 | **Public surfaces update** | Revalidation scope was undefined | ⚠️ **Gap 1** |
| 15 | Reel published from the same film | `C10`, links back to the project | ✅ |
| 16 | Analytics | `EVT-project-open`, `EVT-reel-play` | ✅ |
| 17 | Audit | Publish, approvals, transitions all logged | ✅ |
| 18 | Expiry warning at 30 days | `NTF-015`, once per release | ✅ |
| 19 | Client revokes consent | `API-release-revoke` → `JOB-rights-sweep` | ✅ |
| 20 | **Withdrawal across every surface** | Only the project unpublished; the same footage kept running elsewhere | ⚠️ **Gap 2** |
| 21 | CDN purged | [R4](R-publishing-rights.md) step 3 | ✅ |
| 22 | Public route 404s indistinguishably | `RULE-C13-3` — no disclosure that it existed | ✅ |
| 23 | Sitemap regenerated | Covered by the Gap 1 fix | ✅ |
| 24 | Owner notified | `NTF-016`, naming project and lapsed release | ✅ |
| 25 | Takedown evidenced | `ENT-ActivityLog`, actor `system`, triggering release ID | ✅ |
| 26 | Rights record retained | Life + 7 years ([O6.7](../parts/O6-security-operations.md)) — survives the takedown | ✅ |

---

## Gap 1 — revalidation scope was undefined

**Found.** V1 F07 says publishing "triggers frontend revalidation"; [R4](R-publishing-rights.md) said the same for unpublishing. Neither named **which routes**. Revalidating only `/work/[slug]` leaves the project's card on the homepage and in the work listing.

On the publish side that is a stale card. **On the removal side it is a card on the studio's front page linking to a 404** — during a takedown, in front of the client who requested it.

**Fixed.** [C′2 · Revalidation surface map](../parts/C-prime-public-screens.md) — an explicit route set per event, plus:

- `RULE-C2-1` — unpublish revalidates the same set **unconditionally**, including `/` even when `isFeatured` is now false, because the flag may have been cleared in the same transaction. Publish may optimise; removal never may.
- `RULE-C2-3` — the sitemap regenerates on both, so it never advertises a 404.

## Gap 2 — withdrawal was per-project, not per-material

**Found.** [R4](R-publishing-rights.md) unpublished "dependent `PortfolioProject`". But the same footage was also in a published **reel**, in the active **showreel** on the homepage, and in a **before/after pair** on the editing page. A revoked consent would remove the case study and leave the client's wedding running in the homepage hero.

That is not a takedown. It is the failure a complainant would photograph.

**Fixed.** `RULE-R4-1` — the sweep resolves affected media through `ENT-MediaUsage` and withdraws **every** usage, with a defined action per surface. `RULE-R4-3` handles the sharpest case: a lapsed release on the active showreel reverts to the previous version rather than blanking the homepage.

`ENT-MediaUsage` was added in Increment 1 to make "deletion blocked when in active published use" enforceable. It turns out to be the mechanism that makes **withdrawal** correct too — the same table, answering the same question from the other direction.

---

## Result

| | Count |
|---|---|
| Steps traced | 26 |
| ✅ Covered | 24 |
| ⚠️ Gap found and fixed | 2 |
| ❌ Unresolved | 0 |

Both gaps were on the **removal** side. Publishing was specified thoroughly across three increments; withdrawal was specified once, in less detail, and only for the surface that prompted it.

That asymmetry is worth naming, because it is not accidental — the happy path gets designed, demonstrated and reviewed, while the reversal is written once and never rehearsed. **Every future surface that can publish must state how it withdraws**, and `RULE-R4-1` now makes that a lookup through `ENT-MediaUsage` rather than a fresh decision each time.

---

## Cumulative walkthrough record

| Walkthrough | Steps | Gaps found | Gaps fixed |
|---|---|---|---|
| [M3 handover](walkthrough.md) | 12 | 1 blocked step, 2 caveats | 1 closed in Increment 2 |
| [Operations](walkthrough-operations.md) | 26 | 5 | 5 |
| **Publication** | 26 | 2 | 2 |
| **Total** | **64** | **8** | **8** |

Eight defects across three walkthroughs. **None was detectable by the traceability validator** — every ID in every one of those documents resolved correctly before and after each fix.

Cross-reference validation proves the graph is connected. Walkthroughs prove it leads somewhere.
