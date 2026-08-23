# Reference · Analytics events

**Normative.** Closes a naming collision in V1.

---

## The collision

V1 names the same events twice, differently, and never reconciles them:

| V1 C01 "Analytics events" | V1 K3 "Conversion analytics" | Same event? |
|---|---|---|
| `hero_cta` | `hero_start_project` | Yes |
| `work_open` | `project_open` | Yes |
| `lead_form_start` | `lead_start` | Yes |
| `showreel_play` | `showreel_play` | Yes — the only one that agrees |

Implemented as written, this produces two half-populated funnels and a conversion rate that is wrong in both. **K3's names win**, since K is the analytics part; C01's variants are `SUPERSEDED`.

---

## Conventions

| Concern | Rule |
|---|---|
| Naming | `snake_case`, `object_action` order |
| Firing | Only on **confirmed** outcomes. `lead_success` fires after server persistence, never on optimistic client state (V1 C08) |
| PII | No name, email, phone, or brief content in any payload. IDs and enums only |
| Consent | Non-essential analytics fire only after consent where the deployment's cookie policy requires it |

---

## Catalogue

| ID | Event | Fires when | Payload |
|---|---|---|---|
| `EVT-hero-start-project` | `hero_start_project` | Primary hero CTA clicked | `{ page }` |
| `EVT-project-open` | `project_open` | Case study opened | `{ projectId, categoryId, source }` |
| `EVT-showreel-play` | `showreel_play` | Deliberate play — **not** autoplay of the muted hero | `{ showreelVersionId }` |
| `EVT-editing-compare` | `editing_compare` | Before/after comparison interacted with | `{ pairId, method: slider\|toggle }` |
| `EVT-work-filter` | `work_filter` | Portfolio filter applied | `{ categoryId }` |
| `EVT-lead-start` | `lead_start` | First field of the brief engaged | `{ service?, packageId?, sourceProjectId? }` |
| `EVT-lead-step` | `lead_step` | A wizard step completed | `{ step: 1..5 }` |
| `EVT-lead-success` | `lead_success` | **Server confirmed persistence** | `{ leadId, service, hasBudget }` |
| `EVT-lead-error` | `lead_error` | Submission failed | `{ code }` |
| `EVT-whatsapp-click` | `whatsapp_click` | Direct contact clicked | `{ context }` |
| `EVT-package-quote` | `package_quote` | Enquiry started from a package | `{ packageId }` |
| `EVT-reel-play` | `reel_play` | Reel played | `{ reelId }` |
| `EVT-service-expand` | `service_expand` | Service chapter opened | `{ serviceId }` |

`EVT-lead-error`, `EVT-work-filter`, `EVT-reel-play` and `EVT-service-expand` are additions — V1's set had no failure event, which makes a drop in `lead_success` indistinguishable from a drop in traffic.

---

## Funnel

```
project_open ──┐
service_expand ├─→ lead_start → lead_step ×n → lead_success
package_quote ─┘                            └→ lead_error
hero_start_project ─┘
```

`whatsapp_click` is a **parallel exit**, not a funnel step — a visitor who takes it leaves the measurable funnel and arrives out-of-band. Counting it as a conversion overstates the form's performance; ignoring it understates total enquiries. Report both.
