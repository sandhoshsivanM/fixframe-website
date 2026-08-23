using System.Security.Cryptography;
using System.Text;
using FixFrame.Api.Data;
using FixFrame.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace FixFrame.Api.Services;

/// PBKDF2-SHA256. Part N specifies Argon2id for production; PBKDF2 keeps the
/// local stack dependency-free. Swapping it touches this class only.
public static class PasswordHasher
{
    private const int Iterations = 210_000;
    private const int SaltSize = 16;
    private const int KeySize = 32;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        return $"pbkdf2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }

    public static bool Verify(string password, string? stored)
    {
        if (string.IsNullOrEmpty(stored)) return false;
        var parts = stored.Split('$');
        if (parts.Length != 4 || parts[0] != "pbkdf2") return false;
        var iterations = int.Parse(parts[1]);
        var salt = Convert.FromBase64String(parts[2]);
        var expected = Convert.FromBase64String(parts[3]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    /// RULE-N3-1: unknown accounts must cost the same as wrong passwords,
    /// so timing cannot distinguish them.
    public static void DummyVerify(string password) =>
        Rfc2898DeriveBytes.Pbkdf2(password, new byte[SaltSize], Iterations, HashAlgorithmName.SHA256, KeySize);
}

public record CurrentUser(Guid Id, string Email, string DisplayName, HashSet<string> Permissions)
{
    public bool Can(string permission) => Permissions.Contains(permission);
}

public class SessionService(AppDbContext db)
{
    public const string CookieName = "ff_session";
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(12);

    public static string NewToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
        .Replace("+", "-").Replace("/", "_").TrimEnd('=');

    public static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public async Task<string> IssueAsync(User user, string? ua, string? ip)
    {
        var token = NewToken();
        db.Sessions.Add(new Session
        {
            UserId = user.Id,
            TokenHash = HashToken(token),
            ExpiresAt = DateTimeOffset.UtcNow.Add(Lifetime),
            UserAgent = ua,
            IpAddress = ip,
            MfaSatisfied = true,
        });
        user.LastLoginAt = DateTimeOffset.UtcNow;
        user.FailedLoginCount = 0;
        await db.SaveChangesAsync();
        return token;
    }

    /// Permissions resolve per request, never from the token — AC-N08-2
    /// requires a revoked permission to take effect without re-login.
    public async Task<CurrentUser?> ResolveAsync(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;
        var hash = HashToken(token);
        var session = await db.Sessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.TokenHash == hash);

        if (session is null || session.RevokedAt is not null || session.ExpiresAt < DateTimeOffset.UtcNow)
            return null;
        if (session.User.Status != UserStatus.Active) return null;

        var permissions = await db.UserRoles
            .Where(ur => ur.UserId == session.UserId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Module + "-" + rp.Permission.Action)
            .Distinct()
            .ToListAsync();

        return new CurrentUser(session.User.Id, session.User.Email, session.User.DisplayName, [.. permissions]);
    }

    public async Task RevokeAsync(string token)
    {
        var hash = HashToken(token);
        var session = await db.Sessions.FirstOrDefaultAsync(s => s.TokenHash == hash);
        if (session is not null)
        {
            session.RevokedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();
        }
    }
}
