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

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AttendanceController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameAttendance>>> GetAttendance(Guid gameId, CancellationToken ct)
    {
        var records = await _context.GameAttendances
            .Include(a => a.User)
            .Where(a => a.GameId == gameId)
            .ToListAsync(ct);

        return Ok(records);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> MarkAttendance(Guid gameId, [FromBody] MarkAttendanceRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var currentUserId))
            return Unauthorized();

        var game = await _context.Games.FindAsync(new object[] { gameId }, ct);
        if (game == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Матч не найден", Status = 404 });

        // Organizer or Admin check
        var isAdmin = User.IsInRole("Administrator");
        if (game.OrganizerId != currentUserId && !isAdmin)
            return StatusCode(403, new ProblemDetails { Title = "Forbidden", Detail = "Только организатор может отмечать посещаемость", Status = 403 });

        foreach (var item in request.Records)
        {
            var existing = await _context.GameAttendances
                .FirstOrDefaultAsync(a => a.GameId == gameId && a.UserId == item.UserId, ct);

            if (existing != null)
            {
                existing.Status = item.Status;
                existing.MarkedAt = DateTime.UtcNow;
            }
            else
            {
                _context.GameAttendances.Add(new GameAttendance
                {
                    GameId = gameId,
                    UserId = item.UserId,
                    MarkedByUserId = currentUserId,
                    Status = item.Status,
                    MarkedAt = DateTime.UtcNow
                });
            }

            // Notification to user
            _context.Notifications.Add(new Notification
            {
                UserId = item.UserId,
                Type = "ATTENDANCE_MARKED",
                Title = "Отметка посещаемости",
                Message = $"Организатор зафиксировал статус: {item.Status}",
                GameId = gameId
            });
        }

        await _context.SaveChangesAsync(ct);
        return Ok(new { success = true, count = request.Records.Count });
    }
}
