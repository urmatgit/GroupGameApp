using System;

namespace GroupGame.Domain.Entities;

public class Venue : BaseEntity
{
    public Guid CityId { get; set; }
    public City City { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Metro { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string[] Facilities { get; set; } = Array.Empty<string>();
}
