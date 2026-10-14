using System;

namespace GroupGame.Domain.Entities;

public class UserSession : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string RefreshTokenHash { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}
