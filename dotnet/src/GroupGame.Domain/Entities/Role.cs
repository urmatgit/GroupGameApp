using System;
using System.Collections.Generic;
using GroupGame.Domain.Enums;

namespace GroupGame.Domain.Entities;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public GroupGame.Domain.Enums.UserRole Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
