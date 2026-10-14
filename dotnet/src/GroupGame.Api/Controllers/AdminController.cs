using System;
using System.Collections.Generic;
using System.Linq;
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
[Route("api/admin")]
[Authorize(Roles = "Administrator,Moderator")]
public class AdminController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers(CancellationToken ct)
    {
        var users = await _context.Users
            .Include(u => u.City)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(ct);

        return Ok(users);
    }

    [HttpGet("games")]
    public async Task<ActionResult<IEnumerable<Game>>> GetGames(CancellationToken ct)
    {
        var games = await _context.Games
            .Include(g => g.Organizer)
            .Include(g => g.Sport)
            .Include(g => g.Venue)
            .OrderByDescending(g => g.StartDateTime)
            .ToListAsync(ct);

        return Ok(games);
    }

    [HttpGet("audit")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs(CancellationToken ct)
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(100)
            .ToListAsync(ct);

        return Ok(logs);
    }

    [HttpPost("users/{id:guid}/block")]
    public async Task<IActionResult> BlockUser(Guid id, [FromBody] string? reason, CancellationToken ct)
    {
        var user = await _context.Users.FindAsync(new object[] { id }, ct);
        if (user == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Пользователь не найден", Status = 404 });

        user.Status = UserAccountStatus.Blocked;
        user.UpdatedAt = DateTime.UtcNow;

        var adminIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = Guid.TryParse(adminIdStr, out var adminId) ? adminId : null,
            UserName = User.Identity?.Name ?? "Administrator",
            Action = "BLOCK_USER",
            EntityName = "User",
            EntityId = id.ToString(),
            DetailsJson = reason ?? "Блокировка аккаунта администратором"
        });

        await _context.SaveChangesAsync(ct);
        return Ok(new { success = true, status = user.Status.ToString() });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats(CancellationToken ct)
    {
        var totalGames = await _context.Games.CountAsync(ct);
        var activeGames = await _context.Games.CountAsync(g => g.Status == GameStatus.Open || g.Status == GameStatus.Full, ct);
        var totalUsers = await _context.Users.CountAsync(ct);
        var totalAttendance = await _context.GameAttendances.CountAsync(ct);
        var attendedCount = await _context.GameAttendances.CountAsync(a => a.Status == AttendanceStatus.Attended, ct);
        var attendanceRate = totalAttendance > 0 ? (int)Math.Round((double)attendedCount / totalAttendance * 100) : 100;

        return Ok(new
        {
            totalGames,
            activeGames,
            totalUsers,
            attendanceRate,
            pendingComplaints = await _context.Complaints.CountAsync(c => c.Status == ComplaintStatus.Pending, ct)
        });
    }
}
