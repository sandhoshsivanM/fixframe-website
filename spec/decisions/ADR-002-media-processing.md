# ADR-002 · Media processing → managed video provider behind an abstraction

**Status:** ACCEPTED
**Supersedes:** V1 Part H1 ("Worker / media provider") and H3, which described the pipeline without naming an implementation

## Context

The media pipeline is the single largest technical risk in this product. V1 Part F specifies nine media screens that between them require: resumable multipart upload, codec/duration probing, multi-rendition transcoding, poster frame extraction with a scrubbable candidate strip, focal-point-aware cropping at four aspect ratios, synchronised dual-stream playback for before/after comparison, and CDN delivery — all operated by a non-technical owner.

V1 left this as "worker/provider" without deciding. The decision determines the whole of Part H′ (media processing contract), the entire media half of the cost model, and how much operational surface the studio owns.

## Decision

**A managed video provider for transcode and playback, plus object storage for masters and derivatives, both behind an `IMediaProcessingProvider` abstraction.**

Proposed concrete implementation:

| Concern | Choice |
|---|---|
| Video transcode, poster/frame extraction, adaptive playback, video CDN | **Cloudflare Stream** |
| Source masters, photo originals, photo derivatives, review copies | **Cloudflare R2** |
| Photo derivative generation (thumbnail, web-medium, web-large) | **In-process ImageSharp worker** — not a second vendor |
| Abstraction seam | `IMediaProcessingProvider` in the ASP.NET Core layer |

## Rationale

**Why managed for video.** Self-hosting ffmpeg means owning queue infrastructure, worker autoscaling, encoding ladder design, HLS/DASH packaging, per-browser playback compatibility, thumbnail extraction tooling, storage lifecycle, retry and dead-letter behaviour — and being on call for all of it. The studio's differentiator is cinematography, not video infrastructure. V1's own A3 rule already narrows the problem helpfully: *"Raw camera masters are not required in the website CMS; publish optimized delivery assets."* We are transcoding delivery assets, not archiving 4K ProRes, which keeps managed volumes sane.

**Why self-hosted for photos.** Image derivatives are genuinely trivial — ImageSharp in a .NET background worker handles F04's thumbnail/web-medium/web-large ladder in a few dozen lines. Adding a second vendor for that would be paying a subscription and an integration surface to avoid work that is already easy. Split the decision along the difficulty line rather than applying one policy to both.

**Why R2 specifically.** A video-heavy portfolio site is egress-dominated. R2's pricing model charges storage without a per-GB egress fee, which is the structurally right shape for this workload — but the actual rates are not asserted here from memory. See `UNRESOLVED-007`.

**Why the abstraction.** This is the most expensive decision in the document and the one most likely to be overridden. `IMediaProcessingProvider` keeps Mux, Bunny Stream or a self-hosted ffmpeg worker as a later substitution that touches one adapter rather than the business logic, the entity model or the admin screens.

## Consequences

- `ENT-MediaAsset` carries provider-agnostic fields plus a `providerAssetId` and `providerName`, so a migration between providers is a re-upload and remap rather than a schema change.
- The `MediaAsset` state machine (`PendingUpload → Uploading → Uploaded → Processing → Ready | Failed → Archived`) is owned by **us**, not by the provider. Provider status maps into our states through the adapter. This preserves V1's I3 contract exactly.
- Uploads go **browser → provider directly** via a signed URL, never through API process memory. This was already V1 K1 and H3 policy; the ADR keeps it.
- Provider webhooks are untrusted input. Authentication, replay protection and reconciliation are specified in Part H′ — not left to the adapter.
- `IMediaProcessingProvider` must expose only what the business logic needs: `CreateUploadSession`, `GetAssetStatus`, `GetPlaybackUrl`, `GetPosterCandidates`, `SetPoster`, `Delete`. Anything provider-specific stays inside the adapter.

## Override condition

Two triggers, both external:

1. **Data residency** — if client or legal requirements demand India-resident media storage, Cloudflare's region controls must be evaluated or the decision flipped. Tracked as `UNRESOLVED-008`, gated on `G01`. This is the most likely override.
2. **Existing vendor relationship** — an established Mux or AWS account with committed spend may change the arithmetic.

Neither trigger invalidates the *shape* of the decision (managed video, self-hosted images, abstraction seam) — only the vendor inside the adapter.

## Alternatives considered

**Fully self-hosted ffmpeg worker.** Rejected for MVP on operational burden, not capability. It is cheaper per minute at high volume and remains the right answer if volumes in `UNRESOLVED-006` come back large. The abstraction is specifically designed to keep this door open.

**Mux.** Strong feature set, and its per-title encoding and data API are genuinely better than the alternatives. Rejected for MVP primarily on cost shape for an egress-heavy portfolio site at low volume. Closest runner-up.

**Managed images too (Cloudflare Images / imgix).** Rejected — see "why self-hosted for photos" above. Not worth a vendor for work this simple.
