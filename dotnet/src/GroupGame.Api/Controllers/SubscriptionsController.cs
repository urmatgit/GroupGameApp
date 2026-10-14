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
public class SubscriptionsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SubscriptionsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("plans")]
    public async Task<ActionResult<IEnumerable<SubscriptionPlan>>> GetPlans(CancellationToken ct)
    {
        var plans = await _context.SubscriptionPlans
            .Include(p => p.PlanEntitlements).ThenInclude(pe => pe.Entitlement)
            .OrderBy(p => p.PriceMonthlyKopecks)
            .ToListAsync(ct);

        return Ok(plans);
    }
}
