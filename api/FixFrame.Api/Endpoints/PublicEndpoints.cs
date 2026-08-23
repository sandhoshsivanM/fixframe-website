using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FixFrame.Api.Data;
using FixFrame.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace FixFrame.Api.Endpoints;

/// Public API. Every response is built from an explicit DTO projection —
/// never from an entity — so storage keys, internal notes and budget
/// discussion cannot leak (V1 A3, RULE-O6-9).
public static class PublicEndpoints
{
    public static void MapPublicEndpoints(this RouteGroupBuilder g)
    {
        var p = g.MapGroup("/public");

        p.MapGet("/settings", async (AppDbContext db) =>
        {
            var settings = await db.SiteSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
            var hasReels = await db.Reels.AnyAsync(r => r.Status == PublishStatus.Published);
            var hasPackages = await db.Packages.AnyAsync(x => x.IsActive && x.ArchivedAt == null);
            return Results.Ok(new
            {
                settings,
                // RULE-F11-2 / RULE-C10-2: routes hide entirely when empty.
                nav = new { reels = hasReels, packages = hasPackages },
            });
        });

        p.MapGet("/projects", async (AppDbContext db, string? category, int? limit) =>
        {
            var q = db.PortfolioProjects
                .Where(x => x.Status == PublishStatus.Published);

            if (!string.IsNullOrWhiteSpace(category))
                q = q.Where(x => x.Category!.Slug == category);

            var items = await q
                .OrderByDescending(x => x.IsFeatured)
                .ThenBy(x => x.FeaturedSortOrder)
                .ThenByDescending(x => x.PublishedAt)
                .Take(limit ?? 50)
                .Select(x => new
                {
                    x.Slug,
                    x.Title,
                    x.Summary,
                    x.Year,
                    x.Location,
                    x.IsFeatured,
                    x.ClientDisplayName,
                    category = x.Category!.Name,
                    categorySlug = x.Category!.Slug,
                    poster = x.CoverMedia!.Derivatives
                        .Where(d => d.Kind == DerivativeKind.Poster && d.IsPrimary)
                        .Select(d => d.PlaybackUrl).FirstOrDefault(),
                })
                .ToListAsync();

            var categories = await db.Categories
                .Where(c => c.Scope == "Work" && c.ArchivedAt == null)
                .OrderBy(c => c.SortOrder)
                .Select(c => new { c.Name, c.Slug })
                .ToListAsync();

            return Results.Ok(new { items, categories });
        });

        p.MapGet("/projects/{slug}", async (AppDbContext db, string slug) =>
        {
            var project = await db.PortfolioProjects
                .Where(x => x.Slug == slug && x.Status == PublishStatus.Published)
                .Select(x => new
                {
                    x.Slug, x.Title, x.Summary, x.Narrative, x.Year, x.Location,
                    x.ClientDisplayName, x.SeoTitle, x.SeoDescription,
                    category = x.Category!.Name,
                    poster = x.CoverMedia!.Derivatives
                        .Where(d => d.Kind == DerivativeKind.Poster && d.IsPrimary)
                        .Select(d => d.PlaybackUrl).FirstOrDefault(),
                    hasCaptions = x.CoverMedia!.HasSpeech == false
                        || x.CoverMedia!.Derivatives.Any(d => d.Kind == DerivativeKind.Captions),
                    blocks = x.Blocks.OrderBy(bl => bl.SortOrder)
                        .Select(bl => new { type = bl.Type.ToString(), bl.Content }),
                })
                .FirstOrDefaultAsync();

            if (project is null) return Results.NotFound();

            // Editorial next-project navigation (V1 C03).
            var next = await db.PortfolioProjects
                .Where(x => x.Status == PublishStatus.Published && x.Slug != slug)
                .OrderByDescending(x => x.PublishedAt)
                .Select(x => new { x.Slug, x.Title })
                .FirstOrDefaultAsync();

            return Results.Ok(new { project, next });
        });

        p.MapGet("/services", async (AppDbContext db) => Results.Ok(await db.Services
            .Where(x => x.IsActive && x.ArchivedAt == null)
            .OrderBy(x => x.SortOrder)
            .Select(x => new { x.Name, x.Slug, x.Description, x.Deliverables })
            .ToListAsync()));

        p.MapGet("/packages", async (AppDbContext db) => Results.Ok(await db.Packages
            .Where(x => x.IsActive && x.ArchivedAt == null)
            .OrderBy(x => x.SortOrder)
            .Select(x => new
            {
                id = x.Id, x.Name, x.DisplayPrice, x.Inclusions, x.Disclaimer,
                service = x.Service!.Name,
            })
            .ToListAsync()));

        p.MapGet("/reels", async (AppDbContext db) => Results.Ok(await db.Reels
            .Where(x => x.Status == PublishStatus.Published && x.ArchivedAt == null)
            .OrderByDescending(x => x.IsFeatured).ThenBy(x => x.SortOrder)
            .Select(x => new
            {
                id = x.Id, x.Title, x.Caption, x.ExternalUrl,
                poster = x.Media.Derivatives
                    .Where(d => d.Kind == DerivativeKind.Poster && d.IsPrimary)
                    .Select(d => d.PlaybackUrl).FirstOrDefault(),
                duration = x.Media.DurationSeconds,
                // RULE-C10-10: omit the link entirely if the project is not published.
                project = db.PortfolioProjects
                    .Where(pp => pp.Id == x.PortfolioProjectId && pp.Status == PublishStatus.Published)
                    .Select(pp => new { pp.Slug, pp.Title }).FirstOrDefault(),
            })
            .ToListAsync()));

        p.MapGet("/testimonials", async (AppDbContext db) => Results.Ok(await db.Testimonials
            // RULE-F12-1: approved only.
            .Where(x => x.ApprovalStatus == ApprovalStatus.Approved && x.ArchivedAt == null)
            .OrderBy(x => x.SortOrder)
            .Select(x => new { x.Quote, x.PersonName, x.PersonRole })
            .ToListAsync()));

        p.MapGet("/pages/{slug}", async (AppDbContext db, string slug) =>
        {
            var page = await db.SitePages
                .Where(x => x.Slug == slug && x.Status == PublishStatus.Published)
                .Select(x => new { x.Slug, x.Title, x.Body, x.SeoTitle, x.SeoDescription, x.UpdatedAt })
                .FirstOrDefaultAsync();
            return page is null ? Results.NotFound() : Results.Ok(page);
        });

        p.MapPost("/leads", CreateLead);
    }

    public record LeadRequest(
        Guid? ServiceId, string? ProjectType, DateOnly? ProjectDate, string? Location,
        string? BudgetRange, string Brief, string Name, string? Email, string? Phone,
        string? PreferredContact, Guid? PackageId, string? SourceProjectSlug, string? SourcePageUrl);

    /// V1 A3, first rule: the lead is persisted before anything is notified.
    /// ADR-003: idempotent, so a double submit yields one lead.
    private static async Task<IResult> CreateLead(
        AppDbContext db, HttpContext ctx, LeadRequest req)
    {
        var errors = new List<object>();
        if (string.IsNullOrWhiteSpace(req.Name))
            errors.Add(new { field = "name", code = "required", message = "Tell us your name." });
        if (string.IsNullOrWhiteSpace(req.Email) && string.IsNullOrWhiteSpace(req.Phone))
            errors.Add(new { field = "email", code = "required", message = "Give us an email or a phone number so we can reply." });
        if (string.IsNullOrWhiteSpace(req.Brief) || req.Brief.Trim().Length < 20)
            errors.Add(new { field = "brief", code = "too_short", message = "A sentence or two about the project, please." });

        if (errors.Count > 0)
            return Results.Json(new
            {
                error = new
                {
                    code = "validation_failed",
                    message = "Some answers need attention.",
                    details = errors,
                    traceId = ctx.TraceIdentifier,
                },
            }, statusCode: 422);

        var idempotencyKey = ctx.Request.Headers["Idempotency-Key"].ToString().NullIfEmpty();
        var principal = ctx.Connection.RemoteIpAddress?.ToString() ?? "anonymous";
        const string endpoint = "POST /public/leads";

        var payloadHash = Convert.ToHexString(SHA256.HashData(
            Encoding.UTF8.GetBytes(JsonSerializer.Serialize(req))));

        if (idempotencyKey is not null)
        {
            var existing = await db.IdempotencyRecords.FirstOrDefaultAsync(x =>
                x.Endpoint == endpoint && x.Principal == principal && x.Key == idempotencyKey);

            if (existing is not null)
            {
                if (existing.RequestHash != payloadHash)
                    return Results.Json(new
                    {
                        error = new { code = "idempotency_key_reuse", message = "That key was used for a different submission.", traceId = ctx.TraceIdentifier },
                    }, statusCode: 409);

                return Results.Content(existing.ResponseBody, "application/json", statusCode: existing.ResponseStatus);
            }
        }

        Guid? sourceProjectId = null;
        if (!string.IsNullOrWhiteSpace(req.SourceProjectSlug))
            sourceProjectId = await db.PortfolioProjects
                .Where(x => x.Slug == req.SourceProjectSlug)
                .Select(x => (Guid?)x.Id).FirstOrDefaultAsync();

        var reference = $"FF-{DateTime.UtcNow:yyMM}{Random.Shared.Next(1000, 9999)}";

        // C08: duplicate detection flags, never discards.
        Guid? duplicateOf = null;
        if (!string.IsNullOrWhiteSpace(req.Email))
        {
            var cutoff = DateTimeOffset.UtcNow.AddHours(-24);
            duplicateOf = await db.Leads
                .Where(l => l.Email == req.Email && l.CreatedAt > cutoff)
                .Select(l => (Guid?)l.Id).FirstOrDefaultAsync();
        }

        var lead = new Lead
        {
            Reference = reference,
            ServiceId = req.ServiceId,
            ProjectType = req.ProjectType ?? "Unspecified",
            ProjectDate = req.ProjectDate,
            Location = req.Location,
            BudgetRange = req.BudgetRange,
            Brief = req.Brief.Trim(),
            Name = req.Name.Trim(),
            Email = req.Email?.Trim().NullIfEmpty(),
            Phone = req.Phone?.Trim().NullIfEmpty(),
            PreferredContact = Enum.TryParse<PreferredContact>(req.PreferredContact, true, out var pc)
                ? pc : PreferredContact.Email,
            Source = LeadSource.Website,
            SourcePageUrl = req.SourcePageUrl,
            SourceProjectId = sourceProjectId,
            PackageId = req.PackageId,
            DuplicateOfLeadId = duplicateOf,
        };

        await using var tx = await db.Database.BeginTransactionAsync();

        db.Leads.Add(lead);
        db.ActivityLogs.Add(new ActivityLog
        {
            Action = "lead.created",
            EntityType = nameof(Lead),
            EntityId = lead.Id,
            Metadata = JsonSerializer.Serialize(new { reference, source = "Website" }),
            IpAddress = principal,
        });

        var response = JsonSerializer.Serialize(new
        {
            reference,
            leadId = lead.Id,
            duplicateFlagged = duplicateOf is not null,
        });

        if (idempotencyKey is not null)
            db.IdempotencyRecords.Add(new IdempotencyRecord
            {
                Key = idempotencyKey,
                Endpoint = endpoint,
                Principal = principal,
                RequestHash = payloadHash,
                ResponseBody = response,
                ResponseStatus = 201,
            });

        await db.SaveChangesAsync();

        // Queued AFTER the business write commits — RULE-O4-1. A mail failure
        // can never cost us the enquiry.
        db.NotificationRecords.AddRange(
            new NotificationRecord
            {
                NotificationId = "NTF-001", Recipient = "owner@fixframe.local",
                Subject = $"New enquiry {reference} — {lead.Name}",
                Body = $"{lead.Name} ({lead.Email ?? lead.Phone}) enquired about {lead.ProjectType}.",
                RelatedEntityType = nameof(Lead), RelatedEntityId = lead.Id,
            },
            new NotificationRecord
            {
                NotificationId = "NTF-002", Recipient = lead.Email ?? "no-email",
                Subject = $"We have your enquiry — {reference}",
                Body = "Thanks for getting in touch. We reply within 24 business hours.",
                RelatedEntityType = nameof(Lead), RelatedEntityId = lead.Id,
                Status = lead.Email is null ? NotificationStatus.Suppressed : NotificationStatus.Queued,
            });
        await db.SaveChangesAsync();

        await tx.CommitAsync();

        return Results.Content(response, "application/json", statusCode: 201);
    }
}
