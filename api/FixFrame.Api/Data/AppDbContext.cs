using FixFrame.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace FixFrame.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Session> Sessions => Set<Session>();

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadReference> LeadReferences => Set<LeadReference>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientContact> ClientContacts => Set<ClientContact>();

    public DbSet<OperationalProject> OperationalProjects => Set<OperationalProject>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Note> Notes => Set<Note>();

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<PortfolioProject> PortfolioProjects => Set<PortfolioProject>();
    public DbSet<ProjectBlock> ProjectBlocks => Set<ProjectBlock>();
    public DbSet<Reel> Reels => Set<Reel>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<SitePage> SitePages => Set<SitePage>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();

    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<MediaDerivative> MediaDerivatives => Set<MediaDerivative>();
    public DbSet<MediaUsage> MediaUsages => Set<MediaUsage>();

    public DbSet<RightsRecord> RightsRecords => Set<RightsRecord>();
    public DbSet<Release> Releases => Set<Release>();

    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();
    public DbSet<NotificationRecord> NotificationRecords => Set<NotificationRecord>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresExtension("citext");

        b.Entity<User>(e =>
        {
            e.Property(x => x.Email).HasColumnType("citext");
            e.HasIndex(x => x.Email).IsUnique();
        });

        b.Entity<Role>().HasIndex(x => x.Name).IsUnique();
        b.Entity<Permission>().HasIndex(x => new { x.Module, x.Action }).IsUnique();
        b.Entity<RolePermission>().HasKey(x => new { x.RoleId, x.PermissionId });
        b.Entity<UserRole>().HasKey(x => new { x.UserId, x.RoleId });
        b.Entity<Session>().HasIndex(x => x.TokenHash).IsUnique();

        b.Entity<Lead>(e =>
        {
            e.Property(x => x.Email).HasColumnType("citext");
            e.HasIndex(x => new { x.Status, x.CreatedAt });
            e.HasIndex(x => x.Reference).IsUnique();
            // entities.md: email OR phone must be present (V1 C08).
            e.ToTable(t => t.HasCheckConstraint(
                "ck_lead_contact_method",
                @"""Email"" IS NOT NULL OR ""Phone"" IS NOT NULL"));
        });

        b.Entity<Category>().HasIndex(x => x.Slug).IsUnique();
        b.Entity<Service>().HasIndex(x => x.Slug).IsUnique();
        b.Entity<SitePage>().HasIndex(x => x.Slug).IsUnique();
        b.Entity<SiteSetting>().HasIndex(x => x.Key).IsUnique();
        b.Entity<PortfolioProject>(e =>
        {
            e.Property(x => x.Slug).HasColumnType("citext");
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasOne(x => x.RightsRecord)
                .WithOne(r => r.PortfolioProject)
                .HasForeignKey<RightsRecord>(r => r.PortfolioProjectId);
        });

        b.Entity<ProjectBlock>().Property(x => x.Content).HasColumnType("jsonb");
        b.Entity<ActivityLog>(e =>
        {
            e.Property(x => x.Metadata).HasColumnType("jsonb");
            e.HasIndex(x => new { x.EntityType, x.EntityId, x.OccurredAt });
        });

        b.Entity<MediaAsset>().HasIndex(x => new { x.Status, x.CreatedAt });
        b.Entity<MediaUsage>().HasIndex(x => new { x.EntityType, x.EntityId });

        // One primary poster per asset — entities.md partial unique index.
        b.Entity<MediaDerivative>()
            .HasIndex(x => new { x.MediaAssetId, x.Kind })
            .IsUnique()
            .HasFilter(@"""IsPrimary"" = true");

        b.Entity<Release>().HasIndex(x => new { x.Status, x.ExpiresAt });

        b.Entity<IdempotencyRecord>()
            .HasIndex(x => new { x.Endpoint, x.Principal, x.Key })
            .IsUnique();

        b.Entity<TaskItem>().Ignore(x => x.IsOverdue);
        b.Entity<Permission>().Ignore(x => x.Key);

        // Enums as text: readable in psql, and adding a value is not a migration hazard.
        foreach (var entity in b.Model.GetEntityTypes())
            foreach (var prop in entity.GetProperties())
                if (prop.ClrType.IsEnum || (Nullable.GetUnderlyingType(prop.ClrType)?.IsEnum ?? false))
                    prop.SetProviderClrType(typeof(string));
    }

    public override int SaveChanges()
    {
        Touch();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        Touch();
        return base.SaveChangesAsync(ct);
    }

    private void Touch()
    {
        foreach (var entry in ChangeTracker.Entries<Entity>())
            if (entry.State is EntityState.Modified)
                entry.Entity.UpdatedAt = DateTimeOffset.UtcNow;
    }
}
