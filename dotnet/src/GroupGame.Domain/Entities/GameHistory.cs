using System;

namespace GroupGame.Domain.Entities;

public class GameHistory : BaseEntity
{
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    public Guid? ActorUserId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string DetailsJson { get; set; } = "{}";
}
