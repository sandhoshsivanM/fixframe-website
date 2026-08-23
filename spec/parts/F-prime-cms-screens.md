# Part F′ · CMS Completion — Screens F10–F15

**Status:** ACCEPTED
**Closes:** V1's public screens name `Services CMS` (C04), `Packages CMS` (C07), `Site CMS` (C06) and a testimonial approval requirement (A3, C01) as their data owners — and V1 provides an admin screen for none of them. `AC-C07-1` ("owner can change package without deployment") is unsatisfiable in V1 as written.

> V1's F01 quick actions are New Project, Upload Video, Upload Photos, New Reel, Manage Thumbnails. Everything the public site says is CMS-managed but which is not media is unreachable. These six screens close that.

---

## F′1 · Requirements

| ID | Requirement |
|---|---|
| `REQ-F-101` | The owner can edit every piece of public copy, pricing and structure without a deployment. |
| `REQ-F-102` | Content that the public site depends on cannot be deleted out from under it. |
| `REQ-F-103` | Publishing site content is an explicit act, separable by permission from editing it. |
| `REQ-F-104` | Legal pages (Privacy, Terms) exist and are editable — V1's lead consent step references a privacy policy that has no page. |
| `REQ-F-105` | Taxonomy is managed, not implied by free-text strings. |

`F01`'s quick-action row gains: **Manage Services · Packages · Testimonials · Site Content**.

---

## F10 · `/admin/services` — Services Manager

| Area | Specification |
|---|---|
| Primary user | Owner / Content Editor |
| Primary goal | Control what the studio sells and how it reads |
| Primary CTA | `[NEW SERVICE]` · Secondary `[REORDER]` |
| Data owner | `ENT-Service` · Permission `PERM-site-read` / `PERM-site-write` |

**Structure.** Ordered list with active toggle and drag handle · editor: name, slug, description, deliverable bullets, related category, SEO title/description · linked packages · featured work preview.

**Interactions.** 01 Create · 02 Edit · 03 Reorder · 04 Toggle active · 05 Archive · 06 Preview on `/services`.

**Business logic.**
- `RULE-F10-1` — Inactive services disappear from `API-public-services-list` immediately but keep their slug reserved, so an indexed URL does not become someone else's page.
- `RULE-F10-2` — Archiving a service referenced by an active `Package` or open `Lead` returns `409 dependency_in_use` (`REQ-F-102`).
- `RULE-F10-3` — Slug is immutable once the service has been publicly live; renaming requires a redirect, which is Increment 3 scope.
- `RULE-F10-4` — Ordering uses gapped `sortOrder`; reordering rewrites only affected rows.

**States.** *Loading* list skeleton · *Empty* guidance plus create action — the public `/services` route hides empty chapters (V1 C04) · *Error* failed save retains edits · *Success* public page revalidates.

**Acceptance.** `AC-F10-1` A new service appears on `/services` without deployment. `AC-F10-2` Deactivation removes it from the public API and from the lead form's service list. `AC-F10-3` Archiving a referenced service is refused with a usable message.

---

## F11 · `/admin/packages` — Packages Manager

| Area | Specification |
|---|---|
| Primary goal | Change price anchoring without a developer |
| Primary CTA | `[NEW PACKAGE]` · Data owner `ENT-Package` · Permission `PERM-site-write` |

**Structure.** List grouped by service · editor: name, linked service, **display price (text)**, inclusions, travel/tax disclaimer, active toggle, order.

**Business logic.**
- `RULE-F11-1` — `displayPrice` is a **string**, not money. V1 C07 is explicit that MVP prices are display copy and not an invoicing source of truth; typing them as `numeric` would invite exactly the coupling V1 forbids.
- `RULE-F11-2` — Inactive packages vanish from `/packages`; if none are active, the route hides entirely and the public CTA degrades to Custom Quote (V1 C07 empty state).
- `RULE-F11-3` — `packageId` flows into the lead form and is persisted on `ENT-Lead.packageId` — **closing V1's dead-end** where C07 passed a package into a form with no field for it.
- `RULE-F11-4` — Archiving a package referenced by an open lead is permitted; the lead keeps the reference and the CRM shows the package as archived.

**Acceptance.** `AC-F11-1` **`AC-C07-1` from V1 is now satisfiable** — a price change is live without deployment. `AC-F11-2` A lead started from a package arrives in the CRM carrying `packageId`. `AC-F11-3` With no active packages, the public route and nav entry disappear cleanly.

---

## F12 · `/admin/testimonials` — Testimonials & Approval

| Area | Specification |
|---|---|
| Primary goal | Publish only verified, approved proof |
| Primary CTA | `[NEW TESTIMONIAL]` · Secondary `[APPROVE]` · Permission `PERM-site-write`; approval `PERM-site-publish` |

**Structure.** Tabs Pending / Approved / Rejected · editor: quote, person, role, linked client, linked project, featured, order.

**Business logic.**
- `RULE-F12-1` — Only `Approved` testimonials are returned by `API-public-testimonials-list`. V1 required approval and never said who approves — this screen is the answer.
- `RULE-F12-2` — Approval is a distinct permission from editing, and is recorded with approver and timestamp.
- `RULE-F12-3` — Editing the quote text of an approved testimonial **returns it to `Pending`**. Otherwise approval means nothing.
- `RULE-F12-4` — Client logos and verifiable stats follow the same approval path (V1 C01, C06 — "no fake stats").

**Acceptance.** `AC-F12-1` An unapproved testimonial never appears publicly. `AC-F12-2` Editing an approved quote revokes approval. `AC-F12-3` Approver and timestamp are recorded and auditable.

---

## F13 · `/admin/pages` — Site Content & Legal Pages

| Area | Specification |
|---|---|
| Primary goal | Edit About, Privacy, Terms and other standing pages |
| Primary CTA | `[SAVE DRAFT]` · Secondary `[PUBLISH]` · Data owner `ENT-SitePage` · Permission `PERM-site-write` / `PERM-site-publish` |

**Structure.** Page list with status · block editor (Text / Media / Team / Values / Stats / BTS gallery) · SEO fields · preview · publish.

**Business logic.**
- `RULE-F13-1` — `privacy` and `terms` are **system pages**: they cannot be deleted or unpublished while the lead form's consent step links to them. V1's C08 consent step referenced a policy that did not exist as a page anywhere.
- `RULE-F13-2` — Draft and published versions are distinct; editing a live page does not affect it until published.
- `RULE-F13-3` — Stats blocks carry a "verified" flag; unverified stats cannot be published (V1 C06 — "only verifiable metrics").
- `RULE-F13-4` — Publishing triggers revalidation of the affected route only.

**Acceptance.** `AC-F13-1` `/privacy` and `/terms` resolve and are reachable from the lead form. `AC-F13-2` A draft edit is not publicly visible before publish. `AC-F13-3` System pages cannot be deleted.

---

## F14 · `/admin/settings/site` — Navigation, Contact & Social

| Area | Specification |
|---|---|
| Primary goal | Change contact details and navigation without a developer |
| Data owner | `ENT-SiteSetting`, `ENT-NavigationItem` · Permission `PERM-site-write` |

**Structure.** Header nav builder (drag, nest one level) · footer nav · contact block: phone, email, WhatsApp number, address, service area · social handles · response-time promise · booking/consent copy.

**Business logic.**
- `RULE-F14-1` — The response-time promise shown on the lead success screen (V1 C08) is a setting, not hardcoded copy.
- `RULE-F14-2` — Removing a nav item pointing at a live route warns but does not block — the route stays reachable by URL.
- `RULE-F14-3` — A nav item pointing at an unpublished or non-existent route is refused.
- `RULE-F14-4` — WhatsApp number changes propagate to every `whatsapp_click` surface, which are all rendered from this setting.

**Acceptance.** `AC-F14-1` A phone-number change is live everywhere without deployment. `AC-F14-2` A nav item cannot point at a dead route.

---

## F15 · `/admin/settings/taxonomy` — Categories, Tags & SEO Defaults

| Area | Specification |
|---|---|
| Primary goal | Manage the taxonomy that drives every filter in the product |
| Data owner | `ENT-Category`, `ENT-Tag`, `ENT-SiteSetting` · Permission `PERM-site-write` |

**Structure.** Categories by scope (Work / Service / Media / Reel) with usage counts · tags with usage counts and merge · SEO defaults: title template, default description, default OG image, organisation schema fields.

**Business logic.**
- `RULE-F15-1` — Categories drive filtering on C01, C02, C04, F02 and F08. V1 used them everywhere and modelled them nowhere; they are now first-class.
- `RULE-F15-2` — Archiving a category in use returns `409 dependency_in_use` with the referencing items listed.
- `RULE-F15-3` — Tag merge is a single transaction that repoints every `ENT-EntityTag` and retires the source tag.
- `RULE-F15-4` — Organisation/LocalBusiness schema fields publish **only** when populated with real data (V1 K2).
- `RULE-F15-5` — Category slug changes do not alter canonical project URLs (V1 C02).

**Acceptance.** `AC-F15-1` A new category appears in the public work filter and the CMS pickers. `AC-F15-2` An in-use category cannot be archived. `AC-F15-3` Merging tags loses no associations. `AC-F15-4` Changing a category slug leaves project canonical URLs untouched.

---

## F′2 · Consequence for V1's "no developer needed" claim

V1 Part M4's definition of done covers uploading media and publishing work. With F10–F15, the claim extends to what the public site actually says: services, prices, proof, legal pages, contact details and navigation. Without them, the owner is independent for video and dependent on a developer for the price list — which is not the product V1 describes.
