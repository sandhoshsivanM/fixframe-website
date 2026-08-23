using System.Text.Json;
using FixFrame.Api.Data;
using FixFrame.Api.Domain;
using FixFrame.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FixFrame.Api.Endpoints;

public static class AuthEndpoints
{
    public record LoginRequest(string Email, string Password);

    public static void MapAuthEndpoints(this RouteGroupBuilder g)
    {
        var a = g.MapGroup("/auth");

        a.MapPost("/login", async (
            AppDbContext db, SessionService sessions, HttpContext ctx, LoginRequest req) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

            // RULE-N3-1: unknown account and wrong password are indistinguishable,
            // by body, status and timing.
            if (user is null)
            {
                PasswordHasher.DummyVerify(req.Password);
                return Unauthenticated(ctx);
            }
            if (user.LockedUntil is { } until && until > DateTimeOffset.UtcNow)
                return Results.Json(new
                {
                    error = new { code = "rate_limited", message = $"Too many attempts. Try again after {until:HH:mm} UTC.", traceId = ctx.TraceIdentifier },
                }, statusCode: 429);

            if (!PasswordHasher.Verify(req.Password, user.PasswordHash))
            {
                user.FailedLoginCount++;
                if (user.FailedLoginCount >= 5)
                    user.LockedUntil = DateTimeOffset.UtcNow.AddMinutes(15);
                await db.SaveChangesAsync();
                return Unauthenticated(ctx);
            }

            if (user.Status != UserStatus.Active) return Unauthenticated(ctx);

            var token = await sessions.IssueAsync(
                user,
                ctx.Request.Headers.UserAgent.ToString().NullIfEmpty(),
                ctx.Connection.RemoteIpAddress?.ToString());

            ctx.Response.Cookies.Append(SessionService.CookieName, token, new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = false, // localhost is http; production sets this true
                Expires = DateTimeOffset.UtcNow.AddHours(12),
                Path = "/",
            });

            db.ActivityLogs.Add(new ActivityLog
            {
                ActorUserId = user.Id, Action = "auth.login",
                EntityType = nameof(User), EntityId = user.Id,
            });
            await db.SaveChangesAsync();

            return Results.Ok(new { token, user = new { user.Id, user.Email, user.DisplayName } });
        });

        a.MapPost("/logout", async (SessionService sessions, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (me.Token is not null) await sessions.RevokeAsync(me.Token);
            ctx.Response.Cookies.Delete(SessionService.CookieName);
            return Results.Ok(new { ok = true });
        });

        a.MapGet("/me", (CurrentUserAccessor me, HttpContext ctx) =>
            me.User is null
                ? Unauthenticated(ctx)
                : Results.Ok(new
                {
                    me.User.Id, me.User.Email, me.User.DisplayName,
                    permissions = me.User.Permissions.OrderBy(x => x),
                }));
    }

    internal static IResult Unauthenticated(HttpContext ctx) => Results.Json(new
    {
        error = new { code = "unauthenticated", message = "Email or password is incorrect.", traceId = ctx.TraceIdentifier },
    }, statusCode: 401);

    internal static IResult Forbidden(HttpContext ctx, string permission) => Results.Json(new
    {
        error = new { code = "forbidden", message = $"You need {permission} to do that.", traceId = ctx.TraceIdentifier },
    }, statusCode: 403);
}

public static class AdminEndpoints
{
    /// Server-side permission check on every admin route, without exception (V1 J1).
    private static IResult? Guard(CurrentUserAccessor me, HttpContext ctx, string permission)
    {
        if (me.User is null) return AuthEndpoints.Unauthenticated(ctx);
        if (!me.User.Can(permission)) return AuthEndpoints.Forbidden(ctx, permission);
        return null;
    }

    public static void MapAdminEndpoints(this RouteGroupBuilder g)
    {
        var a = g.MapGroup("/admin");

        a.MapGet("/dashboard/kpis", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "leads-read") is { } deny) return deny;

            var now = DateTimeOffset.UtcNow;
            var expiringSoon = await db.Releases.CountAsync(r =>
                r.Status == ReleaseStatus.Granted &&
                r.ExpiresAt != null && r.ExpiresAt < now.AddDays(30));

            return Results.Ok(new
            {
                newLeads = await db.Leads.CountAsync(l => l.Status == LeadStatus.New),
                qualified = await db.Leads.CountAsync(l => l.Status == LeadStatus.Qualified),
                activeProjects = await db.OperationalProjects.CountAsync(p =>
                    p.Stage != ProjectStage.Completed && p.Stage != ProjectStage.OnHold),
                openTasks = await db.Tasks.CountAsync(t =>
                    t.Status == Domain.TaskStatus.Open || t.Status == Domain.TaskStatus.InProgress),
                overdueTasks = await db.Tasks.CountAsync(t =>
                    t.DueAt != null && t.DueAt < now &&
                    t.Status != Domain.TaskStatus.Done && t.Status != Domain.TaskStatus.Cancelled),
                publishedProjects = await db.PortfolioProjects.CountAsync(p => p.Status == PublishStatus.Published),
                rightsExpiringSoon = expiringSoon,
                leadsByStatus = await db.Leads
                    .GroupBy(l => l.Status)
                    .Select(x => new { status = x.Key.ToString(), count = x.Count() })
                    .ToListAsync(),
            });
        });

        a.MapGet("/leads", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx, string? status, string? q) =>
        {
            if (Guard(me, ctx, "leads-read") is { } deny) return deny;
            var canSeeMoney = me.User!.Can("leads-read-financial");

            var query = db.Leads.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LeadStatus>(status, true, out var s))
                query = query.Where(l => l.Status == s);
            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(l => l.Name.Contains(q) || l.Brief.Contains(q) || l.Reference.Contains(q));

            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.Id, l.Reference, l.Name, l.Email, l.Phone, l.ProjectType, l.Location,
                    status = l.Status.ToString(),
                    service = l.Service!.Name,
                    // RULE: budget requires leads-read-financial.
                    budgetRange = canSeeMoney ? l.BudgetRange : null,
                    assignee = l.Assignee!.DisplayName,
                    l.CreatedAt,
                    isDuplicate = l.DuplicateOfLeadId != null,
                })
                .ToListAsync();

            return Results.Ok(new { items, canSeeFinancial = canSeeMoney });
        });

        a.MapGet("/leads/{id:guid}", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx, Guid id) =>
        {
            if (Guard(me, ctx, "leads-read") is { } deny) return deny;
            var canSeeMoney = me.User!.Can("leads-read-financial");

            var lead = await db.Leads
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    l.Id, l.Reference, l.Name, l.Email, l.Phone, l.ProjectType,
                    l.Location, l.Brief, l.ProjectDate, l.CreatedAt,
                    status = l.Status.ToString(),
                    preferredContact = l.PreferredContact.ToString(),
                    source = l.Source.ToString(),
                    service = l.Service!.Name,
                    budgetRange = canSeeMoney ? l.BudgetRange : null,
                    assignee = l.Assignee!.DisplayName,
                    isDuplicate = l.DuplicateOfLeadId != null,
                    convertedProjectId = l.ConvertedProjectId,
                })
                .FirstOrDefaultAsync();

            if (lead is null) return Results.NotFound();

            var notes = await db.Notes
                .Where(n => n.LeadId == id)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new { n.Id, n.Body, author = n.Author.DisplayName, n.CreatedAt })
                .ToListAsync();

            var history = await db.ActivityLogs
                .Where(x => x.EntityType == nameof(Lead) && x.EntityId == id)
                .OrderByDescending(x => x.OccurredAt)
                .Select(x => new { x.Action, x.OccurredAt, x.Metadata })
                .ToListAsync();

            return Results.Ok(new { lead, notes, history });
        });

        a.MapPatch("/leads/{id:guid}/status", async (
            AppDbContext db, CurrentUserAccessor me, HttpContext ctx, Guid id, StatusChange body) =>
        {
            if (Guard(me, ctx, "leads-write") is { } deny) return deny;

            var lead = await db.Leads.FindAsync(id);
            if (lead is null) return Results.NotFound();
            if (!Enum.TryParse<LeadStatus>(body.Status, true, out var next))
                return Results.Json(new { error = new { code = "validation_failed", message = "Unknown status.", traceId = ctx.TraceIdentifier } }, statusCode: 422);

            var previous = lead.Status;
            lead.Status = next;
            db.ActivityLogs.Add(new ActivityLog
            {
                ActorUserId = me.User!.Id, Action = "lead.status_changed",
                EntityType = nameof(Lead), EntityId = id,
                Metadata = JsonSerializer.Serialize(new { from = previous.ToString(), to = next.ToString() }),
            });
            await db.SaveChangesAsync();
            return Results.Ok(new { status = next.ToString() });
        });

        a.MapPost("/leads/{id:guid}/notes", async (
            AppDbContext db, CurrentUserAccessor me, HttpContext ctx, Guid id, NoteBody body) =>
        {
            if (Guard(me, ctx, "leads-write") is { } deny) return deny;
            if (string.IsNullOrWhiteSpace(body.Body))
                return Results.Json(new { error = new { code = "validation_failed", message = "Note cannot be empty.", traceId = ctx.TraceIdentifier } }, statusCode: 422);

            var note = new Note { Body = body.Body.Trim(), AuthorId = me.User!.Id, LeadId = id };
            db.Notes.Add(note);
            db.ActivityLogs.Add(new ActivityLog
            {
                ActorUserId = me.User.Id, Action = "lead.note_added",
                EntityType = nameof(Lead), EntityId = id,
            });
            await db.SaveChangesAsync();
            return Results.Ok(new { note.Id, note.Body, note.CreatedAt });
        });

        a.MapGet("/projects", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "projects-read") is { } deny) return deny;
            return Results.Ok(await db.OperationalProjects
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id, p.Title, stage = p.Stage.ToString(),
                    client = p.Client.Name, p.ShootDate, p.Location,
                    milestonesDone = p.Milestones.Count(m => m.CompletedAt != null),
                    milestonesTotal = p.Milestones.Count,
                    openTasks = db.Tasks.Count(t => t.ProjectId == p.Id && t.Status == Domain.TaskStatus.Open),
                })
                .ToListAsync());
        });

        a.MapGet("/portfolio", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "portfolio-read") is { } deny) return deny;
            return Results.Ok(await db.PortfolioProjects
                .OrderByDescending(p => p.PublishedAt)
                .Select(p => new
                {
                    p.Id, p.Slug, p.Title, p.Year, p.IsFeatured,
                    status = p.Status.ToString(),
                    category = p.Category!.Name,
                    rightsClear = p.RightsRecord!.IsClear,
                    outstanding = p.RightsRecord!.Releases
                        .Count(r => r.Status != ReleaseStatus.Granted && r.Status != ReleaseStatus.NotRequired),
                })
                .ToListAsync());
        });

        a.MapGet("/rights", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "rights-read") is { } deny) return deny;
            var now = DateTimeOffset.UtcNow;
            return Results.Ok(await db.Releases
                .OrderBy(r => r.ExpiresAt ?? DateTimeOffset.MaxValue)
                .Select(r => new
                {
                    r.Id,
                    project = r.RightsRecord.PortfolioProject.Title,
                    projectSlug = r.RightsRecord.PortfolioProject.Slug,
                    type = r.Type.ToString(),
                    status = r.Status.ToString(),
                    scope = r.ScopeUse.ToString(),
                    r.GrantorName, r.SubjectName, r.GrantedAt, r.ExpiresAt, r.EvidenceReference,
                    expiringSoon = r.ExpiresAt != null && r.ExpiresAt < now.AddDays(30),
                })
                .ToListAsync());
        });

        a.MapGet("/notifications", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "leads-read") is { } deny) return deny;
            return Results.Ok(await db.NotificationRecords
                .OrderByDescending(n => n.CreatedAt).Take(50)
                .Select(n => new
                {
                    n.Id, n.NotificationId, n.Recipient, n.Subject,
                    status = n.Status.ToString(), n.CreatedAt,
                })
                .ToListAsync());
        });

        a.MapGet("/audit", async (AppDbContext db, CurrentUserAccessor me, HttpContext ctx) =>
        {
            if (Guard(me, ctx, "audit-read") is { } deny) return deny;
            return Results.Ok(await db.ActivityLogs
                .OrderByDescending(x => x.OccurredAt).Take(100)
                .Select(x => new { x.Id, x.Action, x.EntityType, x.EntityId, x.OccurredAt, x.Metadata })
                .ToListAsync());
        });
    }

    public record StatusChange(string Status);
    public record NoteBody(string Body);
}
