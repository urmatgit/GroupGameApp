using System;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

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
