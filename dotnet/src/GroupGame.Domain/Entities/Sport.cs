using System;
using System.Collections.Generic;

namespace GroupGame.Domain.Entities;

public class Sport : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<SportLevel> Levels { get; set; } = new List<SportLevel>();
}
