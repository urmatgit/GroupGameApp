using System;

namespace GroupGame.Application.Contracts;

public record CreateVenueRequest(
    Guid CityId,
    string Name,
    string Address,
    string? Metro,
    double? Latitude,
    double? Longitude,
    string[] Facilities
);
