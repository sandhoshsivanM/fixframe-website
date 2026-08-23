# Reference · Entities

**Normative.** Where a part disagrees with this file, this file is correct.
**Assumes:** [ADR-001](../decisions/ADR-001-database.md) (PostgreSQL), [ADR-004](../decisions/ADR-004-permissions.md) (permissions), [ADR-005](../decisions/ADR-005-publishing-rights.md) (rights).

V1 Part I1 listed 17 entities. Ten more were referenced in V1's prose but never modelled — `Note`, `Milestone`, `Attachment`, `ClientContact`, `MediaUsage`, `Category`, `Tag`, `SiteSetting`, `ShowreelVersion`, `LeadReference` — and are defined here. The remainder are new, arising from the ADRs.

---

## Global conventions

Applies to every entity unless stated otherwise.

| Concern | Convention |
|---|---|
| Primary key | `id uuid` PK, `gen_random_uuid()` default |
| Audit columns | `createdAt timestamptz NOT NULL`, `updatedAt timestamptz NOT NULL` |
| Time | **All** timestamps `timestamptz`, stored UTC. Display timezone is a presentation concern — see `UNRESOLVED-002`. |
| Email | `citext` — case-insensitive uniqueness without application normalisation |
| Money | `numeric(12,2)` + separate `currency char(3)`. Never float. |
| Enums | Postgres native enum types, mirrored as C# enums. Adding a value is a migration. |
| Deletion | **No generic soft-delete column.** V1 was inconsistent here — `Client` archived, `MediaAsset` had `Archived` status, projects had `Completed`. V2 rule: entities with a lifecycle use their **status enum**; entities that are merely hideable get an explicit `archivedAt timestamptz NULL`. Hard delete is permitted only where noted. |
| Ordering | User-orderable collections carry `sortOrder int NOT NULL`, gapped by 10 on insert to make reordering cheap. |

**Archivable entities** (`archivedAt`): `Client`, `Service`, `Package`, `Testimonial`, `Category`, `Tag`, `Reel`, `MediaAsset` (in addition to its status), `Role` (custom only).

---

## 1 · Identity & access

### ENT-User
| Field | Type | Notes |
|---|---|---|
| `email` | citext UNIQUE | Login identifier |
| `displayName` | text | |
| `passwordHash` | text NULL | Null until invitation accepted |
| `status` | enum | `Invited \| Active \| Suspended \| Deactivated` |
| `mfaRequired` | bool | Forced true for any user holding `PERM-users-write` |
| `lastLoginAt` | timestamptz NULL | |
| `failedLoginCount` | int | Lockout counter, reset on success |
| `lockedUntil` | timestamptz NULL | |

Deactivation is a status change, never a delete — `ActivityLog` rows must keep resolving to a real actor.

### ENT-Role
`name text UNIQUE`, `description text`, `isSystem bool`, `archivedAt`.
System roles (`Owner`, `ContentEditor`, `Sales`, `Production`, `Finance`) cannot be deleted or renamed.

### ENT-Permission
`module text`, `action text`, `description text`. Unique on `(module, action)`. **Seeded only** — never user-editable. Enumerated in [permissions.md](permissions.md).

### ENT-RolePermission
`roleId → Role`, `permissionId → Permission`. PK `(roleId, permissionId)`.

### ENT-UserRole
`userId → User`, `roleId → Role`, `grantedByUserId → User`, `grantedAt`. PK `(userId, roleId)`.

> **Invariant.** At least one `Active` user must hold `PERM-users-write` at all times. Enforced at the service layer on role removal, user deactivation and role-permission edits.

### ENT-Session
`userId → User`, `tokenHash text UNIQUE`, `issuedAt`, `expiresAt`, `lastSeenAt`, `revokedAt NULL`, `userAgent text`, `ipAddress inet`, `mfaSatisfied bool`.
Only the hash is stored. Powers screen N09 (active sessions) and remote revocation.

### ENT-Invitation
`email citext`, `invitedByUserId → User`, `roleIds uuid[]`, `tokenHash text UNIQUE`, `expiresAt`, `acceptedAt NULL`, `revokedAt NULL`. Default validity 7 days.

### ENT-MfaEnrollment
`userId → User`, `method enum(Totp)`, `secretEncrypted bytea`, `confirmedAt NULL`, `lastUsedAt NULL`.
TOTP only for MVP — decided in Part N rather than deferred. Secret encrypted at rest with a key from the secret manager, never the database.

### ENT-RecoveryCode
`userId → User`, `codeHash text`, `usedAt NULL`. Ten issued at enrollment, single-use.

### ENT-PasswordResetToken
`userId → User`, `tokenHash text UNIQUE`, `expiresAt`, `usedAt NULL`. Validity 60 minutes, single-use, invalidated by password change.

---

## 2 · Sales

### ENT-Lead
| Field | Type | Notes |
|---|---|---|
| `serviceId` | → Service NULL | V1 D1 |
| `projectType` | text | |
| `projectDate` | date NULL | May be unknown |
| `location` | text | |
| `budgetRange` | enum NULL | Brackets at `UNRESOLVED-004`; includes `PreferNotToSay` |
| `brief` | text | Min/max length enforced server-side |
| `name` | text | |
| `email` | citext NULL | **Check constraint: `email` or `phone` must be non-null** (V1 C08) |
| `phone` | text NULL | E.164 where derivable |
| `preferredContact` | enum | `WhatsApp \| Call \| Email` |
| `source` | enum | `Website \| Manual \| Referral \| Campaign` |
| `sourcePageUrl` | text NULL | |
| `sourceProjectId` | → PortfolioProject NULL | **Closes the C03 gap** — V1 passed this from the case-study CTA with nowhere to store it |
| `packageId` | → Package NULL | **Closes the C07 gap** — same defect |
| `campaign` | jsonb NULL | utm_* capture |
| `status` | enum | `New \| Contacted \| Qualified \| ProposalSent \| Negotiation \| Won \| Lost` (V1 D2) |
| `lostReason` | text NULL | |
| `assigneeId` | → User NULL | |
| `convertedProjectId` | → OperationalProject NULL | Set by conversion |
| `convertedAt` | timestamptz NULL | |
| `duplicateOfLeadId` | → Lead NULL | Soft flag per ADR-003 — **flagged, never discarded** |

Indexes: `(status, createdAt desc)`, `(assigneeId, status)`, `(email)`, `(phone)`.

### ENT-LeadReference
`leadId → Lead`, `url text`, `sortOrder`. **http/https only**, validated server-side (V1 D1).

### ENT-Client
`name text`, `companyName text NULL`, `notes text`, `archivedAt`. Archive, never delete, while any project references it (V1 E04).

### ENT-ClientContact
`clientId → Client`, `name`, `email citext NULL`, `phone NULL`, `role text NULL`, `isPrimary bool`.
Named in V1 E04's technical implementation but absent from I1.

---

## 3 · Delivery

### ENT-OperationalProject
| Field | Type | Notes |
|---|---|---|
| `clientId` | → Client | |
| `title` | text | |
| `serviceId` | → Service NULL | |
| `stage` | enum | `PreProduction \| Scheduled \| Production \| Editing \| ClientReview \| FinalDelivery \| Completed \| OnHold` (V1 E05) |
| `ownerId` | → User NULL | |
| `shootDate` | date NULL | |
| `location` | text NULL | |
| `quoteReference` | text NULL | |
| `portfolioProjectId` | → PortfolioProject NULL | **Zero-or-one.** Completion never implies publication (V1 G2) |

Indexes: `(stage, shootDate)`, `(ownerId, stage)`, `(clientId)`.

### ENT-Milestone
`projectId → OperationalProject`, `type enum(BriefApproved|Proposal|Booking|Shoot|FirstCut|Review|Final|Payment)`, `title`, `dueDate NULL`, `completedAt NULL`, `sortOrder`.
Drives E06's timeline. Referenced throughout V1 G1; never modelled.

### ENT-Task
`title`, `description NULL`, `assigneeId → User NULL`, `dueAt NULL`, `priority enum(Low|Normal|High)`, `status enum(Open|InProgress|Done|Cancelled)`, `completedAt NULL`, `leadId NULL`, `projectId NULL`, `milestoneId NULL`.

> **Overdue is derived** (`dueAt < now() AND status NOT IN (Done, Cancelled)`), never a stored column. V1 E08 requires this explicitly.

Check constraint: at most one of `leadId` / `projectId` is set.

### ENT-CalendarEvent
`type enum(Shoot|Meeting|EditDeadline|Delivery|PaymentDue)`, `title`, `startAt`, `endAt`, `allDay bool`, `location NULL`, `leadId NULL`, `projectId NULL`, `createdByUserId`.
Stored UTC. Reschedules append to `ActivityLog` (V1 E07 acceptance criterion).

### ENT-Note
`body text`, `authorId → User`, `leadId NULL`, `projectId NULL`, `clientId NULL`, `isInternal bool DEFAULT true`.

> **Internal notes are never included in any outbound notification or public payload.** V1 A3 and E03 both require this; it is enforced at the serialiser, not by convention.

### ENT-Attachment
`filename text`, `contentType text`, `byteSize bigint`, `storageKey text`, `visibility enum(Internal|RightsEvidence)`, `uploadedByUserId`, `leadId NULL`, `projectId NULL`, `clientId NULL`, `releaseId NULL`.

Distinct from `MediaAsset`: attachments are documents (contracts, releases, briefs), not processed media. **Never publicly reachable**, always served through a signed, short-lived, permission-checked URL.

---

## 4 · Public content

### ENT-PortfolioProject
| Field | Type | Notes |
|---|---|---|
| `slug` | citext UNIQUE | Immutable once published |
| `title`, `summary`, `narrative` | text | |
| `clientDisplayName` | text NULL | May differ from real client; may be withheld |
| `categoryId` | → Category | |
| `year` | int | |
| `location` | text NULL | |
| `coverMediaId` | → MediaAsset | Required to publish |
| `posterDerivativeId` | → MediaDerivative | **Required to publish** (V1 C01, F07) |
| `status` | enum | `Draft \| Scheduled \| Published \| Unpublished \| Archived` |
| `publishedAt`, `scheduledFor` | timestamptz NULL | |
| `unpublishReason` | enum NULL | `Manual \| RightsLapsed` |
| `isFeatured` | bool | Home eligibility (V1 C01) |
| `featuredSortOrder` | int NULL | Overrides date order (V1 C02) |
| `seoTitle`, `seoDescription` | text NULL | |
| `ogImageDerivativeId` | → MediaDerivative NULL | |
| `operationalProjectId` | → OperationalProject NULL | |
| `rightsRecordId` | → RightsRecord | **Required to publish** |

### ENT-ProjectBlock
`portfolioProjectId → PortfolioProject`, `type enum(Video|Gallery|Text|Bts|BeforeAfter|Testimonial|Credits)`, `sortOrder`, `content jsonb`.
`content` shape is discriminated by `type` and validated at the application boundary against a JSON schema per type. GIN index where queried. Per [ADR-001](../decisions/ADR-001-database.md).

### ENT-Reel
`mediaId → MediaAsset`, `posterDerivativeId → MediaDerivative`, `title`, `caption NULL`, `categoryId NULL`, `externalUrl NULL`, `portfolioProjectId NULL`, `status enum(Draft|Published)`, `isFeatured`, `sortOrder`, `archivedAt`.
`externalUrl` (Instagram) is optional — V1 F08 requires the site not depend on social embeds.

### ENT-Service
`name`, `slug citext UNIQUE`, `description`, `deliverables jsonb`, `isActive bool`, `sortOrder`, `archivedAt`, `seoTitle NULL`, `seoDescription NULL`.
**Editable via screen F10** — the screen V1 required in C04 and never provided.

### ENT-Package
`serviceId → Service NULL`, `name`, `displayPrice text`, `inclusions jsonb`, `disclaimer text NULL`, `isActive bool`, `sortOrder`, `archivedAt`.

> `displayPrice` is **text, not numeric** — V1 C07 is explicit that MVP prices are display strings and not an invoicing source of truth. Storing them as money would invite exactly the coupling V1 forbids.

**Editable via screen F11** — closes the `AC-C07-1` contradiction ("owner can change package without deployment").

### ENT-Testimonial
`quote text`, `personName`, `personRole NULL`, `clientId NULL`, `portfolioProjectId NULL`, `approvalStatus enum(Pending|Approved|Rejected)`, `approvedByUserId NULL`, `approvedAt NULL`, `isFeatured`, `sortOrder`, `archivedAt`.
Approval workflow operated on screen F12. V1 required approval (A3, C01) and provided no approver.

### ENT-Category / ENT-Tag
`name`, `slug citext UNIQUE`, `scope enum(Work|Service|Media|Reel)` (Category only), `sortOrder`, `archivedAt`.
Categories drive filtering on C01, C02, C04, F02 and F08 throughout V1 without ever being modelled.

### ENT-EntityTag
`tagId → Tag`, `entityType text`, `entityId uuid`. Polymorphic join; index `(entityType, entityId)`.

### ENT-SiteSetting
`key text UNIQUE`, `value jsonb`, `updatedByUserId`.
Holds contact details, social handles, response-time promise, SEO defaults, active showreel pointer, legal-page toggles. Edited on screens F13–F15.

### ENT-SitePage
`slug citext UNIQUE`, `title`, `blocks jsonb`, `status enum(Draft|Published)`, `seoTitle NULL`, `seoDescription NULL`.
Backs About (C06) and the legal pages the audit found missing (Privacy, Terms).

### ENT-NavigationItem
`location enum(Header|Footer)`, `label`, `href`, `sortOrder`, `isExternal bool`, `parentId NULL`.

### ENT-ShowreelVersion
`mediaId → MediaAsset`, `posterDerivativeId → MediaDerivative`, `heroVariantMediaId NULL`, `isActive bool`, `activatedAt NULL`, `activatedByUserId NULL`.

> **Partial unique index on `isActive WHERE isActive` — exactly one active showreel.** V1 F09 requires an atomic switch and rollback; a partial unique index makes the invariant the database's problem rather than the application's.

---

## 5 · Media

### ENT-MediaAsset
| Field | Type | Notes |
|---|---|---|
| `kind` | enum | `Video \| Photo` |
| `role` | enum | `PortfolioFilm \| Reel \| Showreel \| Bts \| RawPreview \| GradedFinal \| ReviewCopy \| InternalProjectMedia \| Poster \| Other` |
| `status` | enum | `PendingUpload \| Uploading \| Uploaded \| Processing \| Ready \| Failed \| Archived` — V1 I3, unchanged |
| `visibility` | enum | `Internal \| Public` |
| `title`, `caption`, `altText` | text NULL | `altText` required for public photos (V1 F04) |
| `providerName` | text NULL | Per [ADR-002](../decisions/ADR-002-media-processing.md) |
| `providerAssetId` | text NULL | Provider migration = re-upload + remap, not a schema change |
| `sourceStorageKey` | text NULL | **Never exposed publicly** (V1 F02) |
| `durationSeconds` | numeric NULL | |
| `width`, `height` | int NULL | |
| `colourSpace` | text NULL | e.g. `Rec.709` — metadata only, never applied (V1 F06) |
| `cameraProfile` | text NULL | |
| `gradeNote` | text NULL | |
| `checksumSha256` | text NULL | Reconciliation and dedupe |
| `projectId` | → OperationalProject NULL | |
| `failureReason` | text NULL | |
| `archivedAt` | | |

> **Only `Ready` may be selected for public playback** (V1 I3). Enforced in the publish transaction, not the UI.

Indexes: `(status, createdAt desc)`, `(kind, role, visibility)`, `(providerName, providerAssetId)`.

### ENT-MediaDerivative
`mediaAssetId → MediaAsset`, `kind enum(Poster|Thumbnail|WebSmall|WebMedium|WebLarge|VideoRendition|OgImage)`, `storageKey NULL`, `playbackUrl NULL`, `width`, `height`, `bitrateKbps NULL`, `cropRect jsonb NULL`, `focalPoint jsonb NULL`, `isPrimary bool`.

Partial unique index on `(mediaAssetId, kind) WHERE isPrimary` — one primary poster per asset (V1 F05).

### ENT-MediaUsage
`mediaAssetId → MediaAsset`, `entityType text`, `entityId uuid`, `usageRole text`.
Named in V1 F02's technical implementation, never modelled. **This is what makes "deletion blocked when asset is in active published use" enforceable** rather than aspirational — the F02 rule V1 states but gives no mechanism for.

### ENT-BeforeAfterPair
`rawMediaId → MediaAsset`, `finalMediaId → MediaAsset`, `label NULL`, `defaultComparisonPosition numeric`, `publicPlacement enum(Hidden|EditingPage|ProjectCaseStudy)`, `portfolioProjectId NULL`.
Both sides remain separate immutable records; the pair never mutates a master (V1 F06).

### ENT-MediaProcessJob
`mediaAssetId → MediaAsset`, `type enum(Probe|Transcode|FrameExtract|ImageDerivative)`, `status enum(Queued|Running|Succeeded|Failed|DeadLettered)`, `attemptCount int`, `lastError text NULL`, `providerJobId NULL`, `queuedAt`, `startedAt NULL`, `finishedAt NULL`, `nextRetryAt NULL`.
Full lifecycle in Part H′.

---

## 6 · Rights — per [ADR-005](../decisions/ADR-005-publishing-rights.md)

### ENT-RightsRecord
`portfolioProjectId → PortfolioProject UNIQUE`, `checklistGeneratedAt`, `lastEvaluatedAt`, `evaluationResult enum(Blocked|Clear)`.

### ENT-Release
`rightsRecordId → RightsRecord`, `type enum(ClientConsent|TalentRelease|MusicLicence|StockLicence|LocationPermit)`, `status enum(NotRequired|Required|Pending|Granted|Refused|Expired|Revoked)`, `subjectName text NULL` (person or track), `grantorName`, `grantorRole NULL`, `grantedAt NULL`, `expiresAt NULL`, `evidenceAttachmentId → Attachment NULL`, `recordedByUserId`, `approvedByUserId NULL`, `notes NULL`.

Index `(status, expiresAt)` — `JOB-rights-sweep` scans this hourly.

---

## 7 · Client review (MVP) — see Part G′

### ENT-ReviewLink
`projectId → OperationalProject`, `mediaAssetId → MediaAsset` (a `ReviewCopy`), `tokenHash text UNIQUE`, `passphraseHash NULL`, `expiresAt`, `revokedAt NULL`, `createdByUserId`, `lastAccessedAt NULL`, `accessCount int`.

Token is never stored in plaintext. Default expiry at `UNRESOLVED-013`.

### ENT-ReviewFeedback
`projectId → OperationalProject`, `reviewLinkId NULL`, `receivedVia enum(Link|Email|WhatsApp|Call|Meeting)`, `body text`, `recordedByUserId`, `receivedAt`, `resultingTaskId → Task NULL`.

MVP records feedback **manually in the CRM** whatever channel it arrived through. V2 replaces this with frame-accurate commenting.

---

## 8 · System

### ENT-ActivityLog
`actorUserId → User NULL` (null = system), `action text`, `entityType text`, `entityId uuid`, `occurredAt`, `metadata jsonb`, `ipAddress inet NULL`.
Append-only; no update or delete path exists. Read on screen N10 — the viewer V1 never provided.
Index `(entityType, entityId, occurredAt desc)`.

### ENT-IdempotencyRecord
`key text`, `endpoint text`, `principal text`, `requestHash text`, `responseBody jsonb`, `responseStatus int`, `createdAt`.
Unique on `(endpoint, principal, key)`. Purged after 24h. Per [ADR-003](../decisions/ADR-003-idempotency.md).

### ENT-NotificationRecord
`notificationId text` (→ `NTF-nnn`), `channel enum(Email|WhatsApp|InApp)`, `recipient text`, `relatedEntityType NULL`, `relatedEntityId NULL`, `status enum(Queued|Sent|Failed|Suppressed)`, `attemptCount`, `lastError NULL`, `sentAt NULL`.

> **A queued notification failing must never roll back the business write that raised it.** V1 A3's first rule — "a public enquiry is never lost because email notification failed" — generalises to every notification in the system.

---

## 9 · Finance — `DEFERRED-V2`

Modelled here so V2 does not repeat V1's mistake of naming entities in prose without defining them. Not implemented in MVP.

`ENT-Quote` · `ENT-Invoice` · `ENT-LineItem` · `ENT-Payment`

Constraints already established by V1 E09 and carried forward: invoice numbers unique and **immutable once issued**; tax rules are not assumed or automated without explicit business confirmation.
