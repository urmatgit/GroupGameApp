using System;

namespace GroupGame.Domain.Entities;

public class SportLevel
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SportId { get; set; }
    public Sport Sport { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 1;
}
