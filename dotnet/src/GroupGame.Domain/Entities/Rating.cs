using System;

namespace GroupGame.Domain.Entities;

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
