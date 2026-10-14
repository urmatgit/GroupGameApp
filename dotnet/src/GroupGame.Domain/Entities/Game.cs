using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

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
