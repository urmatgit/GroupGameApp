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
using GroupGame.Domain.Entities;

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/game-templates")]
public class GameTemplatesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public GameTemplatesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GameTemplate>>> GetMyTemplates(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var templates = await _context.GameTemplates
            .Include(t => t.Sport)
            .Include(t => t.Level)
            .Include(t => t.Venue)
            .Where(t => t.OrganizerId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        return Ok(templates);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<GameTemplate>> CreateTemplate([FromBody] GameTemplate template, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        template.Id = Guid.NewGuid();
        template.OrganizerId = userId;
        template.CreatedAt = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;
        template.IsActive = true;

        _context.GameTemplates.Add(template);

        // Auto-generate initial game instance for next week per Section 7
        var nextDate = DateTime.UtcNow.Date.AddDays(7).Add(template.StartTime);
        var initialGame = new Game
        {
            TemplateId = template.Id,
            OrganizerId = userId,
            SportId = template.SportId,
            LevelId = template.LevelId,
            VenueId = template.VenueId,
            Title = template.Name,
            StartDateTime = nextDate,
            EndDateTime = nextDate.AddMinutes(template.DurationMinutes),
            MaxPlayers = template.MaxPlayers,
            PriceKopecks = template.PriceKopecks,
            Description = template.Description,
            Rules = template.Rules,
            CancellationDeadlineHours = template.CancellationDeadlineHours,
            Status = Domain.Enums.GameStatus.Open
        };

        _context.Games.Add(initialGame);
        await _context.SaveChangesAsync(ct);

        return StatusCode(201, template);
    }

    [HttpPost("{id:guid}/pause")]
    [Authorize]
    public async Task<IActionResult> TogglePause(Guid id, CancellationToken ct)
    {
        var template = await _context.GameTemplates.FindAsync(new object[] { id }, ct);
        if (template == null)
            return NotFound();

        template.IsActive = !template.IsActive;
        template.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return Ok(new { isActive = template.IsActive });
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteTemplate(Guid id, CancellationToken ct)
    {
        var template = await _context.GameTemplates.FindAsync(new object[] { id }, ct);
        if (template == null)
            return NotFound();

        _context.GameTemplates.Remove(template);
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }
}
