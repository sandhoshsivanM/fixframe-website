// Domain entities. Mirrors spec/reference/entities.md, which is normative.
// Conventions (entities.md "Global conventions"):
//   - uuid PK, timestamptz UTC everywhere, citext email, numeric money.
//   - No generic soft-delete: lifecycle entities use a status enum,
//     hideable ones carry ArchivedAt.
namespace FixFrame.Api.Domain;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

// ─── Identity & access · ADR-004 (permissions composed into roles) ──────────

public enum UserStatus { Invited, Active, Suspended, Deactivated }

public class User : Entity
{
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string? PasswordHash { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Invited;
    public bool MfaRequired { get; set; }
    public string? MfaSecret { get; set; }
    public DateTimeOffset? MfaConfirmedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }
    public List<UserRole> UserRoles { get; set; } = [];
}

public class Role : Entity
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsSystem { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public List<RolePermission> RolePermissions { get; set; } = [];
    public List<UserRole> UserRoles { get; set; } = [];
}

public class Permission : Entity
{
    public string Module { get; set; } = "";
    public string Action { get; set; } = "";
    public string Description { get; set; } = "";
    public string Key => $"{Module}-{Action}";
}

public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public DateTimeOffset GrantedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class Session : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TokenHash { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset LastSeenAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public bool MfaSatisfied { get; set; }
}

// ─── Sales ─────────────────────────────────────────────────────────────────

public enum LeadStatus { New, Contacted, Qualified, ProposalSent, Negotiation, Won, Lost }
public enum PreferredContact { WhatsApp, Call, Email }
public enum LeadSource { Website, Manual, Referral, Campaign }

public class Lead : Entity
{
    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    public string ProjectType { get; set; } = "";
    public DateOnly? ProjectDate { get; set; }
    public string? Location { get; set; }
    public string? BudgetRange { get; set; }
    public string Brief { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public PreferredContact PreferredContact { get; set; } = PreferredContact.Email;
    public LeadSource Source { get; set; } = LeadSource.Website;
    public string? SourcePageUrl { get; set; }

    // Closes the V1 dead-end: C03/C07 passed these into a form with no field.
    public Guid? SourceProjectId { get; set; }
    public Guid? PackageId { get; set; }

    public LeadStatus Status { get; set; } = LeadStatus.New;
    public string? LostReason { get; set; }
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public Guid? ConvertedProjectId { get; set; }
    public DateTimeOffset? ConvertedAt { get; set; }
    public Guid? DuplicateOfLeadId { get; set; }
    public string Reference { get; set; } = "";
    public List<LeadReference> References { get; set; } = [];
    public List<Note> Notes { get; set; } = [];
}

public class LeadReference : Entity
{
    public Guid LeadId { get; set; }
    public Lead Lead { get; set; } = null!;
    public string Url { get; set; } = "";
    public int SortOrder { get; set; }
}

public class Client : Entity
{
    public string Name { get; set; } = "";
    public string? CompanyName { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public List<ClientContact> Contacts { get; set; } = [];
}

public class ClientContact : Entity
{
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public string Name { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public bool IsPrimary { get; set; }
}

// ─── Delivery ──────────────────────────────────────────────────────────────

public enum ProjectStage
{
    PreProduction, Scheduled, Production, Editing,
    ClientReview, FinalDelivery, Completed, OnHold
}

public class OperationalProject : Entity
{
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public string Title { get; set; } = "";
    public Guid? ServiceId { get; set; }
    public ProjectStage Stage { get; set; } = ProjectStage.PreProduction;
    public Guid? OwnerId { get; set; }
    public DateOnly? ShootDate { get; set; }
    public string? Location { get; set; }
    public string? Brief { get; set; }
    public Guid? PortfolioProjectId { get; set; }
    public List<Milestone> Milestones { get; set; } = [];
    public List<TaskItem> Tasks { get; set; } = [];
}

public enum MilestoneType
{
    BriefApproved, Proposal, Booking, Shoot, FirstCut, Review, Final, Payment
}

public class Milestone : Entity
{
    public Guid ProjectId { get; set; }
    public OperationalProject Project { get; set; } = null!;
    public MilestoneType Type { get; set; }
    public string Title { get; set; } = "";
    public DateOnly? DueDate { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public int SortOrder { get; set; }
}

public enum TaskStatus { Open, InProgress, Done, Cancelled }
public enum TaskPriority { Low, Normal, High }

public class TaskItem : Entity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public DateTimeOffset? DueAt { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    public TaskStatus Status { get; set; } = TaskStatus.Open;
    public DateTimeOffset? CompletedAt { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? ProjectId { get; set; }

    // entities.md: overdue is derived, never stored.
    public bool IsOverdue => DueAt is { } d
        && d < DateTimeOffset.UtcNow
        && Status is not (TaskStatus.Done or TaskStatus.Cancelled);
}

public class Note : Entity
{
    public string Body { get; set; } = "";
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public Guid? LeadId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? ClientId { get; set; }
    // Never serialised to any public or client-facing payload (V1 A3).
    public bool IsInternal { get; set; } = true;
}

// ─── Public content ────────────────────────────────────────────────────────

public class Category : Entity
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Scope { get; set; } = "Work";
    public int SortOrder { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
}

public class Service : Entity
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Deliverables { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
}

public class Package : Entity
{
    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    public string Name { get; set; } = "";
    // Display string, NOT money — V1 C07 / RULE-F11-1.
    public string DisplayPrice { get; set; } = "";
    public List<string> Inclusions { get; set; } = [];
    public string? Disclaimer { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
}

public enum PublishStatus { Draft, Scheduled, Published, Unpublished, Archived }
public enum UnpublishReason { Manual, RightsLapsed }

public class PortfolioProject : Entity
{
    public string Slug { get; set; } = "";
    public string Title { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Narrative { get; set; } = "";
    public string? ClientDisplayName { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public int Year { get; set; }
    public string? Location { get; set; }
    public Guid? CoverMediaId { get; set; }
    public MediaAsset? CoverMedia { get; set; }
    public PublishStatus Status { get; set; } = PublishStatus.Draft;
    public DateTimeOffset? PublishedAt { get; set; }
    public UnpublishReason? UnpublishReason { get; set; }
    public bool IsFeatured { get; set; }
    public int? FeaturedSortOrder { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public Guid? OperationalProjectId { get; set; }
    public List<ProjectBlock> Blocks { get; set; } = [];
    public RightsRecord? RightsRecord { get; set; }
}

public enum BlockType { Video, Gallery, Text, Bts, BeforeAfter, Testimonial, Credits }

public class ProjectBlock : Entity
{
    public Guid PortfolioProjectId { get; set; }
    public PortfolioProject PortfolioProject { get; set; } = null!;
    public BlockType Type { get; set; }
    public int SortOrder { get; set; }
    // jsonb, discriminated by Type — ADR-001.
    public string Content { get; set; } = "{}";
}

public class Reel : Entity
{
    public Guid MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public string Title { get; set; } = "";
    public string? Caption { get; set; }
    public Guid? CategoryId { get; set; }
    public string? ExternalUrl { get; set; }
    public Guid? PortfolioProjectId { get; set; }
    public PublishStatus Status { get; set; } = PublishStatus.Draft;
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
}

public enum ApprovalStatus { Pending, Approved, Rejected }

public class Testimonial : Entity
{
    public string Quote { get; set; } = "";
    public string PersonName { get; set; } = "";
    public string? PersonRole { get; set; }
    public Guid? PortfolioProjectId { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public Guid? ApprovedByUserId { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
}

public class SitePage : Entity
{
    public string Slug { get; set; } = "";
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public PublishStatus Status { get; set; } = PublishStatus.Draft;
    public bool IsSystemPage { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
}

public class SiteSetting : Entity
{
    public string Key { get; set; } = "";
    public string Value { get; set; } = "";
}

// ─── Media · ADR-002, Part H′ ──────────────────────────────────────────────

public enum MediaKind { Video, Photo }
public enum MediaStatus { PendingUpload, Uploading, Uploaded, Processing, Ready, Failed, Archived }
public enum MediaVisibility { Internal, Public }

public class MediaAsset : Entity
{
    public MediaKind Kind { get; set; }
    public string Role { get; set; } = "Other";
    public MediaStatus Status { get; set; } = MediaStatus.PendingUpload;
    public MediaVisibility Visibility { get; set; } = MediaVisibility.Internal;
    public string? Title { get; set; }
    public string? Caption { get; set; }
    public string? AltText { get; set; }
    public string? ProviderName { get; set; }
    public string? ProviderAssetId { get; set; }
    // Never exposed publicly — RULE-O6-9.
    public string? SourceStorageKey { get; set; }
    public decimal? DurationSeconds { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? ChecksumSha256 { get; set; }
    public string? FailureReason { get; set; }
    // O9: unset blocks public publish — RULE-O9-3.
    public bool? HasSpeech { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public List<MediaDerivative> Derivatives { get; set; } = [];
}

public enum DerivativeKind { Poster, Thumbnail, WebSmall, WebMedium, WebLarge, VideoRendition, OgImage, Captions }

public class MediaDerivative : Entity
{
    public Guid MediaAssetId { get; set; }
    public MediaAsset MediaAsset { get; set; } = null!;
    public DerivativeKind Kind { get; set; }
    public string? StorageKey { get; set; }
    public string? PlaybackUrl { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public bool IsPrimary { get; set; }
}

// Makes "deletion blocked when in active published use" enforceable,
// and drives per-material withdrawal on rights lapse — RULE-R4-1.
public class MediaUsage : Entity
{
    public Guid MediaAssetId { get; set; }
    public MediaAsset MediaAsset { get; set; } = null!;
    public string EntityType { get; set; } = "";
    public Guid EntityId { get; set; }
    public string UsageRole { get; set; } = "";
}

// ─── Rights · ADR-005, Part R ──────────────────────────────────────────────

public enum ReleaseType { ClientConsent, TalentRelease, MusicLicence, StockLicence, LocationPermit }
public enum ReleaseStatus { NotRequired, Required, Pending, Granted, Refused, Expired, Revoked }
public enum ScopeUse { PortfolioOnly, PortfolioAndSocial, PaidAdvertising, Unrestricted }

public class RightsRecord : Entity
{
    public Guid PortfolioProjectId { get; set; }
    public PortfolioProject PortfolioProject { get; set; } = null!;
    public DateTimeOffset? ChecklistGeneratedAt { get; set; }
    public DateTimeOffset? LastEvaluatedAt { get; set; }
    public bool IsClear { get; set; }
    public List<Release> Releases { get; set; } = [];
}

public class Release : Entity
{
    public Guid RightsRecordId { get; set; }
    public RightsRecord RightsRecord { get; set; } = null!;
    public ReleaseType Type { get; set; }
    public ReleaseStatus Status { get; set; } = ReleaseStatus.Required;
    public string? SubjectName { get; set; }
    public string? GrantorName { get; set; }
    public string? GrantorRole { get; set; }
    public DateTimeOffset? GrantedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public string? EvidenceReference { get; set; }
    public ScopeUse ScopeUse { get; set; } = ScopeUse.PortfolioOnly;
    public string? ScopeTerritory { get; set; }
    public string? ScopeNotes { get; set; }
    public Guid? RecordedByUserId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public string? Notes { get; set; }
}

// ─── System ────────────────────────────────────────────────────────────────

public class ActivityLog : Entity
{
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = "";
    public string EntityType { get; set; } = "";
    public Guid EntityId { get; set; }
    public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;
    public string Metadata { get; set; } = "{}";
    public string? IpAddress { get; set; }
}

// ADR-003 — one idempotency convention for every state-changing POST.
public class IdempotencyRecord : Entity
{
    public string Key { get; set; } = "";
    public string Endpoint { get; set; } = "";
    public string Principal { get; set; } = "";
    public string RequestHash { get; set; } = "";
    public string ResponseBody { get; set; } = "";
    public int ResponseStatus { get; set; }
}

public enum NotificationStatus { Queued, Sent, Failed, Suppressed }

public class NotificationRecord : Entity
{
    public string NotificationId { get; set; } = "";
    public string Channel { get; set; } = "Email";
    public string Recipient { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Queued;
    public int AttemptCount { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset? SentAt { get; set; }
}
