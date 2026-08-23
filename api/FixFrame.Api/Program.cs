using FixFrame.Api.Data;
using FixFrame.Api.Endpoints;
using FixFrame.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=55432;Database=fixframe;Username=fixframe;Password=fixframe_dev";

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<CurrentUserAccessor>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

app.UseCors();
app.UseExceptionHandler();

// Resolve the session once per request, so permissions are never cached
// into a token — AC-N08-2 requires revocation to take effect immediately.
app.Use(async (ctx, next) =>
{
    var sessions = ctx.RequestServices.GetRequiredService<SessionService>();
    var accessor = ctx.RequestServices.GetRequiredService<CurrentUserAccessor>();
    var token = ctx.Request.Cookies[SessionService.CookieName]
        ?? ctx.Request.Headers.Authorization.ToString().Replace("Bearer ", "").NullIfEmpty();
    accessor.User = await sessions.ResolveAsync(token);
    accessor.Token = token;
    await next();
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("Applying migrations…");
    await db.Database.MigrateAsync();
    await Seed.RunAsync(db, logger);
}

app.MapGet("/health", async (AppDbContext db) =>
    Results.Ok(new
    {
        status = "ok",
        database = await db.Database.CanConnectAsync() ? "up" : "down",
        time = DateTimeOffset.UtcNow,
    }));

var v1 = app.MapGroup("/api/v1");
v1.MapPublicEndpoints();
v1.MapAuthEndpoints();
v1.MapAdminEndpoints();

app.Run();

public static class StringExtensions
{
    public static string? NullIfEmpty(this string? s) => string.IsNullOrWhiteSpace(s) ? null : s;
}

/// Per-request holder for the resolved user. Scoped, populated by middleware.
public class CurrentUserAccessor
{
    public CurrentUser? User { get; set; }
    public string? Token { get; set; }
}
