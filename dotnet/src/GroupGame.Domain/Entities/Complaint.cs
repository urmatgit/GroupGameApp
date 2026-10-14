using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

public class Complaint : BaseEntity
{
    public Guid FromUserId { get; set; }
    public User FromUser { get; set; } = null!;
    public Guid? TargetUserId { get; set; }
    public User? TargetUser { get; set; }
    public Guid? GameId { get; set; }
    public Game? Game { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ComplaintStatus Status { get; set; } = ComplaintStatus.Pending;
    public Guid? ResolvedByUserId { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
