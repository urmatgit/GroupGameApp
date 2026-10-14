using System;
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
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public UsersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetMe(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        return await GetUserInternal(userId, ct);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateMe([FromBody] UserDto updateDto, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(new object[] { userId }, ct);
        if (user == null)
            return NotFound();

        user.FirstName = updateDto.FirstName;
        user.LastName = updateDto.LastName;
        user.Phone = updateDto.Phone;
        user.AvatarUrl = updateDto.AvatarUrl;
        user.CityId = updateDto.CityId;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return await GetUserInternal(userId, ct);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken ct)
    {
        return await GetUserInternal(id, ct);
    }

    private async Task<ActionResult<UserDto>> GetUserInternal(Guid userId, CancellationToken ct)
    {
        var user = await _context.Users
            .Include(u => u.City)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Пользователь не найден", Status = 404 });

        var attendances = await _context.GameAttendances.Where(a => a.UserId == userId).ToListAsync(ct);
        var ratings = await _context.Ratings.Where(r => r.ToUserId == userId).ToListAsync(ct);

        var attendedCount = attendances.Count(a => a.Status == Domain.Enums.AttendanceStatus.Attended);
        var noShowCount = attendances.Count(a => a.Status == Domain.Enums.AttendanceStatus.NoShow);
        var gamesPlayed = attendances.Count;
        var gamesOrganized = await _context.Games.CountAsync(g => g.OrganizerId == userId, ct);
        var avgRating = ratings.Count > 0 ? Math.Round(ratings.Average(r => r.Stars), 1) : 5.0;

        var roles = user.UserRoles.Select(r => r.Role.Name.ToString()).ToList();
        var stats = new UserStatsDto(gamesOrganized, gamesPlayed, attendedCount, noShowCount, avgRating, ratings.Count);

        return Ok(new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.AvatarUrl,
            user.Phone, user.CityId, user.City?.Name, roles, user.Status.ToString(),
            user.CreatedAt, stats
        ));
    }
}
