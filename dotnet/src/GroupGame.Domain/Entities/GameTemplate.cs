using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

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
