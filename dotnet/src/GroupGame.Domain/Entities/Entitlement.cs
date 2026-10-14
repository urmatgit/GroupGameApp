using System;

namespace GroupGame.Domain.Entities;

public class Entitlement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // e.g. CREATE_GAME
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
