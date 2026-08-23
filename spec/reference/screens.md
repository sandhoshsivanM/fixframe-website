# Reference · Screen registry

**Normative.** Every screen ID the traceability matrix may reference. V1's codes are preserved unchanged; V2 extends the `F` series and adds `N`, `R` and `G`.

`INHERITED` = specified in V1 and carried forward unmodified in Increment 1. Increment 3 rewrites these in place.

---

## C · Public website

| ID | Route | Screen | Status |
|---|---|---|---|
| `C01` | `/` | Home / Cinematic Landing | INHERITED |
| `C02` | `/work` | Work / Portfolio | INHERITED |
| `C03` | `/work/[slug]` | Project Case Study | INHERITED |
| `C04` | `/services` | Services | INHERITED |
| `C05` | `/editing` | Editing / Post-production | INHERITED |
| `C06` | `/about` | About / Studio | INHERITED |
| `C07` | `/packages` | Packages | INHERITED |
| `C08` | `/start-a-project` | Start a Project | INHERITED |
| `C09` | `/contact` | Contact | **NEW** — Part C′ |
| `C10` | `/reels` | Reels | **NEW** — Part C′ |
| `C11` | `/privacy` | Privacy Policy | **NEW** — Part C′ |
| `C12` | `/terms` | Terms | **NEW** — Part C′ |
| `C13` | `*` | 404 | **NEW** — Part C′ |

`C09`–`C13` are **specified in [Part C′](../parts/C-prime-public-screens.md)** as of Increment 3. Every CTA, nav item and consent link in the specification now resolves to a specified route.

---

## E · CRM

| ID | Route | Screen | Status |
|---|---|---|---|
| `E01` | `/admin` | CRM Dashboard | INHERITED |
| `E02` | `/admin/leads` | Leads List | INHERITED |
| `E03` | `/admin/leads/[id]` | Lead Detail | INHERITED |
| `E04` | `/admin/clients` | Clients | INHERITED |
| `E05` | `/admin/projects` | Projects / Pipeline | INHERITED |
| `E06` | `/admin/projects/[id]` | Project Detail | INHERITED |
| `E07` | `/admin/calendar` | Calendar | INHERITED |
| `E08` | `/admin/tasks` | Tasks | INHERITED |
| `E09` | `/admin/finance` | Quotations & Invoices | INHERITED · `DEFERRED-V2` |

---

## F · CMS & media studio

| ID | Route | Screen | Status |
|---|---|---|---|
| `F01` | `/admin/content` | CMS Overview | INHERITED — quick actions extended by Part F′ |
| `F02` | `/admin/media` | Media Library | INHERITED |
| `F03` | `/admin/media/video/new` | New Video Upload Wizard | INHERITED — publish gate replaced by Part R |
| `F04` | `/admin/media/photos/new` | Batch Photo Upload | INHERITED |
| `F05` | `/admin/media/[id]/thumbnail` | Thumbnail & Poster Manager | INHERITED |
| `F06` | `/admin/media/color-grade` | Colour Grade / Before-After Manager | INHERITED |
| `F07` | `/admin/projects/content/new` | New Portfolio Project Wizard | INHERITED — publish gate replaced by Part R |
| `F08` | `/admin/reels/new` | New Reel / Short-form Upload | INHERITED |
| `F09` | `/admin/showreel` | Showreel Manager | INHERITED |
| `F10` | `/admin/services` | Services Manager | **NEW** — Part F′ |
| `F11` | `/admin/packages` | Packages Manager | **NEW** — Part F′ |
| `F12` | `/admin/testimonials` | Testimonials & Approval | **NEW** — Part F′ |
| `F13` | `/admin/pages` | Site Content & Legal Pages | **NEW** — Part F′ |
| `F14` | `/admin/settings/site` | Navigation, Contact & Social | **NEW** — Part F′ |
| `F15` | `/admin/settings/taxonomy` | Categories, Tags & SEO Defaults | **NEW** — Part F′ |

---

## N · Authentication & administration — all NEW

| ID | Route | Screen |
|---|---|---|
| `N01` | `/admin/login` | Login |
| `N02` | `/admin/login/mfa` | MFA Challenge |
| `N03` | `/admin/forgot`, `/admin/reset` | Password Recovery |
| `N04` | `/invitations/accept` | Accept Invitation |
| `N05` | `/admin/security/mfa` | MFA Enrollment |
| `N06` | `/admin/profile` | Profile & Security |
| `N07` | `/admin/users` | User Management |
| `N08` | `/admin/roles` | Roles & Permissions |
| `N09` | `/admin/profile/sessions` | Active Sessions |
| `N10` | `/admin/audit` | Audit Log |

---

## R · Publishing rights — all NEW

| ID | Route | Screen |
|---|---|---|
| `R01` | `/admin/portfolio/[id]/rights` | Project Rights Checklist |
| `R02` | `/admin/rights` | Rights Register |

---

## G · Client review — NEW

| ID | Route | Screen |
|---|---|---|
| `G01` | `/admin/projects/[id]` → review panel | Review Links & Feedback |
| `G02` | `/review/[token]` | Protected Review Page (public, `noindex`) |

---

## Totals

| Series | V1 | V2 | Net new |
|---|---|---|---|
| C · Public | 8 | 13 | 5 |
| E · CRM | 9 | 9 | 0 |
| F · CMS | 9 | 15 | 6 |
| N · Auth | 0 | 10 | 10 |
| R · Rights | 0 | 2 | 2 |
| G · Review | 0 | 2 | 2 |
| **Total** | **26** | **51** | **25** |

V1's 26 screens described a product whose administrative half was largely unreachable. The 25 additions are not scope creep — every one closes a promise V1 already made.
