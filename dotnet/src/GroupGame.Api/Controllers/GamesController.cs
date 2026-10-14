using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroupGame.Application.DTOs;
using GroupGame.Application.Services;

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly GameService _gameService;

    public GamesController(GameService gameService)
    {
        _gameService = gameService;
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
}
