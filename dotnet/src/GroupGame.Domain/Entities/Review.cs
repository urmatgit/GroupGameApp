using System;

namespace GroupGame.Domain.Entities;

public class Review : BaseEntity
{
    public Guid RatingId { get; set; }
    public Rating Rating { get; set; } = null!;
    public string ReviewText { get; set; } = string.Empty;
}
