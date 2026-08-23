# Part C′ · Public Screens C09–C13

**Status:** ACCEPTED
**Closes:** Five public routes V1 depends on and never specified — a `[CONTACT]` CTA pointing at no page, a Reel entity and upload wizard with no public destination, a consent step citing a privacy policy that does not exist, and 404 *behaviour* with no 404 *page*.

---

## C′1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-C-101` | Every CTA and nav item in the specification resolves to a specified route. |
| `REQ-C-102` | Published reels have a public destination with its own discovery model. |
| `REQ-C-103` | Legal pages exist, are reachable from the consent step, and are editable without deployment. |
| `REQ-C-104` | Unresolvable routes fail usefully rather than dead-ending. |
| `REQ-C-105` | Short-form playback does not import the long-form player's weight or behaviour. |

---

## C10 · `/reels` — Reels

The substantial one. V1 built the entire production side — `ENT-Reel`, `F08` upload wizard, poster requirement, featured flag, sort order — and never said where any of it appears.

| Area | Specification |
|---|---|
| Primary user | Prospective client, and social visitors arriving from a bio link |
| Primary goal | Judge short-form capability quickly |
| Primary CTA | `[START A PROJECT]` |
| Secondary CTA | `[VIEW FULL WORK]` |
| Data owner | `ENT-Reel` · `API-public-reels-list` |
| Permission | `Anonymous` |

### Discovery model

Deliberately **not** the Work grid. `C02` is an editorial browse for buyers evaluating craft over minutes. Reels are scanned in seconds.

| Aspect | Decision |
|---|---|
| Layout | Vertical-first tile grid — 2 columns mobile, 3 tablet, 4–5 desktop |
| Order | `isFeatured` first, then `sortOrder`, then newest. Same precedence as `C02` |
| Filter | By `ENT-Category` where more than 8 reels exist; hidden below that — a filter over six items is furniture |
| Grouping | None. No sections, no chapters. A flat stream is the correct shape for short-form |
| Entry | Tile opens an overlay player, **not** a route change |

- `RULE-C10-1` — A tile shows poster, title and duration. **Never an autoplaying preview grid** — twelve simultaneously decoding videos is the single most expensive thing this site could do on a phone, and V1 K1 already forbids preloading all portfolio video.
- `RULE-C10-2` — Category filter appears only above 8 published reels, computed at render.

### Pagination

- `RULE-C10-3` — Cursor pagination, 12 per page, **explicit "Load more"**. Not infinite scroll: it breaks the footer, breaks back-navigation, and hides the `[START A PROJECT]` CTA behind an endless list.
- `RULE-C10-4` — Loaded pages are preserved on back-navigation from the overlay, so a visitor never loses their position.

### Player behaviour

| Behaviour | Rule |
|---|---|
| Open | Overlay with the poster painted first, video attached on open ([`RULE-C10-1`](#c10--reels)) |
| Audio | **Muted on open, with a visible unmute control.** V1 C01 forbids autoplaying audio; a reel opened deliberately is still not consent to sound |
| Loop | Loops while open — the short-form convention |
| Advance | Next/previous within the loaded set, keyboard `←`/`→`, swipe on touch |
| Close | `Esc`, backdrop click, close button. Focus returns to the originating tile |
| Concurrency | Exactly one video element attached at a time; the previous is detached and unloaded on advance |
| Captions | Rendered from the WebVTT track, or burned in ([`RULE-O9-5`](O9-accessibility-operations.md)). Toggle where a track exists |

- `RULE-C10-5` — Only one video element is attached at any moment. Advancing detaches the previous. Without this, a visitor swiping through twenty reels accumulates twenty live decoders.
- `RULE-C10-6` — The overlay is a **focus trap while open** and restores focus on close ([O9](O9-accessibility-operations.md)).

### Aspect ratio

- `RULE-C10-7` — 9:16 is the design target. The tile reserves 9:16 and the poster is cropped to it using `ENT-MediaDerivative.focalPoint`, so a mismatched upload is never letterboxed into a grey box.
- `RULE-C10-8` — Non-9:16 reels are contained, not cropped, **in the overlay** — cropping a 16:9 cut to vertical would remove the frame the studio composed. Tiles still crop; the overlay never does.
- `RULE-C10-9` — The overlay caps at `min(90vh, 16/9 × available width)` so a vertical video on a desktop monitor does not become a full-height column.

### Project linking

- `RULE-C10-10` — Where `portfolioProjectId` is set and that project is `Published`, the overlay shows **"From this project →"**. If the project is unpublished, the link is omitted silently — never rendered dead.
- `RULE-C10-11` — `externalUrl` (Instagram) renders as a secondary "View on Instagram" action, never as the primary. V1 F08 requires the site not to depend on social embeds; the site must remain complete with every `externalUrl` null.

### SEO and indexing

| Aspect | Decision |
|---|---|
| Index | `/reels` indexable |
| Individual reels | **Not** separately indexable — no per-reel route exists |
| Deep link | `/reels?r=<slug>` opens that reel's overlay on load; canonical remains `/reels` |
| Structured data | `VideoObject` per reel in the listing, with `thumbnailUrl`, `uploadDate`, `duration` |
| Sitemap | `/reels` only |
| OG | Page-level, using the featured reel's poster |

- `RULE-C10-12` — No per-reel route. Thirty near-identical thin pages competing with the case studies they were cut from is worse for search than one strong page. Deep links work through a query parameter that shares the canonical.

### Mobile

- `RULE-C10-13` — The overlay is full-bleed on mobile with controls in the lower third, clear of the notch and the home indicator.
- `RULE-C10-14` — Swipe up/down advances; swipe down at the first item closes. Every gesture has a visible control equivalent ([O9](O9-accessibility-operations.md)).
- `RULE-C10-15` — With `prefers-reduced-motion`, overlay transitions become opacity-only and auto-advance never engages.

### Analytics

`EVT-reel-play` on open. `EVT-work-filter` on category filter. `EVT-hero-start-project` on the CTA.

- `RULE-C10-16` — `EVT-reel-play` fires on **deliberate open**, not on tile impression. Counting impressions as plays would make short-form look like the best-performing surface on the site by construction.

### States

*Loading* — poster-ratio placeholders, no layout shift. *Empty* — route and nav item hidden entirely when no reel is published, matching `RULE-F11-2`'s treatment of packages. *Error* — retry preserving filter. *Success* — overlay opens under 300 ms from a warm poster.

**Acceptance criteria.**
- `AC-C10-1` — No video decodes until a tile is opened.
- `AC-C10-2` — Only one video element is attached at any moment while advancing.
- `AC-C10-3` — With no published reels, `/reels` and its nav entry are absent.
- `AC-C10-4` — A reel linked to an unpublished project renders no project link.
- `AC-C10-5` — `/reels?r=<slug>` opens that reel and reports canonical `/reels`.
- `AC-C10-6` — The overlay traps focus, restores it on close, and is fully keyboard-operable.
- `AC-C10-7` — A reel with speech and no caption track cannot reach this surface ([`RULE-O9-3`](O9-accessibility-operations.md)).
- `AC-C10-8` — Removing every `externalUrl` leaves the page fully functional.

---

## C09 · `/contact` — Contact

Closes V1 C06's `[CONTACT]` CTA, which pointed at nothing.

| Area | Specification |
|---|---|
| Primary goal | Reach the studio without completing a full brief |
| Primary CTA | `[START A PROJECT]` → `C08` |
| Data owner | `ENT-SiteSetting` (`F14`) · `API-public-settings-get` |

**Structure.** Contact methods — phone, email, WhatsApp deep link ([ADR-006](../decisions/ADR-006-whatsapp-channel.md)) · service area · response-time promise · a short general-enquiry form · a prominent pointer to `C08` for project briefs.

- `RULE-C09-1` — The general form is **short** — name, contact, message. It creates an `ENT-Lead` with `source = Website` and an empty brief, flagged in the CRM as unqualified. `C08` remains the qualified path; C09 exists so a visitor who is not ready to brief still has a door.
- `RULE-C09-2` — Every detail comes from `ENT-SiteSetting`. None is hardcoded ([`RULE-F14-1`](F-prime-cms-screens.md)).
- `RULE-C09-3` — Same anti-bot, rate limiting and idempotency as `API-lead-create` ([ADR-003](../decisions/ADR-003-idempotency.md)).

**Acceptance criteria.**
- `AC-C09-1` — Contact detail changes are live without deployment.
- `AC-C09-2` — A general enquiry appears in the CRM flagged unqualified.
- `AC-C09-3` — `[CONTACT]` on `C06` resolves.

---

## C11 · `/privacy` · C12 · `/terms` — Legal

Closes V1 C08's consent step, which linked to a privacy policy that existed nowhere in the specification.

| Area | Specification |
|---|---|
| Data owner | `ENT-SitePage`, system pages (`F13`) · `API-public-page-get` |

- `RULE-C11-1` — Both are `ENT-SitePage` system pages: undeletable and unpublishable while the consent step links them ([`RULE-F13-1`](F-prime-cms-screens.md)).
- `RULE-C11-2` — The privacy page states what is collected, why, retention, and how to request erasure — sourced from [O7](O7-data-lifecycle.md) so policy and mechanism cannot drift apart.
- `RULE-C11-3` — Content requires legal review before publication (`UNRESOLVED-015`). The **page and its route** are specified; the words are not the specification's to write.
- `RULE-C11-4` — Both carry a visible "last updated" date from `ENT-SitePage.updatedAt`.

**Acceptance criteria.**
- `AC-C11-1` — Both routes resolve and are linked from the `C08` consent step.
- `AC-C11-2` — Neither can be deleted or unpublished while linked.
- `AC-C11-3` — The privacy page's retention statement matches [O7.2](O7-data-lifecycle.md).

---

## C13 · `*` — 404

V1 specified 404 *behaviour* on three screens and never a 404 *page*.

- `RULE-C13-1` — Returns HTTP 404 with `noindex`. A soft-404 returning 200 is the most common SEO defect on portfolio sites.
- `RULE-C13-2` — Offers routes onward: Work, Services, Contact, and a project search — not a dead end.
- `RULE-C13-3` — An **unpublished or rights-lapsed** project renders the ordinary 404. It must not disclose that the resource existed, was withdrawn, or why ([R4](R-publishing-rights.md)).
- `RULE-C13-4` — Visually part of the site. A framework default page reads as a broken site rather than a missing page.

**Acceptance criteria.**
- `AC-C13-1` — Unknown routes return status 404, not 200.
- `AC-C13-2` — A rights-lapsed project is indistinguishable from a route that never existed.
- `AC-C13-3` — Every onward link resolves.

---

## C′2 · Revalidation surface map

V1 F07 says publishing "triggers frontend revalidation" and [R4](R-publishing-rights.md) says unpublishing does too. Neither says **which routes**. Revalidating only the project's own route leaves its card on the homepage — and after a rights lapse, that card links to a 404 from the studio's front page.

| Event | Routes revalidated | Also |
|---|---|---|
| Project published | `/work/[slug]`, `/work`, `/` if `isFeatured`, `/services` if the linked service shows featured work | Sitemap, OG cache warm |
| Project unpublished or rights-lapsed | **The same set**, unconditionally | Sitemap, **CDN purge** ([R4](R-publishing-rights.md)) |
| Reel published or unpublished | `/reels`, `/` if `isFeatured` | Sitemap |
| Showreel activated | `/` | — |
| Site page published | That route only | Sitemap |
| Service or package changed | `/services`, `/packages`, `/` if surfaced | Sitemap |
| Testimonial approved | Every route embedding it | — |

- `RULE-C2-1` — Unpublish revalidates the **same set as publish, unconditionally** — including `/` even when `isFeatured` is now false, because the flag may have been cleared in the same transaction. Publish may optimise; **removal never may.**
- `RULE-C2-2` — Revalidation is a set, not a single route. A failure on any member is retried independently and raises `NTF-027` if it exhausts, matching the takedown-step handling in [R4](R-publishing-rights.md).
- `RULE-C2-3` — The sitemap regenerates on every publish and unpublish. A sitemap advertising a 404 invites a crawler to keep requesting it.
- `RULE-C2-4` — Externally cached social previews (Facebook, X, LinkedIn) are **outside our control**. Documented so nobody treats a stale social card as a takedown failure — the fix is a manual scrape request, and it is named in the [R4](R-publishing-rights.md) runbook.

---

## C′3 · Public screen set now closed

All 13 public routes are specified. `C01`–`C08` are V1's, carried forward; `C09`–`C13` are added here. No CTA, nav item or consent link in the specification now points at an unspecified route — which was `REQ-C-101`.
