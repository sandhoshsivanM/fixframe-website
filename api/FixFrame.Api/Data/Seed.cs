using System.Text.Json;
using FixFrame.Api.Domain;
using FixFrame.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FixFrame.Api.Data;

/// Seeds the permission catalogue, system roles, and demo content so the
/// local site has something real to render. Idempotent: safe to re-run.
public static class Seed
{
    // spec/reference/permissions.md
    private static readonly (string Module, string Action)[] Catalogue =
    [
        ("site","read"),("site","write"),("site","publish"),
        ("media","read"),("media","write"),("media","publish"),("media","delete"),
        ("portfolio","read"),("portfolio","write"),("portfolio","publish"),
        ("rights","read"),("rights","write"),("rights","approve"),
        ("leads","read"),("leads","read-financial"),("leads","write"),("leads","assign"),("leads","convert"),
        ("clients","read"),("clients","write"),("clients","archive"),
        ("projects","read"),("projects","write"),("projects","stage"),("projects","assign"),
        ("tasks","read"),("tasks","write"),("tasks","assign"),
        ("calendar","read"),("calendar","write"),
        ("finance","read"),("finance","read-project"),("finance","quote-write"),("finance","write"),
        ("users","read"),("users","write"),("audit","read"),
    ];

    private static readonly Dictionary<string, string[]> SystemRoles = new()
    {
        ["Owner"] = ["*"],
        ["ContentEditor"] =
        [
            "site-read","site-write","site-publish","media-read","media-write","media-publish","media-delete",
            "portfolio-read","portfolio-write","portfolio-publish","rights-read","rights-write",
            "leads-read","clients-read","projects-read","tasks-read","tasks-write","calendar-read",
        ],
        ["Sales"] =
        [
            "site-read","media-read","portfolio-read","rights-read","rights-write",
            "leads-read","leads-read-financial","leads-write","leads-assign","leads-convert",
            "clients-read","clients-write","projects-read","tasks-read","tasks-write","tasks-assign",
            "calendar-read","calendar-write","finance-quote-write",
        ],
        ["Production"] =
        [
            "site-read","media-read","media-write","portfolio-read","rights-read",
            "leads-read","clients-read","projects-read","projects-write","projects-stage","projects-assign",
            "tasks-read","tasks-write","tasks-assign","calendar-read","calendar-write","finance-read-project",
        ],
        ["Finance"] =
        [
            "leads-read","leads-read-financial","clients-read","projects-read",
            "tasks-read","tasks-write","finance-read","finance-write",
        ],
    };

    public static async Task RunAsync(AppDbContext db, ILogger logger)
    {
        await SeedPermissionsAndRolesAsync(db);
        await SeedOwnerAsync(db, logger);
        await SeedContentAsync(db);
        await SeedCrmAsync(db);
        logger.LogInformation("Seed complete.");
    }

    private static async Task SeedPermissionsAndRolesAsync(AppDbContext db)
    {
        foreach (var (module, action) in Catalogue)
            if (!await db.Permissions.AnyAsync(p => p.Module == module && p.Action == action))
                db.Permissions.Add(new Permission { Module = module, Action = action, Description = $"{module}:{action}" });
        await db.SaveChangesAsync();

        var all = await db.Permissions.ToListAsync();
        foreach (var (name, keys) in SystemRoles)
        {
            var role = await db.Roles.Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Name == name);
            if (role is null)
            {
                role = new Role { Name = name, Description = $"{name} (system)", IsSystem = true };
                db.Roles.Add(role);
                await db.SaveChangesAsync();
            }

            var wanted = keys.Contains("*")
                ? all
                : all.Where(p => keys.Contains($"{p.Module}-{p.Action}")).ToList();

            foreach (var p in wanted)
                if (!role.RolePermissions.Any(rp => rp.PermissionId == p.Id))
                    db.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = p.Id });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedOwnerAsync(AppDbContext db, ILogger logger)
    {
        const string email = "owner@fixframe.local";
        if (await db.Users.AnyAsync(u => u.Email == email)) return;

        var owner = new User
        {
            Email = email,
            DisplayName = "Studio Owner",
            PasswordHash = PasswordHasher.Hash("fixframe-dev-2026"),
            Status = UserStatus.Active,
            // Part N forces MFA for users holding users-write. Off locally so
            // the dev login is one step; the enrolment flow still exists.
            MfaRequired = false,
        };
        db.Users.Add(owner);
        await db.SaveChangesAsync();

        var ownerRole = await db.Roles.FirstAsync(r => r.Name == "Owner");
        db.UserRoles.Add(new UserRole { UserId = owner.Id, RoleId = ownerRole.Id });
        await db.SaveChangesAsync();

        logger.LogInformation("Seeded owner login: {Email} / fixframe-dev-2026", email);
    }

    private static async Task SeedContentAsync(AppDbContext db)
    {
        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Category { Name = "Weddings", Slug = "weddings", SortOrder = 10 },
                new Category { Name = "Commercial", Slug = "commercial", SortOrder = 20 },
                new Category { Name = "Events", Slug = "events", SortOrder = 30 },
                new Category { Name = "Editing", Slug = "editing", SortOrder = 40 });
            await db.SaveChangesAsync();
        }

        if (!await db.Services.AnyAsync())
        {
            db.Services.AddRange(
                new Service
                {
                    Name = "Videography", Slug = "videography", SortOrder = 10,
                    Description = "Wedding, event, commercial and corporate films, shot and cut in-house.",
                    Deliverables = ["Full-day coverage", "Highlight film", "Documentary edit", "Colour grade", "Licensed music"],
                },
                new Service
                {
                    Name = "Photography", Slug = "photography", SortOrder = 20,
                    Description = "Event, portrait, product and campaign photography.",
                    Deliverables = ["Full gallery", "Retouched selects", "Web and print exports"],
                },
                new Service
                {
                    Name = "Post-production", Slug = "post-production", SortOrder = 30,
                    Description = "Offline edit, colour, sound and motion — for footage we shot, or yours.",
                    Deliverables = ["Offline edit", "Colour grade", "Sound mix", "Motion graphics", "Masters and deliverables"],
                },
                new Service
                {
                    Name = "Drone", Slug = "drone", SortOrder = 40,
                    Description = "Aerial coverage as an add-on or standalone shoot, subject to permissions.",
                    Deliverables = ["Aerial coverage", "Permit handling", "Graded aerial cuts"],
                },
                new Service
                {
                    Name = "Social & Reels", Slug = "social-reels", SortOrder = 50,
                    Description = "Short-form packages cut for vertical, delivered on a monthly cadence.",
                    Deliverables = ["Monthly reel package", "Vertical masters", "Caption files"],
                });
            await db.SaveChangesAsync();
        }

        if (!await db.Packages.AnyAsync())
        {
            var video = await db.Services.FirstAsync(s => s.Slug == "videography");
            var post = await db.Services.FirstAsync(s => s.Slug == "post-production");
            db.Packages.AddRange(
                new Package
                {
                    ServiceId = video.Id, Name = "Essential", DisplayPrice = "from ₹85,000", SortOrder = 10,
                    Inclusions = ["Single camera operator", "6 hours coverage", "3–4 minute highlight film", "Colour grade", "2 revisions"],
                    Disclaimer = "Travel outside the city billed at cost. Taxes extra.",
                },
                new Package
                {
                    ServiceId = video.Id, Name = "Signature", DisplayPrice = "from ₹1,65,000", SortOrder = 20,
                    Inclusions = ["Two operators", "Full-day coverage", "Highlight film + documentary edit", "Drone add-on available", "3 revisions"],
                    Disclaimer = "Travel outside the city billed at cost. Taxes extra.",
                },
                new Package
                {
                    ServiceId = video.Id, Name = "Premium", DisplayPrice = "Custom quote", SortOrder = 30,
                    Inclusions = ["Multi-camera crew", "Multi-day coverage", "Full post-production suite", "Unlimited revisions within scope"],
                },
                new Package
                {
                    ServiceId = post.Id, Name = "Editing only", DisplayPrice = "from ₹35,000", SortOrder = 40,
                    Inclusions = ["Offline edit from your footage", "Colour grade", "Sound mix", "2 revisions"],
                    Disclaimer = "Priced per finished minute above 5 minutes.",
                });
            await db.SaveChangesAsync();
        }

        if (!await db.PortfolioProjects.AnyAsync())
            await SeedPortfolioAsync(db);

        if (!await db.SitePages.AnyAsync())
        {
            db.SitePages.AddRange(
                new SitePage
                {
                    Slug = "about", Title = "About the studio", Status = PublishStatus.Published,
                    Body = "We are a small crew that shoots and cuts everything in-house. No subcontracted editors, no stock footage standing in for work we did not do.\n\nThe studio was built around one idea: the story is made in the edit. That is why post-production is a service we sell, not an afterthought bundled into a shoot.",
                },
                new SitePage
                {
                    Slug = "privacy", Title = "Privacy Policy", Status = PublishStatus.Published, IsSystemPage = true,
                    Body = "PLACEHOLDER — requires legal review before launch (UNRESOLVED-015).\n\nWhat we collect: the name, contact details, project details and budget range you submit through the enquiry form.\n\nWhy: to respond to your enquiry and, if you become a client, to deliver the work.\n\nHow long: enquiries that do not become projects are anonymised after 24 months. Project records are kept for 7 years as a commercial record.\n\nYour rights: you may request erasure at any time by contacting us. Where we hold a signed release covering published work, we will withdraw the work before erasing the record.",
                },
                new SitePage
                {
                    Slug = "terms", Title = "Terms", Status = PublishStatus.Published, IsSystemPage = true,
                    Body = "PLACEHOLDER — requires legal review before launch (UNRESOLVED-015).\n\nQuotations are valid for 30 days. Bookings are confirmed on receipt of the retainer. Copyright in delivered work remains with the studio unless assigned in writing; clients receive a licence for the agreed use.",
                });
            await db.SaveChangesAsync();
        }

        if (!await db.SiteSettings.AnyAsync())
        {
            db.SiteSettings.AddRange(
                new SiteSetting { Key = "studio.name", Value = "Fix Frame" },
                new SiteSetting { Key = "studio.tagline", Value = "The story is made in the edit." },
                new SiteSetting { Key = "contact.email", Value = "hello@fixframe.local" },
                new SiteSetting { Key = "contact.phone", Value = "+91 90000 00000" },
                new SiteSetting { Key = "contact.whatsapp", Value = "919000000000" },
                new SiteSetting { Key = "contact.serviceArea", Value = "Chennai · available across India" },
                new SiteSetting { Key = "contact.responseTime", Value = "within 24 business hours" },
                new SiteSetting { Key = "social.instagram", Value = "@fixframe" });
            await db.SaveChangesAsync();
        }

        if (!await db.Testimonials.AnyAsync())
        {
            db.Testimonials.AddRange(
                new Testimonial
                {
                    Quote = "They cut a film we still watch on anniversaries. The edit found a story we did not know was there.",
                    PersonName = "Ananya & Vikram", PersonRole = "Wedding, 2025",
                    ApprovalStatus = ApprovalStatus.Approved, ApprovedAt = DateTimeOffset.UtcNow, IsFeatured = true, SortOrder = 10,
                },
                new Testimonial
                {
                    Quote = "Briefed on Monday, first cut on Thursday. The turnaround was the reason we came back for the campaign.",
                    PersonName = "Priya Raman", PersonRole = "Marketing Lead, Kestrel Coffee",
                    ApprovalStatus = ApprovalStatus.Approved, ApprovedAt = DateTimeOffset.UtcNow, IsFeatured = true, SortOrder = 20,
                },
                new Testimonial
                {
                    Quote = "Awaiting sign-off from the client before this goes public.",
                    PersonName = "Withheld", PersonRole = "Pending approval",
                    ApprovalStatus = ApprovalStatus.Pending, SortOrder = 30,
                });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedPortfolioAsync(AppDbContext db)
    {
        var weddings = await db.Categories.FirstAsync(c => c.Slug == "weddings");
        var commercial = await db.Categories.FirstAsync(c => c.Slug == "commercial");
        var events = await db.Categories.FirstAsync(c => c.Slug == "events");

        var specs = new[]
        {
            (Slug: "ananya-vikram", Title: "Ananya & Vikram", Cat: weddings, Year: 2025, Featured: true,
             Summary: "A two-day wedding in Pondicherry, cut as a single continuous story.",
             Narrative: "The brief was to avoid the montage. We shot documentary-style across two days and built the film around three conversations rather than three ceremonies.",
             Client: "Private", Loc: "Pondicherry", Speech: true),
            (Slug: "kestrel-coffee", Title: "Kestrel Coffee — Origin", Cat: commercial, Year: 2025, Featured: true,
             Summary: "A 90-second brand film shot across two estates in the Nilgiris.",
             Narrative: "Kestrel wanted the sourcing story without the usual aerial-and-acoustic-guitar formula. We shot handheld at working pace and let the sound design carry the altitude.",
             Client: "Kestrel Coffee", Loc: "Nilgiris", Speech: true),
            (Slug: "harbour-sessions", Title: "Harbour Sessions", Cat: events, Year: 2024, Featured: true,
             Summary: "Three nights of live music, cut into a single festival film.",
             Narrative: "Four cameras, no rehearsal, and a hard delivery deadline of 72 hours. The edit is where this one was won.",
             Client: "Harbour Arts", Loc: "Chennai", Speech: false),
            (Slug: "meera-arjun", Title: "Meera & Arjun", Cat: weddings, Year: 2024, Featured: false,
             Summary: "An intimate ceremony, forty guests, one camera.",
             Narrative: "A deliberately small crew. The couple asked for a film that felt like a memory rather than a broadcast.",
             Client: "Private", Loc: "Coonoor", Speech: true),
            (Slug: "northline-launch", Title: "Northline — Product Launch", Cat: commercial, Year: 2024, Featured: false,
             Summary: "Launch film and a cutdown set for paid social.",
             Narrative: "One shoot, eleven deliverables. The vertical cuts were storyboarded alongside the master rather than salvaged from it.",
             Client: "Northline", Loc: "Bengaluru", Speech: true),
            (Slug: "the-long-room", Title: "The Long Room", Cat: events, Year: 2023, Featured: false,
             Summary: "A restaurant opening, shot as a single unbroken evening.",
             Narrative: "No interviews, no voiceover. The room does the talking.",
             Client: "The Long Room", Loc: "Chennai", Speech: false),
        };

        foreach (var s in specs)
        {
            var cover = new MediaAsset
            {
                Kind = MediaKind.Video,
                Role = "PortfolioFilm",
                Status = MediaStatus.Ready,
                Visibility = MediaVisibility.Public,
                Title = s.Title,
                HasSpeech = s.Speech,
                DurationSeconds = 180,
                Width = 1920,
                Height = 1080,
                ProviderName = "local",
                ProviderAssetId = s.Slug,
                SourceStorageKey = $"sources/{s.Slug}.mp4",
            };
            db.MediaAssets.Add(cover);
            await db.SaveChangesAsync();

            db.MediaDerivatives.Add(new MediaDerivative
            {
                MediaAssetId = cover.Id,
                Kind = DerivativeKind.Poster,
                IsPrimary = true,
                Width = 1920,
                Height = 1080,
                PlaybackUrl = $"/media/posters/{s.Slug}.svg",
            });

            var project = new PortfolioProject
            {
                Slug = s.Slug,
                Title = s.Title,
                Summary = s.Summary,
                Narrative = s.Narrative,
                ClientDisplayName = s.Client,
                CategoryId = s.Cat.Id,
                Year = s.Year,
                Location = s.Loc,
                CoverMediaId = cover.Id,
                Status = PublishStatus.Published,
                PublishedAt = DateTimeOffset.UtcNow.AddDays(-specs.ToList().FindIndex(x => x.Slug == s.Slug) * 30),
                IsFeatured = s.Featured,
                FeaturedSortOrder = s.Featured ? specs.ToList().FindIndex(x => x.Slug == s.Slug) * 10 : null,
                SeoTitle = $"{s.Title} — Fix Frame",
                SeoDescription = s.Summary,
            };
            db.PortfolioProjects.Add(project);
            await db.SaveChangesAsync();

            db.ProjectBlocks.AddRange(
                new ProjectBlock
                {
                    PortfolioProjectId = project.Id, Type = BlockType.Text, SortOrder = 10,
                    Content = JsonSerializer.Serialize(new { heading = "The brief", body = s.Narrative }),
                },
                new ProjectBlock
                {
                    PortfolioProjectId = project.Id, Type = BlockType.Credits, SortOrder = 20,
                    Content = JsonSerializer.Serialize(new
                    {
                        director = "Fix Frame", cinematography = "Fix Frame",
                        editor = "Fix Frame", colour = "Fix Frame",
                    }),
                });

            db.MediaUsages.Add(new MediaUsage
            {
                MediaAssetId = cover.Id,
                EntityType = nameof(PortfolioProject),
                EntityId = project.Id,
                UsageRole = "cover",
            });

            // Every published project carries a cleared rights record (ADR-005).
            var rights = new RightsRecord
            {
                PortfolioProjectId = project.Id,
                ChecklistGeneratedAt = DateTimeOffset.UtcNow,
                LastEvaluatedAt = DateTimeOffset.UtcNow,
                IsClear = true,
            };
            db.RightsRecords.Add(rights);
            await db.SaveChangesAsync();

            db.Releases.AddRange(
                new Release
                {
                    RightsRecordId = rights.Id, Type = ReleaseType.ClientConsent,
                    Status = ReleaseStatus.Granted, GrantorName = s.Client,
                    GrantedAt = DateTimeOffset.UtcNow.AddMonths(-2),
                    EvidenceReference = "MSA clause 7.3 — portfolio use",
                    ScopeUse = ScopeUse.PortfolioAndSocial,
                },
                new Release
                {
                    RightsRecordId = rights.Id, Type = ReleaseType.MusicLicence,
                    Status = ReleaseStatus.Granted, SubjectName = "Licensed library track",
                    GrantorName = "Musicbed", GrantedAt = DateTimeOffset.UtcNow.AddMonths(-2),
                    // One expires soon so the R02 register has something to show.
                    ExpiresAt = s.Slug == "harbour-sessions"
                        ? DateTimeOffset.UtcNow.AddDays(21)
                        : DateTimeOffset.UtcNow.AddYears(3),
                    EvidenceReference = "Licence #ML-88213",
                    ScopeUse = ScopeUse.PortfolioAndSocial,
                });
            await db.SaveChangesAsync();

            if (s.Featured)
            {
                var reelMedia = new MediaAsset
                {
                    Kind = MediaKind.Video, Role = "Reel", Status = MediaStatus.Ready,
                    Visibility = MediaVisibility.Public, Title = $"{s.Title} — cutdown",
                    HasSpeech = false, DurationSeconds = 28, Width = 1080, Height = 1920,
                    ProviderName = "local", ProviderAssetId = $"{s.Slug}-reel",
                    SourceStorageKey = $"sources/{s.Slug}-reel.mp4",
                };
                db.MediaAssets.Add(reelMedia);
                await db.SaveChangesAsync();

                db.MediaDerivatives.Add(new MediaDerivative
                {
                    MediaAssetId = reelMedia.Id, Kind = DerivativeKind.Poster, IsPrimary = true,
                    Width = 1080, Height = 1920, PlaybackUrl = $"/media/posters/{s.Slug}-reel.svg",
                });
                db.Reels.Add(new Reel
                {
                    MediaId = reelMedia.Id, Title = $"{s.Title} — cutdown",
                    Caption = s.Summary, CategoryId = s.Cat.Id,
                    PortfolioProjectId = project.Id, Status = PublishStatus.Published,
                    IsFeatured = true, SortOrder = 10,
                });
                await db.SaveChangesAsync();
            }
        }
    }

    private static async Task SeedCrmAsync(AppDbContext db)
    {
        if (await db.Leads.AnyAsync()) return;

        var video = await db.Services.FirstAsync(s => s.Slug == "videography");
        var post = await db.Services.FirstAsync(s => s.Slug == "post-production");
        var owner = await db.Users.FirstAsync();

        var leads = new List<Lead>
        {
            new()
            {
                Reference = "FF-24001", ServiceId = video.Id, ProjectType = "Wedding",
                Name = "Divya Menon", Email = "divya@example.com", Phone = "+919812345678",
                Location = "Kochi", BudgetRange = "1L-2L", Status = LeadStatus.New,
                Brief = "Two-day wedding in December. We want a documentary-style film, not a montage. Around 200 guests.",
                ProjectDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(4)),
                PreferredContact = PreferredContact.WhatsApp,
            },
            new()
            {
                Reference = "FF-24002", ServiceId = post.Id, ProjectType = "Editing only",
                Name = "Rahul Iyer", Email = "rahul@northline.example", Phone = null,
                Location = "Bengaluru", BudgetRange = "50K-1L", Status = LeadStatus.Contacted,
                Brief = "We have 6 hours of footage from a product shoot and need a 60-second cut plus three vertical variants.",
                AssigneeId = owner.Id, PreferredContact = PreferredContact.Email,
            },
            new()
            {
                Reference = "FF-24003", ServiceId = video.Id, ProjectType = "Commercial",
                Name = "Sneha Kulkarni", Email = "sneha@kestrel.example", Phone = "+919900112233",
                Location = "Nilgiris", BudgetRange = "2L+", Status = LeadStatus.Qualified,
                Brief = "Follow-up campaign to the Origin film. Three estates, two days, delivery before the festival season.",
                AssigneeId = owner.Id, PreferredContact = PreferredContact.Call,
            },
            new()
            {
                Reference = "FF-24004", ServiceId = video.Id, ProjectType = "Event",
                Name = "Harbour Arts", Email = "programming@harbour.example", Phone = null,
                Location = "Chennai", BudgetRange = "PreferNotToSay", Status = LeadStatus.Won,
                Brief = "Festival coverage across three nights, same as last year.",
                AssigneeId = owner.Id, PreferredContact = PreferredContact.Email,
            },
            new()
            {
                Reference = "FF-24005", ServiceId = null, ProjectType = "Other",
                Name = "Anonymous enquiry", Email = null, Phone = "+919000009999",
                Location = null, Status = LeadStatus.Lost, LostReason = "Budget mismatch",
                Brief = "Asked about a one-hour shoot for a small event.",
                PreferredContact = PreferredContact.Call,
            },
        };
        db.Leads.AddRange(leads);
        await db.SaveChangesAsync();

        var won = leads.First(l => l.Status == LeadStatus.Won);
        var client = new Client { Name = "Harbour Arts", CompanyName = "Harbour Arts Trust" };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var project = new OperationalProject
        {
            ClientId = client.Id, Title = "Harbour Sessions 2026",
            ServiceId = video.Id, Stage = ProjectStage.Editing,
            OwnerId = owner.Id, Location = "Chennai",
            ShootDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-14)),
            Brief = won.Brief,
        };
        db.OperationalProjects.Add(project);
        await db.SaveChangesAsync();

        won.ConvertedProjectId = project.Id;
        won.ConvertedAt = DateTimeOffset.UtcNow.AddDays(-20);

        db.Milestones.AddRange(
            new Milestone { ProjectId = project.Id, Type = MilestoneType.BriefApproved, Title = "Brief approved", SortOrder = 10, CompletedAt = DateTimeOffset.UtcNow.AddDays(-25) },
            new Milestone { ProjectId = project.Id, Type = MilestoneType.Booking, Title = "Booking confirmed", SortOrder = 20, CompletedAt = DateTimeOffset.UtcNow.AddDays(-22) },
            new Milestone { ProjectId = project.Id, Type = MilestoneType.Shoot, Title = "Shoot complete", SortOrder = 30, CompletedAt = DateTimeOffset.UtcNow.AddDays(-14) },
            new Milestone { ProjectId = project.Id, Type = MilestoneType.FirstCut, Title = "First cut", SortOrder = 40, DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)) },
            new Milestone { ProjectId = project.Id, Type = MilestoneType.Review, Title = "Client review", SortOrder = 50 },
            new Milestone { ProjectId = project.Id, Type = MilestoneType.Final, Title = "Final delivery", SortOrder = 60 });

        db.Tasks.AddRange(
            new TaskItem { Title = "Sync multicam from night 2", ProjectId = project.Id, AssigneeId = owner.Id, Status = Domain.TaskStatus.Done, CompletedAt = DateTimeOffset.UtcNow.AddDays(-6), Priority = TaskPriority.Normal },
            new TaskItem { Title = "First cut for client review", ProjectId = project.Id, AssigneeId = owner.Id, DueAt = DateTimeOffset.UtcNow.AddDays(3), Priority = TaskPriority.High },
            new TaskItem { Title = "Call Divya about December dates", LeadId = leads[0].Id, AssigneeId = owner.Id, DueAt = DateTimeOffset.UtcNow.AddDays(-1), Priority = TaskPriority.High });

        db.Notes.Add(new Note
        {
            Body = "Client confirmed they want the same three-night structure as last year. Budget signed off verbally.",
            AuthorId = owner.Id, ProjectId = project.Id,
        });

        await db.SaveChangesAsync();
    }
}
