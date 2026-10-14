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
using GroupGame.Domain.Entities;

namespace GroupGame.Api.Controllers;

[ApiController]
public class RatingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public RatingsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("api/games/{gameId:guid}/ratings")]
    [Authorize]
    public async Task<ActionResult<Rating>> CreateRating(Guid gameId, [FromBody] CreateRatingRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var currentUserId))
            return Unauthorized();

        if (currentUserId == request.ToUserId)
            return BadRequest(new ProblemDetails { Title = "Bad Request", Detail = "Нельзя оценивать самого себя", Status = 400 });

        if (request.Stars < 1 || request.Stars > 5)
            return BadRequest(new ProblemDetails { Title = "Bad Request", Detail = "Оценка должна быть от 1 до 5 звёзд", Status = 400 });

        var game = await _context.Games.FindAsync(new object[] { gameId }, ct);
        if (game == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Игра не найдена", Status = 404 });

        // Unique pair check for this game (Section 12)
        var exists = await _context.Ratings.AnyAsync(
            r => r.GameId == gameId && r.FromUserId == currentUserId && r.ToUserId == request.ToUserId, ct);

        if (exists)
            return Conflict(new ProblemDetails { Title = "Conflict", Detail = "Вы уже оценили этого участника за данный матч", Status = 409 });

        var rating = new Rating
        {
            GameId = gameId,
            FromUserId = currentUserId,
            ToUserId = request.ToUserId,
            Stars = request.Stars,
            CreatedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(request.ReviewText))
        {
            rating.Review = new Review
            {
                ReviewText = request.ReviewText,
                CreatedAt = DateTime.UtcNow
            };
        }

        _context.Ratings.Add(rating);

        _context.Notifications.Add(new Notification
        {
            UserId = request.ToUserId,
            Type = "RATING_RECEIVED",
            Title = "Вам поставили оценку!",
            Message = $"Участник оценил вашу игру на {request.Stars} ⭐ за матч «{game.Title}».",
            GameId = gameId
        });

        await _context.SaveChangesAsync(ct);
        return StatusCode(201, rating);
    }

    [HttpGet("api/users/{userId:guid}/ratings")]
    public async Task<ActionResult<IEnumerable<Rating>>> GetUserRatings(Guid userId, CancellationToken ct)
    {
        var ratings = await _context.Ratings
            .Include(r => r.Review)
            .Include(r => r.FromUser)
            .Where(r => r.ToUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return Ok(ratings);
    }
}
