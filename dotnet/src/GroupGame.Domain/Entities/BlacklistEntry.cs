using System;

namespace GroupGame.Domain.Entities;

public class BlacklistEntry : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public User OwnerUser { get; set; } = null!;
    public Guid BlockedUserId { get; set; }
    public User BlockedUser { get; set; } = null!;
    public string? Reason { get; set; }
}
