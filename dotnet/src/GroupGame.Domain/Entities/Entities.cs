using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class City : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = "Россия";
    public ICollection<Venue> Venues { get; set; } = new List<Venue>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

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

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public UserRole Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

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

public class Sport : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<SportLevel> Levels { get; set; } = new List<SportLevel>();
}

public class SportLevel
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SportId { get; set; }
    public Sport Sport { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 1;
}

public class UserSport
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid SportId { get; set; }
    public Sport Sport { get; set; } = null!;
    public Guid LevelId { get; set; }
    public SportLevel Level { get; set; } = null!;
}

public class Venue : BaseEntity
{
    public Guid CityId { get; set; }
    public City City { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Metro { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string[] Facilities { get; set; } = Array.Empty<string>();
}

public class GameTemplate : BaseEntity
{
    public Guid OrganizerId { get; set; }
    public User Organizer { get; set; } = null!;
    public Guid SportId { get; set; }
    public Sport Sport { get; set; } = null!;
    public Guid LevelId { get; set; }
    public SportLevel Level { get; set; } = null!;
    public Guid VenueId { get; set; }
    public Venue Venue { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; } = 120;
    public RecurrenceType RecurrenceType { get; set; } = RecurrenceType.Weekly;
    public int[] DaysOfWeek { get; set; } = Array.Empty<int>(); // 1=Mon .. 7=Sun
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int MaxPlayers { get; set; } = 12;
    public int PriceKopecks { get; set; } = 0;
    public string Description { get; set; } = string.Empty;
    public string Rules { get; set; } = string.Empty;
    public int CancellationDeadlineHours { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Game> GeneratedGames { get; set; } = new List<Game>();
}

public class Game : BaseEntity
{
    public Guid? TemplateId { get; set; }
    public GameTemplate? Template { get; set; }
    public Guid OrganizerId { get; set; }
    public User Organizer { get; set; } = null!;
    public Guid SportId { get; set; }
    public Sport Sport { get; set; } = null!;
    public Guid LevelId { get; set; }
    public SportLevel Level { get; set; } = null!;
    public Guid VenueId { get; set; }
    public Venue Venue { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; } // UTC
    public DateTime EndDateTime { get; set; }   // UTC
    public string TimeZone { get; set; } = "Europe/Moscow";
    public int MaxPlayers { get; set; } = 12;
    public int PriceKopecks { get; set; } = 0;
    public string Description { get; set; } = string.Empty;
    public string Rules { get; set; } = string.Empty;
    public int CancellationDeadlineHours { get; set; } = 3;
    public GameStatus Status { get; set; } = GameStatus.Open;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<GameParticipant> Participants { get; set; } = new List<GameParticipant>();
    public ICollection<GameAttendance> AttendanceRecords { get; set; } = new List<GameAttendance>();
    public ICollection<GameHistory> Histories { get; set; } = new List<GameHistory>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}

public class GameParticipant : BaseEntity
{
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public ParticipantStatus Status { get; set; } = ParticipantStatus.Main;
    public int? QueuePosition { get; set; } // 1, 2, 3 for Waitlist FIFO
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
}

public class GameAttendance : BaseEntity
{
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid MarkedByUserId { get; set; }
    public User MarkedByUser { get; set; } = null!;
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Attended;
    public DateTime MarkedAt { get; set; } = DateTime.UtcNow;
}

public class GameHistory : BaseEntity
{
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    public Guid? ActorUserId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string DetailsJson { get; set; } = "{}";
}

public class Rating : BaseEntity
{
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    public Guid FromUserId { get; set; }
    public User FromUser { get; set; } = null!;
    public Guid ToUserId { get; set; }
    public User ToUser { get; set; } = null!;
    public int Stars { get; set; } // 1..5
    public Review? Review { get; set; }
}

public class Review : BaseEntity
{
    public Guid RatingId { get; set; }
    public Rating Rating { get; set; } = null!;
    public string ReviewText { get; set; } = string.Empty;
}

public class BlacklistEntry : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public User OwnerUser { get; set; } = null!;
    public Guid BlockedUserId { get; set; }
    public User BlockedUser { get; set; } = null!;
    public string? Reason { get; set; }
}

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

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? GameId { get; set; }
    public bool IsRead { get; set; } = false;
}

public class Entitlement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. CREATE_GAME
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int PriceKopecks { get; set; } = 0;
    public string Period { get; set; } = "month";
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<PlanEntitlement> PlanEntitlements { get; set; } = new List<PlanEntitlement>();
}

public class PlanEntitlement
{
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public Guid EntitlementId { get; set; }
    public Entitlement Entitlement { get; set; } = null!;
}

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public string Status { get; set; } = "Active";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool AutoRenew { get; set; } = true;
}

public class SubscriptionUsage : BaseEntity
{
    public Guid SubscriptionId { get; set; }
    public string EntitlementCode { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? OldValueJson { get; set; }
    public string? NewValueJson { get; set; }
    public string? IpAddress { get; set; }
}
