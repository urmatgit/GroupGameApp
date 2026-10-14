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
public class CitiesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CitiesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<City>>> GetCities(CancellationToken ct)
    {
        var cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync(ct);
        return Ok(cities);
    }
}
