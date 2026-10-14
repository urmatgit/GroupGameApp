using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

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
