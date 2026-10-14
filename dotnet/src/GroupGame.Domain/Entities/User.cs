using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public Guid? CityId { get; set; }
    public City? City { get; set; }
    public UserAccountStatus Status { get; set; } = UserAccountStatus.Active;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserSport> UserSports { get; set; } = new List<UserSport>();
    public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
    public ICollection<Game> OrganizedGames { get; set; } = new List<Game>();
    public ICollection<GameParticipant> Participations { get; set; } = new List<GameParticipant>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<BlacklistEntry> BlacklistedUsers { get; set; } = new List<BlacklistEntry>();
}
