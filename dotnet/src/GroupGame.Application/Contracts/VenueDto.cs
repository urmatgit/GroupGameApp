using System;

namespace GroupGame.Application.Contracts;

public record VenueDto(
    Guid Id,
    Guid CityId,
    string CityName,
    string Name,
    string Address,
    string? Metro,
    double? Latitude,
    double? Longitude,
    string[] Facilities
);
