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
using GroupGame.Application.DTOs;
using GroupGame.Application.Services;
using GroupGame.Domain.Entities;
using GroupGame.Domain.Enums;

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly GameService _gameService;
    private readonly IApplicationDbContext _context;

    public GamesController(GameService gameService, IApplicationDbContext context)
    {
        _gameService = gameService;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetGames([FromQuery] GameFilterRequest filter, CancellationToken ct)
    {
        var query = _context.Games
            .Include(g => g.Organizer)
            .Include(g => g.Sport)
            .Include(g => g.Level)
            .Include(g => g.Venue)
            .Include(g => g.Participants).ThenInclude(p => p.User)
            .AsQueryable();

        if (filter.SportId.HasValue)
            query = query.Where(g => g.SportId == filter.SportId.Value);

        if (filter.LevelId.HasValue)
            query = query.Where(g => g.LevelId == filter.LevelId.Value);

        if (filter.FreeOnly)
            query = query.Where(g => g.PriceKopecks == 0);

        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var q = filter.SearchQuery.ToLower();
            query = query.Where(g => g.Title.ToLower().Contains(q) || g.Venue.Name.ToLower().Contains(q));
        }

        var games = await query
            .OrderBy(g => g.StartDateTime)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var dtos = games.Select(g => new GameDto(
            g.Id, g.TemplateId, g.OrganizerId,
            $"{g.Organizer.FirstName} {g.Organizer.LastName}",
            g.Organizer.AvatarUrl, 4.9,
            g.SportId, g.Sport.Name,
            g.LevelId, g.Level.Name,
            g.Title, g.VenueId, g.Venue.Name, g.Venue.Address,
            g.Venue.Latitude, g.Venue.Longitude,
            g.StartDateTime, g.EndDateTime, g.TimeZone,
            g.MaxPlayers, g.PriceKopecks, g.Description, g.Rules,
            g.CancellationDeadlineHours, g.Status,
            g.Participants.Count(p => p.Status == ParticipantStatus.Main),
            g.Participants.Count(p => p.Status == ParticipantStatus.Waitlist),
            g.Participants.Select(p => new GameParticipantDto(
                p.Id, p.UserId, p.User.FirstName, p.User.LastName, p.User.AvatarUrl,
                5.0, p.Status, p.QueuePosition, p.JoinedAt
            )).ToList()
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GameDto>> GetGameById(Guid id, CancellationToken ct)
    {
        var g = await _context.Games
            .Include(g => g.Organizer)
            .Include(g => g.Sport)
            .Include(g => g.Level)
            .Include(g => g.Venue)
            .Include(g => g.Participants).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(g => g.Id == id, ct);

        if (g == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Игра не найдена", Status = 404 });

        var dto = new GameDto(
            g.Id, g.TemplateId, g.OrganizerId,
            $"{g.Organizer.FirstName} {g.Organizer.LastName}",
            g.Organizer.AvatarUrl, 4.9,
            g.SportId, g.Sport.Name,
            g.LevelId, g.Level.Name,
            g.Title, g.VenueId, g.Venue.Name, g.Venue.Address,
            g.Venue.Latitude, g.Venue.Longitude,
            g.StartDateTime, g.EndDateTime, g.TimeZone,
            g.MaxPlayers, g.PriceKopecks, g.Description, g.Rules,
            g.CancellationDeadlineHours, g.Status,
            g.Participants.Count(p => p.Status == ParticipantStatus.Main),
            g.Participants.Count(p => p.Status == ParticipantStatus.Waitlist),
            g.Participants.Select(p => new GameParticipantDto(
                p.Id, p.UserId, p.User.FirstName, p.User.LastName, p.User.AvatarUrl,
                5.0, p.Status, p.QueuePosition, p.JoinedAt
            )).ToList()
        );

        return Ok(dto);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<GameDto>> CreateGame([FromBody] CreateGameRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var game = new Game
        {
            OrganizerId = userId,
            SportId = request.SportId,
            LevelId = request.LevelId,
            VenueId = request.VenueId,
            Title = request.Title,
            StartDateTime = request.StartDateTime,
            EndDateTime = request.EndDateTime,
            TimeZone = request.TimeZone ?? "Europe/Moscow",
            MaxPlayers = request.MaxPlayers,
            PriceKopecks = request.PriceKopecks,
            Description = request.Description,
            Rules = request.Rules,
            CancellationDeadlineHours = request.CancellationDeadlineHours,
            TemplateId = request.TemplateId,
            Status = GameStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Organizer is automatically main participant #1
        game.Participants.Add(new GameParticipant
        {
            UserId = userId,
            Status = ParticipantStatus.Main,
            JoinedAt = DateTime.UtcNow
        });

        _context.Games.Add(game);
        await _context.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetGameById), new { id = game.Id }, game);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateGame(Guid id, [FromBody] CreateGameRequest request, CancellationToken ct)
    {
        var game = await _context.Games.FindAsync(new object[] { id }, ct);
        if (game == null)
            return NotFound();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId) || (game.OrganizerId != userId && !User.IsInRole("Administrator")))
            return StatusCode(403);

        game.Title = request.Title;
        game.Description = request.Description;
        game.Rules = request.Rules;
        game.MaxPlayers = request.MaxPlayers;
        game.PriceKopecks = request.PriceKopecks;
        game.CancellationDeadlineHours = request.CancellationDeadlineHours;
        game.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelGame(Guid id, [FromBody] string reason, CancellationToken ct)
    {
        var game = await _context.Games
            .Include(g => g.Participants)
            .FirstOrDefaultAsync(g => g.Id == id, ct);

        if (game == null)
            return NotFound();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId) || (game.OrganizerId != userId && !User.IsInRole("Administrator")))
            return StatusCode(403);

        game.Status = GameStatus.Cancelled;
        game.UpdatedAt = DateTime.UtcNow;

        // Notify participants
        foreach (var p in game.Participants.Where(p => p.Status == ParticipantStatus.Main || p.Status == ParticipantStatus.Waitlist))
        {
            _context.Notifications.Add(new Notification
            {
                UserId = p.UserId,
                Type = "GAME_CANCELLED",
                Title = "Игра отменена",
                Message = $"Игра «{game.Title}» отменена организатором. Причина: {reason}",
                GameId = game.Id
            });
        }

        await _context.SaveChangesAsync(ct);
        return Ok(new { success = true, status = "Cancelled" });
    }

    [HttpPost("{id:guid}/join")]
    [Authorize]
    public async Task<ActionResult<JoinGameResultDto>> JoinGame(Guid id, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        try
        {
            var result = await _gameService.JoinGameAsync(id, userId, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ProblemDetails { Title = "Forbidden", Detail = ex.Message, Status = 403 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Bad Request", Detail = ex.Message, Status = 400 });
        }
    }

    [HttpPost("{id:guid}/leave")]
    [Authorize]
    public async Task<ActionResult<LeaveGameResultDto>> LeaveGame(Guid id, [FromBody] LeaveGameRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        try
        {
            var result = await _gameService.LeaveGameAsync(id, userId, request.Reason, request.Force, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = ex.Message, Status = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Bad Request", Detail = ex.Message, Status = 400 });
        }
    }

    [HttpGet("{id:guid}/participants")]
    public async Task<ActionResult<IEnumerable<GameParticipantDto>>> GetParticipants(Guid id, CancellationToken ct)
    {
        var participants = await _context.GameParticipants
            .Include(p => p.User)
            .Where(p => p.GameId == id)
            .OrderBy(p => p.Status)
            .ThenBy(p => p.QueuePosition)
            .ToListAsync(ct);

        var dtos = participants.Select(p => new GameParticipantDto(
            p.Id, p.UserId, p.User.FirstName, p.User.LastName, p.User.AvatarUrl,
            5.0, p.Status, p.QueuePosition, p.JoinedAt
        )).ToList();

        return Ok(dtos);
    }
}
