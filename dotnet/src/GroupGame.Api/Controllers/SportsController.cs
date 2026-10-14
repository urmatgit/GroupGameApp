using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroupGame.Application.Common.Interfaces;
using GroupGame.Domain.Entities;

namespace GroupGame.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SportsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SportsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sport>>> GetSports(CancellationToken ct)
    {
        var sports = await _context.Sports
            .Include(s => s.Levels.OrderBy(l => l.SortOrder))
            .Where(s => s.IsActive)
            .ToListAsync(ct);

        return Ok(sports);
    }

    [HttpGet("{id:guid}/levels")]
    public async Task<ActionResult<IEnumerable<SportLevel>>> GetLevels(Guid id, CancellationToken ct)
    {
        var levels = await _context.SportLevels
            .Where(l => l.SportId == id)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(ct);

        return Ok(levels);
    }
}
