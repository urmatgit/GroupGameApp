using System;
using System.Collections.Generic;

namespace GroupGame.Domain.Entities;

public class City : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = "Россия";
    public ICollection<Venue> Venues { get; set; } = new List<Venue>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
