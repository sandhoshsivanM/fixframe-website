# Part O5 · Scale Assumptions & Performance Budgets

**Status:** ACCEPTED · narrows `UNRESOLVED-006`
**Closes:** V1 C01 requires the hero to load "within agreed performance budget" — never agreed anywhere. V1 K is titled "Performance" and contains rules with no numbers. V1 L2's cost model is `₹[USAGE-BASED]` because nothing establishes usage.

> A single unknown scale figure blocked the whole cost model. Three scenarios unblock it: the question stops being *"how big will this be?"* — unanswerable before launch — and becomes *"which of these three is closest?"*, which anyone can answer in a minute.

---

## O5.1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-O5-001` | Load is expressed as explicit parameters, not adjectives. |
| `REQ-O5-002` | Every infrastructure and cost figure derives from those parameters. |
| `REQ-O5-003` | Performance budgets are numeric and enforced in CI, not aspirational. |
| `REQ-O5-004` | Budgets are validated at the largest scenario before go-live. |
| `REQ-O5-005` | Actual usage is measured against the chosen scenario so drift is visible. |

---

## O5.2 · Scenarios

Twelve-month horizon. **Expected is the planning default** until the studio picks.

| Parameter | Launch | **Expected** | Growth |
|---|---|---|---|
| Monthly visitors | 2,000 | **10,000** | 40,000 |
| Video plays per visitor | 0.4 | 0.4 | 0.4 |
| Avg watch minutes per play | 1.5 | 1.5 | 1.5 |
| Video uploads / month | 8 | **25** | 80 |
| Avg source size | 2 GB | **3 GB** | 4 GB |
| Avg published duration | 4 min | **5 min** | 6 min |
| Photo uploads / month | 200 | **800** | 2,500 |
| Avg photo original | 8 MB | 8 MB | 8 MB |
| Leads / month | 15 | **60** | 200 |
| Internal users | 2 | **5** | 12 |
| Peak concurrent admin sessions | 2 | **4** | 8 |
| Backup retention | 30 daily + 12 monthly | same | same |

### Derived load

| Derived | Launch | **Expected** | Growth | Formula |
|---|---|---|---|---|
| Stream delivery min / month | 1,200 | **6,000** | 24,000 | visitors × plays × watch-min |
| Stream min added / month | 32 | **125** | 480 | uploads × duration |
| Stream min stored @ month 12 | 384 | **1,500** | 5,760 | cumulative |
| R2 video sources @ 12 mo | 192 GB | **900 GB** | 3,840 GB | uploads × 12 × size |
| R2 photos + derivatives @ 12 mo | 26 GB | **106 GB** | 330 GB | photos × 12 × 11 MB |
| R2 backups | 2 GB | **8 GB** | 25 GB | dumps × retention |
| **R2 primary total @ 12 mo** | **220 GB** | **1,014 GB** | **4,195 GB** | |
| R2 replica (sources + backups) | 194 GB | **908 GB** | 3,865 GB | derivatives not replicated |
| Database size @ 12 mo | 0.5 GB | **2 GB** | 8 GB | activity log dominates |
| Transactional emails / month | ~100 | **~400** | ~1,400 | [O4.7](O4-notification-architecture.md) |

- `RULE-O5-1` — Video **storage** grows monotonically and video **delivery** does not. Storage is the cost that compounds; delivery is the cost that spikes. They are budgeted separately in [O10](O10-cost-model.md).
- `RULE-O5-2` — R2 source growth is the dominant long-run cost driver. The Infrequent Access transition at 90 days ([O1.5](O1-backup-recovery.md)) is what keeps Growth affordable, not an optimisation to defer.
- `RULE-O5-3` — 0.4 plays/visitor and 1.5 watch-minutes are **assumptions, not measurements**. `EVT-showreel-play` and `EVT-project-open` measure the first; Stream analytics measures the second. Both are reviewed at 90 days.

---

## O5.3 · Performance budgets

### Core Web Vitals — field, p75, mobile

| Metric | Budget | Notes |
|---|---|---|
| **LCP** | ≤ 2.5 s | The hero **poster**, not the video. V1 C01 already requires poster-first |
| **CLS** | ≤ 0.1 | V1's skeleton and aspect-ratio-placeholder rules exist for this |
| **INP** | ≤ 200 ms | Filters and comparison sliders are the risk |

### Lab budgets — enforced in CI

| Budget | Public | Admin |
|---|---|---|
| Initial JS, gzipped | ≤ 200 KB | ≤ 350 KB |
| Initial CSS, gzipped | ≤ 40 KB | ≤ 60 KB |
| Hero poster image | ≤ 150 KB | — |
| Total initial page weight | ≤ 1.2 MB | ≤ 1.5 MB |
| Time to hero poster, 4G | ≤ 1.5 s | — |

- `RULE-O5-4` — Admin gets a looser budget because it is authenticated, repeat-visited and cached. The public site gets the strict one because it is a first impression on a phone.
- `RULE-O5-5` — GSAP and the media comparison components are **code-split** and excluded from the initial bundle (V1 K1).

### API — p95 at Growth data volumes

| Class | p95 | p99 |
|---|---|---|
| Public read (cached) | ≤ 150 ms | ≤ 400 ms |
| Public read (uncached) | ≤ 300 ms | ≤ 800 ms |
| Lead submission | ≤ 800 ms | ≤ 2 s |
| Admin list, paginated | ≤ 500 ms | ≤ 1.2 s |
| Admin mutation | ≤ 800 ms | ≤ 2 s |
| Dashboard aggregate | ≤ 1 s | ≤ 2.5 s |
| Global search | ≤ 700 ms | ≤ 1.5 s |

### Media pipeline

| Measure | Budget |
|---|---|
| Video upload → `Ready` | 95% within 30 min; 99% within 2 h |
| Photo batch → derivatives | 95% within 2 min |
| Poster candidates available | Within 5 min of `Ready` |
| Reconciliation repair latency | ≤ 15 min (one cycle) |

### Database

No query over 1 s at Growth volumes. Connection pool below 80% at peak. No unbounded query — every list endpoint paginates ([api.md](../reference/api.md)).

---

## O5.4 · Enforcement

| Gate | Mechanism | When |
|---|---|---|
| Lab budgets | Lighthouse CI, budget file | Every PR — **fails the build** |
| API p95 | k6 against a Growth-seeded staging DB | Before each release |
| Media pipeline | Timing assertions in worker tests | Every build |
| Field CWV | RUM via the analytics layer | Continuous, reviewed monthly |
| Query time | Slow-query log + Sentry | Continuous, alert at 1 s |

- `RULE-O5-6` — Load tests run against a database **seeded to Growth volumes**, not a dev database with forty rows. A list endpoint that is fast over 40 leads and quadratic over 2,400 passes every test that matters and fails in production.
- `RULE-O5-7` — A budget regression fails the build. Raising a budget requires an explicit commit changing the budget file, so the decision is visible in review rather than eroding silently.

---

## O5.5 · Drift

- `RULE-O5-8` — Monthly, actual visitors, uploads, storage and delivery are compared against the chosen scenario. Exceeding it on any axis by 50% for two consecutive months triggers a re-plan of [O10](O10-cost-model.md).
- `RULE-O5-9` — Storage is checked against projection specifically. It is the figure that grows quietly and appears as a surprise invoice.

---

## O5.6 · What remains open

`UNRESOLVED-006` is **narrowed, not closed**. Its question was "what is the scale?"; it is now "**which scenario, Launch, Expected or Growth?**" — answerable in a sentence, and all three are fully costed in [O10](O10-cost-model.md), so no work is blocked on the answer. Expected is the default until told otherwise.

---

## O5.7 · Acceptance criteria

- `AC-O5-1` Every infrastructure and cost figure in [O10](O10-cost-model.md) traces to a parameter in O5.2.
- `AC-O5-2` A PR exceeding a lab budget fails CI.
- `AC-O5-3` API p95 budgets are met against a Growth-seeded database.
- `AC-O5-4` 95% of video uploads reach `Ready` within 30 minutes.
- `AC-O5-5` No list endpoint issues an unbounded query.
- `AC-O5-6` Monthly actuals are reported against the chosen scenario.
- `AC-O5-7` Raising a budget requires an explicit, reviewable change.
