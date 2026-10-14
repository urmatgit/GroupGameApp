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
public class VenuesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public VenuesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Venue>>> GetVenues([FromQuery] Guid? cityId, CancellationToken ct)
    {
        var query = _context.Venues.Include(v => v.City).AsQueryable();
        if (cityId.HasValue)
        {
            query = query.Where(v => v.CityId == cityId.Value);
        }

        var venues = await query.OrderBy(v => v.Name).ToListAsync(ct);
        return Ok(venues);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Venue>> GetVenue(Guid id, CancellationToken ct)
    {
        var venue = await _context.Venues.Include(v => v.City).FirstOrDefaultAsync(v => v.Id == id, ct);
        if (venue == null)
            return NotFound(new ProblemDetails { Title = "Not Found", Detail = "Площадка не найдена", Status = 404 });

        return Ok(venue);
    }
}
