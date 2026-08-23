# ADR-006 · WhatsApp is a deep link, not an API integration

**Status:** ACCEPTED
**Closes:** `UNRESOLVED-005`
**Supersedes:** V1 C08 ("use direct WhatsApp after successful submission if desired") and E03 ("Call/email/WhatsApp"), which named the channel without specifying it

## Context

V1 references WhatsApp on two screens without saying what it is. The two readings differ by an order of magnitude:

| | `wa.me` deep link | WhatsApp Business API |
|---|---|---|
| Build | A URL | Vendor account, webhook integration, session management |
| Approval | None | Per-template pre-approval by Meta |
| Cost | Zero | Per-conversation, plus BSP margin |
| Business verification | None | Meta Business verification, display-name review |
| Sends | Human-initiated only | Automated, within the 24-hour session window |
| Record | None in the system | Full message history |

Left unresolved, an implementer would guess — and the two guesses produce different budgets and different delivery timelines.

## Decision

**MVP uses `wa.me` deep links. No Business API integration.**

Every WhatsApp surface is a link that opens the operator's or visitor's own WhatsApp client with a pre-filled message. The system sends nothing and records nothing beyond the click.

| Surface | Behaviour |
|---|---|
| Public lead success (V1 C08) | `wa.me` link with a reference number pre-filled. Fires `EVT-whatsapp-click` |
| Lead detail (V1 E03) | Opens the operator's WhatsApp with the lead's number and a greeting |
| `NTF-024` review link share | Degrades to a **copy-to-clipboard** action; the operator sends it themselves |

The enforcing rules live in the specification body, not here — [`RULE-O4-4`](../parts/O4-notification-architecture.md) (a `W` channel is an operator action, never a send) and [`RULE-F14-4`](../parts/F-prime-cms-screens.md) (the number is a setting on `F14`, never hardcoded).

Because the studio's own device sends the message, **no WhatsApp content exists in the system**. Feedback arriving by WhatsApp is recorded manually with `receivedVia = WhatsApp` (Part G′4). That is the honest MVP position, not a workaround.

## Rationale

The Business API's value is automated, templated, at-scale messaging. A studio handling the lead volumes in the Launch and Expected scenarios of [O5](../parts/O5-performance-scale.md) sends a handful of WhatsApp messages a day, by hand, in conversations that are inherently bespoke. Buying template approval and per-conversation pricing for that is paying integration cost to make a personal medium impersonal.

`ENT-ReviewFeedback.receivedVia` is the deciding evidence. If the field shows WhatsApp dominating months later, the case for the API is made from data rather than assumption.

## Consequences

- No vendor, no Meta business verification, no per-message cost. The WhatsApp line in [O10](../parts/O10-cost-model.md) is zero across all three scenarios.
- WhatsApp conversations are invisible to the CRM. **This is a real and accepted loss** — the mitigation is `receivedVia` capture, not pretending otherwise.
- Deep links work on mobile and WhatsApp Web; on a desktop without WhatsApp Web signed in they fail gracefully to a "copy number" fallback.
- No pre-filled message may contain client PII beyond what the operator already sees, since the URL passes through the OS and the WhatsApp client.

## Override condition

Revisit when any holds: outbound WhatsApp exceeds roughly 50 messages/day; the studio wants automated shoot reminders or delivery notices on the channel; or a client requires a message audit trail. All three are volume or compliance triggers, visible in advance rather than sudden.

## Alternatives considered

**Business API via a BSP now.** Rejected as premature — verification and template approval before the product has a single user, for a channel used conversationally.

**A third-party inbox (WATI, Interakt) bridging WhatsApp into the CRM.** The strongest alternative and the likely V2 answer, since it delivers message history without a direct Meta integration. Rejected for MVP purely on subscription cost against unproven volume.
