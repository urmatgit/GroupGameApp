using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Application.Contracts;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AuthController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), ct);
        if (existing)
            return Conflict(new ProblemDetails { Title = "Conflict", Detail = "Пользователь с таким email уже существует", Status = 409 });

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            CityId = request.CityId,
            Status = UserAccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // Assign default User role
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == Domain.Enums.UserRole.User, ct);
        if (role != null)
        {
            _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        }

        var session = new UserSession
        {
            UserId = user.Id,
            RefreshTokenHash = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };
        _context.UserSessions.Add(session);

        await _context.SaveChangesAsync(ct);

        var userDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.AvatarUrl, user.Phone,
            user.CityId, null, new() { "User" }, user.Status.ToString(), user.CreatedAt,
            new UserStatsDto(0, 0, 0, 0, 5.0, 0)
        );

        return StatusCode(201, new AuthResponseDto(session.RefreshTokenHash, session.RefreshTokenHash, userDto));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.City)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), ct);

        if (user == null)
            return Unauthorized(new ProblemDetails { Title = "Unauthorized", Detail = "Неверный email или пароль", Status = 401 });

        if (user.Status == UserAccountStatus.Blocked || user.Status == UserAccountStatus.Suspended)
            return StatusCode(403, new ProblemDetails { Title = "Forbidden", Detail = "Ваш аккаунт заблокирован", Status = 403 });

        var session = new UserSession
        {
            UserId = user.Id,
            RefreshTokenHash = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };
        _context.UserSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        var roles = user.UserRoles.Select(r => r.Role.Name.ToString()).ToList();
        var userDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.AvatarUrl, user.Phone,
            user.CityId, user.City?.Name, roles, user.Status.ToString(), user.CreatedAt,
            new UserStatsDto(0, 0, 0, 0, 5.0, 0)
        );

        return Ok(new AuthResponseDto(session.RefreshTokenHash, session.RefreshTokenHash, userDto));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] string refreshToken, CancellationToken ct)
    {
        var session = await _context.UserSessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == refreshToken, ct);

        if (session == null || !session.IsActive)
            return Unauthorized(new ProblemDetails { Title = "Unauthorized", Detail = "Недействительный Refresh Token", Status = 401 });

        // Refresh token rotation (Section 23)
        session.RevokedAt = DateTime.UtcNow;
        var newSession = new UserSession
        {
            UserId = session.UserId,
            RefreshTokenHash = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };
        _context.UserSessions.Add(newSession);
        await _context.SaveChangesAsync(ct);

        var user = session.User;
        var userDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.AvatarUrl, user.Phone,
            user.CityId, null, new() { "User" }, user.Status.ToString(), user.CreatedAt,
            new UserStatsDto(0, 0, 0, 0, 5.0, 0)
        );

        return Ok(new AuthResponseDto(newSession.RefreshTokenHash, newSession.RefreshTokenHash, userDto));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId))
        {
            var activeSessions = await _context.UserSessions
                .Where(s => s.UserId == userId && s.RevokedAt == null)
                .ToListAsync(ct);

            foreach (var session in activeSessions)
            {
                session.RevokedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAll(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var sessions = await _context.UserSessions
            .Where(s => s.UserId == userId && s.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var s in sessions)
        {
            s.RevokedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] string email, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), ct);
        if (user != null)
        {
            // Trigger password reset token workflow (extensible email/OTP)
            _context.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Type = "PASSWORD_RESET",
                Title = "Восстановление пароля",
                Message = "Запрос на восстановление пароля принят."
            });
            await _context.SaveChangesAsync(ct);
        }

        return Ok(new { message = "Инструкции по восстановлению отправлены на указанный адрес" });
    }
}
