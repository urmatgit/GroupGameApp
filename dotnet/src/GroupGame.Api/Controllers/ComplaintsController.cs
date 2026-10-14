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
using GroupGame.Domain.Enums;

namespace GroupGame.Api.Controllers;

[ApiController]
public class ComplaintsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ComplaintsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("api/complaints")]
    [Authorize]
    public async Task<ActionResult<Complaint>> CreateComplaint([FromBody] CreateComplaintRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var currentUserId))
            return Unauthorized();

        var complaint = new Complaint
        {
            FromUserId = currentUserId,
            TargetUserId = request.TargetUserId,
            GameId = request.GameId,
            Reason = request.Reason,
            Description = request.Description,
            Status = ComplaintStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Complaints.Add(complaint);
        await _context.SaveChangesAsync(ct);

        return StatusCode(201, complaint);
    }

    [HttpGet("api/admin/complaints")]
    [Authorize(Roles = "Administrator,Moderator")]
    public async Task<ActionResult<IEnumerable<Complaint>>> GetAdminComplaints(CancellationToken ct)
    {
        var complaints = await _context.Complaints
            .Include(c => c.FromUser)
            .Include(c => c.TargetUser)
            .Include(c => c.Game)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return Ok(complaints);
    }
}
